import importlib.util
import os
import pathlib

from hexalog.adapters.cli_logger import ColorfulCLILogger
from huggingface_hub import from_pretrained_keras, hf_hub_download, login

from cry_baby.app.adapters.repositories.csv_repo import CSVRepo
from cry_baby.app.core.ports import Repository
from cry_baby.pkg.audio_file_client.adapters.librosa_client import LibrosaClient
from cry_baby.pkg.audio_file_client.core.domain import (
    MelSpectrogramPreprocessingSettings,
)


def tensorflow_available():
    tensorflow_spec = importlib.util.find_spec("tensorflow")
    return tensorflow_spec is not None


def tflite_runtime_available():
    tflite_spec = importlib.util.find_spec("tflite_runtime")
    return tflite_spec is not None


def test_audio_file(audio_file_path: pathlib.Path, classifier, logger: ColorfulCLILogger, audio_client: LibrosaClient):
    """Test the classifier with a specific audio file"""
    logger.info(f"Testing audio file: {audio_file_path}")
    
    if not audio_file_path.exists():
        logger.error(f"Audio file not found: {audio_file_path}")
        return
    
    try:
        # Get the duration of the audio file
        duration = audio_client.get_duration(
            audio_file_path, 
            hop_length=512, 
            sampling_rate_hz=16000
        )
        logger.info(f"Audio file duration: {duration:.2f} seconds")
        
        # If the audio file is longer than 4 seconds, we need to crop it into segments
        segment_duration = 4.0
        num_segments = int(duration // segment_duration)
        
        if num_segments == 0:
            logger.warning("Audio file is shorter than 4 seconds, will pad it")
            # Pad the audio file to 4 seconds
            cropped_path = audio_client.pad(audio_file_path, segment_duration)
            prediction = classifier.classify(cropped_path)
            _log_prediction(prediction, 0, logger)
            return prediction
        
        logger.info(f"Processing {num_segments} segments of {segment_duration} seconds each")
        
        predictions = []
        for i in range(num_segments):
            start_time = i * segment_duration
            end_time = start_time + segment_duration
            
            # Crop the audio file to get a 4-second segment
            cropped_path = audio_client.crop(audio_file_path, start_time, end_time)
            
            try:
                prediction = classifier.classify(cropped_path)
                predictions.append(prediction)
                _log_prediction(prediction, i, logger)
                
                # Clean up the temporary cropped file
                if cropped_path.exists() and cropped_path != audio_file_path:
                    cropped_path.unlink()
                    
            except Exception as e:
                logger.error(f"Error processing segment {i}: {e}")
                continue
        
        if predictions:
            avg_prediction = sum(predictions) / len(predictions)
            max_prediction = max(predictions)
            logger.info(f"Average prediction across all segments: {avg_prediction:.4f}")
            logger.info(f"Maximum prediction across all segments: {max_prediction:.4f}")
            
            # Save results to repository
            repository = CSVRepo(csv_file_path=pathlib.Path("test_predictions.csv"))
            repository.save(audio_file_path, avg_prediction)
            logger.info("Predictions saved to test_predictions.csv")
            
            return avg_prediction
        else:
            logger.error("No valid predictions obtained")
            return None
        
    except Exception as e:
        logger.error(f"Error classifying audio file: {e}")
        return None


def _log_prediction(prediction: float, segment_index: int, logger: ColorfulCLILogger):
    """Log the prediction result for a segment"""
    if prediction > 0.5:
        result = "CRYING DETECTED"
    else:
        result = "NO CRYING DETECTED"
    
    logger.info(f"Segment {segment_index}: Prediction = {prediction:.4f} ({result})")


def main():
    logger = ColorfulCLILogger()
    
    # Path to the test audio file
    audio_file_path = pathlib.Path("cry_baby/baby-crying-4_160bpm.wav")
    #audio_file_path = pathlib.Path("cry_baby/baby-talk-aw_72bpm_G_minor.wav")
    
    librosa_audio_file_client = LibrosaClient()

    mel_spectrogram_preprocessing_settings = MelSpectrogramPreprocessingSettings(
        sampling_rate_hz=16000,
        number_of_mel_bands=128,
        duration_seconds=4,
        hop_length=512,
    )

    # Initialize classifier based on available TensorFlow version
    if tensorflow_available():
        from cry_baby.app.adapters.classifiers.tensorflow import TensorFlowClassifier

        model = from_pretrained_keras("ericcbonet/cry-baby")
        classifier = TensorFlowClassifier(
            model=model,
            audio_file_client=librosa_audio_file_client,
            mel_spectrogram_preprocessing_settings=mel_spectrogram_preprocessing_settings,
        )
        logger.info("Using TensorFlow classifier.")
    elif tflite_runtime_available():
        from cry_baby.app.adapters.classifiers.tf_lite import TFLiteClassifier

        token = os.getenv("HUGGING_FACE_TOKEN")
        if not token:
            logger.error("HUGGING_FACE_TOKEN does not exist in the environment")
            return
        login(token=token)
        model_path = hf_hub_download(
            repo_id="ericcbonet/cry_baby_lite", filename="model.tflite"
        )
        classifier = TFLiteClassifier(
            mel_spectrogram_preprocessing_settings,
            librosa_audio_file_client,
            pathlib.Path(model_path),
        )
        logger.info("Using TensorFlow Lite classifier.")
    else:
        logger.error("No compatible TensorFlow or TensorFlow Lite installation found.")
        return

    # Test the audio file
    test_audio_file(audio_file_path, classifier, logger, librosa_audio_file_client)


if __name__ == "__main__":
    main() 
import tensorflow as tf
import tensorflow_hub as hub
import librosa

# Load model
model = hub.load("https://tfhub.dev/google/yamnet/1")

# Load audio
audio_file = '/home/bragadeesh/Projects/hackathon/blabber-ai/voice_vibe_estimator/cry-baby/cry_baby/baby-crying-4_160bpm.wav'
#audio_file = '/home/bragadeesh/Projects/hackathon/blabber-ai/voice_vibe_estimator/cry-baby/cry_baby/baby-talk-aw_72bpm_G_minor.wav'


wav_data, sr = librosa.load(audio_file, sr=16000)

# Predict
scores, embeddings, spectrogram = model(wav_data)
predicted_class = scores.numpy().mean(axis=0).argmax()

# Load labels
labels_path = tf.keras.utils.get_file(
    'yamnet_label_list.txt',
    'https://raw.githubusercontent.com/tensorflow/models/master/research/audioset/yamnet/yamnet_class_map.csv'
)

import pandas as pd
labels_df = pd.read_csv(labels_path)
label = labels_df.iloc[predicted_class]['display_name']

print(f"Predicted label: {label}")

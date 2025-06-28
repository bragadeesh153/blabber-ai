import queue
import threading
from typing import Optional

import hexalog.ports

from cry_baby.app.core import ports


class CryBabyService(ports.Service):
    def __init__(
        self,
        logger: hexalog.ports.Logger,
        classifier: ports.Classifier,
        recorder: ports.Recorder,
        repository: ports.Repository,
    ):
        self.logger = logger
        self.classifier = classifier
        self.recorder = recorder
        self.repository = repository

    def evaluate_from_microphone(
        self,
    ) -> float:
        """
        Record audio and classify it
        return the probability that the audio contains a baby crying
        """
        self.logger.info("Service beginning to evaluate audio from microphone")
        audio_file = self.recorder.record()
        return self.classifier.classify(audio_file)

    def continously_evaluate_from_microphone(self) -> Optional[queue.Queue]:
        file_written_notification_queue = self.recorder.continuously_record()
        signal_thread = threading.Thread(
            target=self._handle_files_written,
            args=(file_written_notification_queue, self.classifier),
        )
        signal_thread.daemon = True
        signal_thread.start()
        self.logger.info(
            "Service beginning to continuously evaluate audio from microphone"
        )
        self.thread = signal_thread

    def _handle_files_written(
        self, file_written_queue: queue.Queue, classifier: ports.Classifier
    ):
        while True:
            file_path = file_written_queue.get()
            self.logger.debug(f"File written: {file_path}")
            prediction = classifier.classify(file_path)
            self.logger.debug(f"Prediction: {prediction}")
            self.repository.save(file_path, prediction)
            
            # Print user-friendly crying status
            self._print_crying_status(prediction)

    def _print_crying_status(self, prediction: float):
        """
        Print a user-friendly message about whether the baby is crying
        """
        if prediction > 0.8:
            self.logger.info(f"😭 CRYING DETECTED! (Probability: {prediction:.1%}) - Please check on your baby!")
        elif prediction > 0.6:
            self.logger.info(f"😢 Baby might be crying (Probability: {prediction:.1%}) - Monitor closely")
        elif prediction > 0.4:
            self.logger.info(f"🤔 Some crying sounds detected (Probability: {prediction:.1%})")
        elif prediction > 0.2:
            self.logger.info(f"😊 Baby seems calm (Probability: {prediction:.1%})")
        else:
            self.logger.info(f"😴 Baby is very calm (Probability: {prediction:.1%})")

    def stop_continuous_evaluation(self):
        self.recorder.tear_down()
        self.logger.info("Service stopping continuous evaluation")
        print(self.thread)

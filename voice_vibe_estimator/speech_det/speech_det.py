import webrtcvad
import wave

# Load audio
wav_file = '/home/bragadeesh/Projects/hackathon/blabber-ai/voice_vibe_estimator/cry-baby/cry_baby/baby-crying-4_160bpm.wav'
wf = wave.open(wav_file, 'rb')
sample_rate = wf.getframerate()
frames = wf.readframes(wf.getnframes())

# Init VAD
vad = webrtcvad.Vad()
vad.set_mode(2)  # 0 = aggressive (less sensitive), 3 = very sensitive

# Frame size for VAD (e.g., 30ms)
frame_duration = 30
frame_size = int(sample_rate * frame_duration / 1000) * 2
has_speech = False

# Scan frames
for i in range(0, len(frames), frame_size):
    chunk = frames[i:i+frame_size]
    if len(chunk) < frame_size:
        break
    if vad.is_speech(chunk, sample_rate):
        has_speech = True
        print("Speech detected!")
        break

if not has_speech:
    print("No speech detected.")

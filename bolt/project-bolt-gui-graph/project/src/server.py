from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from elevenlabs import ElevenLabs, save
from dotenv import load_dotenv
# from pydub import AudioSegment

import os
import io

load_dotenv()



app = FastAPI()

# Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# background = AudioSegment.from_file("bg-music.mp3")
# Set ElevenLabs API key
client = ElevenLabs(api_key="sk_6a75925d020f13e1567b63c41745a57faa2fa91238ccde76")

@app.get("/api/health")
async def health():
    return {"status": "ok"}

    
@app.post("/api/tts")
async def tts(request: Request):
    body = await request.json()
    text = body.get("text")

    print(f"🟣 Received text: {text}")

    lullaby = """
Hush, little baby... don't say a word...

Mama's gonna buy you... a mockingbird...

And if that mockingbird... don't sing...

Mama's gonna buy you... a diamond ring...
"""

    if not text:
        return {"error": "Missing 'text'"}

#v8DWAeuEGQSfwxqdH9t2
    audio = client.text_to_speech.convert(
        voice_id="xgJU9KU8YgpWCGZnQ7SP",
        model_id="eleven_multilingual_v2",
        text=lullaby,
        output_format="mp3_44100_128", voice_settings={
        "stability": 0.2,
        "similarity_boost": 0.7,
        "style": 1.0, # adds warmth/emotion
        "use_speaker_boost": True
    }
    )

    # voice = AudioSegment.from_file(io.BytesIO(b"".join(audio)), format="mp3")

    # Match lengths — loop or trim background to fit
    # bg = background[:len(voice)] if len(background) > len(voice) else background * (len(voice) // len(background) + 1)
    # bg = bg[:len(voice)] - 8  # Lower background volume

    # Mix voice + background
    # combined = bg.overlay(voice)

    # buffer = io.BytesIO()
    # combined.export(buffer, format="mp3")
    # buffer.seek(0)

    # return StreamingResponse(buffer, media_type="audio/mpeg")
    audio_bytes = b"".join(audio)  # 🔥 fix the generator issue

    return StreamingResponse(io.BytesIO(audio_bytes), media_type="audio/mpeg")
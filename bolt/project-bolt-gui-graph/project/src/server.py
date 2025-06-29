from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from elevenlabs import ElevenLabs, save
from dotenv import load_dotenv
from fastapi.testclient import TestClient
# from pydub import AudioSegment

import os
import io
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any

load_dotenv()

# Shared global variables for happiness data
happiness_data: List[Dict[str, Any]] = [60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0, 60.0]
current_happiness: int = 65
last_update_time: int = int(time.time() * 1000)


# Initialize with dummy data
def initialize_dummy_data():
    global happiness_data, current_happiness, last_update_time
    
    data = []
    now = datetime.now()
    
    '''
    for i in range(12):
        # Go back in time by i hours
        timestamp = now - timedelta(hours=i)
        time_str = timestamp.strftime("%H:%M")
        
        # Generate realistic happiness values based on time of day
        hour = timestamp.hour
        
        if hour >= 22 or hour <= 6:
            # Night time - mostly calm/sleeping, some crying
            value = 40 + (i % 3) * 15  # 40, 55, 70
        elif hour >= 7 and hour <= 9:
            # Morning - generally happy
            value = 60 + (i % 3) * 20  # 60, 80, 100
        elif hour >= 12 and hour <= 14:
            # Afternoon - mixed
            value = 30 + (i % 4) * 20  # 30, 50, 70, 90
        elif hour >= 17 and hour <= 19:
            # Evening - mostly calm
            value = 50 + (i % 3) * 15  # 50, 65, 80
        else:
            # Other times - varied
            value = 35 + (i % 5) * 15  # 35, 50, 65, 80, 95
        
        data.append({
            "id": str(int(timestamp.timestamp() * 1000)),
            "time": time_str,
            "value": value,
            "timestamp": int(timestamp.timestamp() * 1000)
        })
    '''
    
    # Reverse to show oldest first
    data.reverse()
    
    happiness_data = data
    current_happiness = 65
    last_update_time = int(time.time() * 1000)

# Initialize with dummy data on startup
initialize_dummy_data()

app = FastAPI()
api_client = TestClient(app)

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

@app.get("/api/happiness-data")
async def get_happiness_data():
    """Return current happiness data from shared variables"""
    global happiness_data, current_happiness, last_update_time

    #print(f"🟣 Happiness Index in GUI: {current_happiness}")
    
    return {
        "data": happiness_data,
        "currentHappiness": current_happiness,
        "timestamp": last_update_time
    }

@app.post("/api/update-happiness")
async def update_happiness(request: Request):
    """Receive happiness data from voice sentiment analysis thread"""
    global happiness_data, current_happiness, last_update_time
    
    try:
        body = await request.json()
        
        # Extract data from request
        new_happiness = body.get("happiness", current_happiness)
        sentiment_score = body.get("sentiment_score", 0.5)  # 0-1 scale
        confidence = body.get("confidence", 0.8)  # 0-1 scale
        timestamp = body.get("timestamp", int(time.time() * 1000))
        baby_status = body.get("description", "Monitoring...")
        
        # Convert sentiment score to happiness value (0-100)
        # sentiment_score: 0 = very negative, 1 = very positive
        new_happiness_value = int(sentiment_score * 100)
        
        # Apply confidence weighting
        weighted_happiness = int(new_happiness_value * confidence + current_happiness * (1 - confidence))
        
        # Ensure value is within bounds
        weighted_happiness = max(0, min(100, weighted_happiness))
        
        # Create new data point
        time_str = datetime.fromtimestamp(timestamp / 1000).strftime("%H:%M")
        new_data_point = {
            "id": str(timestamp),
            "time": time_str,
            "value": weighted_happiness,
            "timestamp": timestamp
        }
        
        # Update shared variables
        current_happiness = weighted_happiness
        last_update_time = timestamp
        
        # Add new data point to the list
        happiness_data.append(new_data_point)

        print(f"🟣 New Happiness Index: {new_data_point['value']}")
        print(f"🟣 Baby Status: {baby_status}")
        
        # Keep only the last 12 data points (sliding window)
        if len(happiness_data) > 12:
            happiness_data = happiness_data[-12:]
        
        #print(f"🟣 Updated happiness: {weighted_happiness} (sentiment: {sentiment_score}, confidence: {confidence})")

        if sentiment_score < 0.2:
            print(f"🟣 NOOO CRYYYYYYY: {baby_status}")

        #code to call post api/tts for elevenlabs

            text_to_speak = "The baby seems upset."

            try:
                response = api_client.post("/api/tts", json={"text": text_to_speak})

                if response.status_code != 200:
                    print(f"❌ TTS error: {response.status_code} - {response.text}")
            except Exception as err:
                print(f"❌ Error calling TTS: {err}")            
    except Exception as e:
        print(f"❌ Error calling TTS internally: {e}")          
        
        return {
            "status": "success",
            "happiness": weighted_happiness,
            "data_points": len(happiness_data)
        }
        
    except Exception as e:
        print(f"❌ Error updating happiness data: {e}")
        return {"status": "error", "message": str(e)}

@app.post("/api/tts")
async def tts(request: Request):
    body = await request.json()
    text = body.get("text")

    print(f"🟣 Received text: {text}")

    lullaby = """Hush little Timmy..... 
                Hush little Timmy.....
                Hush little Timmy....
                """

    if not text:
        return {"error": "Missing 'text'"}

#v8DWAeuEGQSfwxqdH9t2
    audio = client.text_to_speech.convert(
        #voice_id="xgJU9KU8YgpWCGZnQ7SP",
        voice_id = "esH01SQ9lEwoWQCbfEg2",
        model_id="eleven_multilingual_v2",
        text=lullaby,
        output_format="mp3_44100_128", voice_settings={
        "stability": 0.2,
        "similarity_boost": 0.7,
        "style": 1.0, # adds warmth/emotion
        "speed": 0.8,
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
import requests
import time
import threading
import random
from datetime import datetime

class VoiceSentimentAnalyzer:
    def __init__(self, server_url="http://127.0.0.1:8001"):
        self.server_url = server_url
        self.running = False
        self.thread = None
        
    def analyze_voice_sentiment(self):
        """
        Simulate voice sentiment analysis
        In a real implementation, this would:
        1. Record audio from microphone
        2. Process the audio to extract features
        3. Use a sentiment analysis model to determine mood
        4. Return sentiment score and confidence
        """
        # Simulate different sentiment scenarios
        scenarios = [
            {"sentiment": 0.9, "confidence": 0.95, "description": "Very happy/laughing"},
            {"sentiment": 0.7, "confidence": 0.85, "description": "Happy/positive"},
            {"sentiment": 0.5, "confidence": 0.75, "description": "Neutral/calm"},
            {"sentiment": 0.3, "confidence": 0.80, "description": "Slightly negative"},
            {"sentiment": 0.1, "confidence": 0.90, "description": "Crying/very upset"},
            {"sentiment": 0.6, "confidence": 0.70, "description": "Mixed emotions"},
        ]
        
        # Randomly select a scenario (in real implementation, this would be based on actual voice analysis)
        scenario = random.choice(scenarios)
        
        return {
            "sentiment_score": scenario["sentiment"],
            "confidence": scenario["confidence"],
            "description": scenario["description"]
        }
    
    def send_happiness_update(self, sentiment_data):
        """Send happiness data to the server"""
        try:
            payload = {
                "sentiment_score": sentiment_data["sentiment_score"],
                "confidence": sentiment_data["confidence"],
                "timestamp": int(time.time() * 1000),
                "description": sentiment_data["description"]
            }
            
            response = requests.post(
                f"{self.server_url}/api/update-happiness",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Sent happiness update: {sentiment_data['description']} (score: {sentiment_data['sentiment_score']:.2f}, confidence: {sentiment_data['confidence']:.2f})")
                print(f"   Server response: happiness={result.get('happiness', 'N/A')}, data_points={result.get('data_points', 'N/A')}")
            else:
                print(f"❌ Failed to send happiness update: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error sending happiness update: {e}")
    
    def voice_analysis_loop(self):
        """Main loop that runs every 4 seconds"""
        print("🎤 Voice sentiment analyzer started...")
        
        while self.running:
            try:
                # Analyze voice sentiment
                sentiment_data = self.analyze_voice_sentiment()
                
                # Send update to server
                self.send_happiness_update(sentiment_data)
                
                # Wait 4 seconds before next analysis
                time.sleep(4)
                
            except Exception as e:
                print(f"❌ Error in voice analysis loop: {e}")
                time.sleep(4)  # Continue even if there's an error
    
    def start(self):
        """Start the voice sentiment analysis thread"""
        if not self.running:
            self.running = True
            self.thread = threading.Thread(target=self.voice_analysis_loop, daemon=True)
            self.thread.start()
            print("🚀 Voice sentiment analyzer thread started")
    
    def stop(self):
        """Stop the voice sentiment analysis thread"""
        self.running = False
        if self.thread:
            self.thread.join(timeout=1)
        print("🛑 Voice sentiment analyzer stopped")

def main():
    """Main function to run the voice sentiment analyzer"""
    analyzer = VoiceSentimentAnalyzer()
    
    try:
        print("🎤 Starting Voice Sentiment Analyzer...")
        print("📡 This will send happiness data to the server every 4 seconds")
        print("🔄 Press Ctrl+C to stop")
        
        analyzer.start()
        
        # Keep the main thread alive
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Stopping Voice Sentiment Analyzer...")
        analyzer.stop()
        print("👋 Goodbye!")

if __name__ == "__main__":
    main() 
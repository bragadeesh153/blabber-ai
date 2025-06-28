import React, { useState, useEffect, useRef } from 'react'

interface VoiceInterfaceProps {}

const VoiceInterface: React.FC<VoiceInterfaceProps> = () => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [currentMessage, setCurrentMessage] = useState("Hello there! I'm your friendly voice assistant. How are you doing today?")
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null)
  
  const scaleRef = useRef<HTMLDivElement>(null)
  const pulseRef = useRef<HTMLDivElement>(null)
  const backgroundPulseRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const voiceBlobRef = useRef<HTMLDivElement>(null)
  const rippleRef = useRef<HTMLDivElement>(null)

  // Sample messages for the voice assistant
  const messages = [
    "Hello there! I'm your friendly voice assistant. How are you doing today?",
    "The weather is beautiful today. Perfect for a nice walk outside.",
    "Remember to take breaks and stay hydrated throughout the day.",
    "You're doing great! Keep up the wonderful work.",
    "Time for a gentle reminder to stretch and relax your shoulders.",
    "Sweet dreams are made of peaceful moments like these.",
  ]

  // Initialize Web Audio API and Speech Synthesis
  useEffect(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      setAudioContext(ctx)
    } catch (error) {
      console.log('Web Audio API not supported')
    }

    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis)
    }
  }, [])

  // Web-based audio feedback
  const playTone = (frequency: number, duration: number, volume: number = 0.1) => {
    if (!audioContext) return

    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration)
  }

  // Slower background pulse effect when not speaking
  useEffect(() => {
    const backgroundVibration = () => {
      playTone(220, 0.1, 0.01)
      
      if (backgroundPulseRef.current) {
        backgroundPulseRef.current.style.transition = 'opacity 0.5s ease'
        backgroundPulseRef.current.style.opacity = '0.6'
        setTimeout(() => {
          if (backgroundPulseRef.current) {
            backgroundPulseRef.current.style.transition = 'opacity 2s ease'
            backgroundPulseRef.current.style.opacity = '0.2'
          }
        }, 500)
      }
    }

    const interval = setInterval(() => {
      if (!isSpeaking) {
        backgroundVibration()
      }
    }, 5000) // Much slower pulse every 5 seconds

    return () => clearInterval(interval)
  }, [isSpeaking, audioContext])

  // Continuous background pulse animation
  useEffect(() => {
    const createBackgroundPulse = () => {
      if (backgroundPulseRef.current) {
        backgroundPulseRef.current.style.animation = 'backgroundPulse 8s ease-in-out infinite'
      }
    }
    createBackgroundPulse()
  }, [])

  // Voice blob animation when speaking - much slower
  useEffect(() => {
    if (isSpeaking) {
      // Slower vibrating animation for voice blob
      if (voiceBlobRef.current) {
        voiceBlobRef.current.style.animation = 'voiceBlob 1.5s ease-in-out infinite'
      }

      // Button pulse animation when speaking - slower
      if (pulseRef.current) {
        pulseRef.current.style.animation = 'buttonPulse 1s ease-in-out infinite'
      }

      // Glow effect - slower
      if (glowRef.current) {
        glowRef.current.style.animation = 'glow 1.2s ease-in-out infinite'
      }

      // Web audio feedback while speaking - less frequent
      const speakingTones = setInterval(() => {
        playTone(Math.random() * 200 + 300, 0.1, 0.02)
      }, 800) // Much slower audio feedback

      return () => clearInterval(speakingTones)
    } else {
      // Reset animations
      if (pulseRef.current) pulseRef.current.style.animation = ''
      if (glowRef.current) glowRef.current.style.animation = ''
      if (voiceBlobRef.current) voiceBlobRef.current.style.animation = ''
    }
  }, [isSpeaking])

  const handleStartSpeaking = () => {
    if (isSpeaking) {
      // Stop speaking
      if (speechSynthesis) {
        speechSynthesis.cancel()
      }
      setIsSpeaking(false)
      
      // Stop audio feedback
      playTone(330, 0.2, 0.05)
    } else {
      // Start speaking
      setIsSpeaking(true)
      
      // Get random message
      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      setCurrentMessage(randomMessage)
      
      // Start audio feedback
      playTone(440, 0.1, 0.1)
      setTimeout(() => playTone(550, 0.08, 0.08), 100)
      setTimeout(() => playTone(660, 0.06, 0.06), 200)

      // Ripple effect
      if (rippleRef.current) {
        rippleRef.current.style.animation = 'ripple 1s ease-out'
        setTimeout(() => {
          if (rippleRef.current) rippleRef.current.style.animation = ''
        }, 1000)
      }

      // Scale animation
      if (scaleRef.current) {
        scaleRef.current.style.transform = 'scale(0.95)'
        scaleRef.current.style.transition = 'transform 0.2s ease'
      }

      // Start text-to-speech
      if (speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(randomMessage)
        utterance.rate = 0.7
        utterance.pitch = 1.0
        utterance.volume = 0.8
        
        utterance.onend = () => {
          setIsSpeaking(false)
          if (scaleRef.current) {
            scaleRef.current.style.transform = 'scale(1)'
            scaleRef.current.style.transition = 'transform 0.3s ease'
          }
        }
        
        speechSynthesis.speak(utterance)
      }
    }
  }

  return (
    <div style={{
      position: 'relative',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '60px 32px',
      overflow: 'hidden'
    }}>
      {/* Background overlay */}
      <div
        ref={backgroundPulseRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: '#8b5cf6',
          opacity: 0.2,
          pointerEvents: 'none'
        }}
      />

      {/* Voice button container */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10
      }}>
        {/* Voice blob animations */}
        {isSpeaking && (
          <>
            <div
              ref={voiceBlobRef}
              style={{
                position: 'absolute',
                width: '200px',
                height: '200px',
                borderRadius: '50%',
                background: '#8b5cf6',
                opacity: 0.4
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: '#a855f7',
                opacity: 0.3,
                animation: 'voiceBlob2 2s ease-in-out infinite'
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: '#c084fc',
                opacity: 0.2,
                animation: 'voiceBlob3 1.8s ease-in-out infinite'
              }}
            />
          </>
        )}

        {/* Ripple effect */}
        <div
          ref={rippleRef}
          style={{
            position: 'absolute',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: '#8b5cf6',
            opacity: 0
          }}
        />

        {/* Outer glow ring */}
        <div
          ref={glowRef}
          style={{
            position: 'absolute',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            border: '3px solid #8b5cf6',
            boxShadow: '0 0 20px #8b5cf6',
            opacity: 0
          }}
        />
        
        {/* Outer pulse ring */}
        <div
          ref={pulseRef}
          style={{
            position: 'absolute',
            width: '220px',
            height: '220px',
            borderRadius: '50%',
            border: '2px solid #8b5cf6',
            opacity: isSpeaking ? 0.6 : 0.2
          }}
        />
        
        <button
          onClick={handleStartSpeaking}
          ref={scaleRef}
          style={{
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            border: 'none',
            background: isSpeaking 
              ? 'linear-gradient(135deg, #8b5cf6, #a855f7, #c084fc)'
              : 'linear-gradient(135deg, #4c1d95, #6b21a8, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
            transition: 'all 0.2s ease',
            zIndex: 20
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.92)'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          {isSpeaking ? (
            // Big dot when speaking
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#ffffff',
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
            }} />
          ) : (
            // Small dot when not speaking
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: '#e2e8f0',
              boxShadow: '0 0 5px rgba(226, 232, 240, 0.3)'
            }} />
          )}
        </button>
      </div>

      {/* CSS Animations - Much slower */}
      <style>{`
        @keyframes backgroundPulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        
        @keyframes voiceBlob {
          0% { transform: scale(0.9); opacity: 0.2; }
          25% { transform: scale(1.2); opacity: 0.5; }
          50% { transform: scale(0.8); opacity: 0.3; }
          75% { transform: scale(1.1); opacity: 0.4; }
          100% { transform: scale(0.9); opacity: 0.2; }
        }
        
        @keyframes voiceBlob2 {
          0% { transform: scale(1.1); opacity: 0.3; }
          50% { transform: scale(0.7); opacity: 0.15; }
          100% { transform: scale(1.1); opacity: 0.3; }
        }
        
        @keyframes voiceBlob3 {
          0% { transform: scale(0.6); opacity: 0.4; }
          50% { transform: scale(1.0); opacity: 0.2; }
          100% { transform: scale(0.6); opacity: 0.4; }
        }
        
        @keyframes buttonPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        
        @keyframes glow {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.6; }
        }
        
        @keyframes ripple {
          0% { transform: scale(0); opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default VoiceInterface
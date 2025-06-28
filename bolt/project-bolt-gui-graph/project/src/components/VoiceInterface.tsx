import React, { useState, useEffect, useRef } from 'react'

interface VoiceInterfaceProps {}

interface HappinessDataPoint {
  time: string
  value: number // 0-100: 0-30 = crying, 31-70 = calm/sleeping, 71-100 = happy
  timestamp: number
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = () => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [currentMessage, setCurrentMessage] = useState("Hello there! I'm your friendly voice assistant. How are you doing today?")
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null)
  const [happinessData, setHappinessData] = useState<HappinessDataPoint[]>([])
  const [currentHappiness, setCurrentHappiness] = useState(65)
  
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

  // Generate happiness data
  useEffect(() => {
    const generateInitialData = () => {
      const points: HappinessDataPoint[] = []
      const now = Date.now()
      
      // Generate last 12 hours of data (more compact)
      for (let i = 11; i >= 0; i--) {
        const timestamp = now - (i * 60 * 60 * 1000)
        const time = new Date(timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
        
        let value: number
        const hour = new Date(timestamp).getHours()
        
        if (hour >= 22 || hour <= 6) {
          value = Math.random() > 0.8 ? Math.random() * 30 : 40 + Math.random() * 30
        } else if (hour >= 7 && hour <= 9) {
          value = 50 + Math.random() * 40
        } else if (hour >= 12 && hour <= 14) {
          value = 35 + Math.random() * 35
        } else if (hour >= 17 && hour <= 19) {
          value = Math.random() > 0.6 ? Math.random() * 40 : 60 + Math.random() * 30
        } else {
          value = 30 + Math.random() * 60
        }
        
        points.push({ time, value: Math.round(value), timestamp })
      }
      
      setHappinessData(points)
    }

    generateInitialData()

    const interval = setInterval(() => {
      const now = Date.now()
      const time = new Date(now).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
      
      let newValue = currentHappiness + (Math.random() - 0.5) * 40
      newValue = Math.max(0, Math.min(100, newValue))
      
      setCurrentHappiness(newValue)
      
      setHappinessData(prev => {
        const newData = [...prev, { time, value: Math.round(newValue), timestamp: now }]
        return newData.slice(-12)
      })
    }, 45000)

    return () => clearInterval(interval)
  }, [currentHappiness])

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
    }, 6000)

    return () => clearInterval(interval)
  }, [isSpeaking, audioContext])

  // Voice blob animation when speaking
  useEffect(() => {
    if (isSpeaking) {
      if (voiceBlobRef.current) {
        voiceBlobRef.current.style.animation = 'voiceBlob 1.5s ease-in-out infinite'
      }

      if (pulseRef.current) {
        pulseRef.current.style.animation = 'buttonPulse 1s ease-in-out infinite'
      }

      if (glowRef.current) {
        glowRef.current.style.animation = 'glow 1.2s ease-in-out infinite'
      }

      const speakingTones = setInterval(() => {
        playTone(Math.random() * 200 + 300, 0.1, 0.02)
      }, 800)

      return () => clearInterval(speakingTones)
    } else {
      if (pulseRef.current) pulseRef.current.style.animation = ''
      if (glowRef.current) glowRef.current.style.animation = ''
      if (voiceBlobRef.current) voiceBlobRef.current.style.animation = ''
    }
  }, [isSpeaking])

  const handleStartSpeaking = () => {
    if (isSpeaking) {
      if (speechSynthesis) {
        speechSynthesis.cancel()
      }
      setIsSpeaking(false)
      playTone(330, 0.2, 0.05)
    } else {
      setIsSpeaking(true)
      
      const randomMessage = messages[Math.floor(Math.random() * messages.length)]
      setCurrentMessage(randomMessage)
      
      playTone(440, 0.1, 0.1)
      setTimeout(() => playTone(550, 0.08, 0.08), 100)
      setTimeout(() => playTone(660, 0.06, 0.06), 200)

      if (rippleRef.current) {
        rippleRef.current.style.animation = 'ripple 1s ease-out'
        setTimeout(() => {
          if (rippleRef.current) rippleRef.current.style.animation = ''
        }, 1000)
      }

      if (scaleRef.current) {
        scaleRef.current.style.transform = 'scale(0.95)'
        scaleRef.current.style.transition = 'transform 0.2s ease'
      }

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

  const getStateColor = (value: number) => {
    if (value <= 30) return '#ef4444'
    if (value <= 70) return '#8b5cf6'
    return '#10b981'
  }

  const getStateLabel = (value: number) => {
    if (value <= 30) return 'Crying'
    if (value <= 70) return 'Calm'
    return 'Happy'
  }

  const maxValue = Math.max(...happinessData.map(d => d.value), 100)
  const currentState = getStateLabel(currentHappiness)
  const currentColor = getStateColor(currentHappiness)

  return (
    <div style={{
      position: 'relative',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflow: 'hidden'
    }}>
      {/* Unified background overlay */}
      <div
        ref={backgroundPulseRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(192, 132, 252, 0.05) 100%)',
          opacity: 0.8,
          pointerEvents: 'none',
          animation: 'backgroundFlow 12s ease-in-out infinite'
        }}
      />

      {/* Central content container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '48px',
        zIndex: 10,
        maxWidth: '420px',
        width: '100%'
      }}>
        {/* Voice button container */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
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
                  background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0.1) 70%)',
                  opacity: 0.6
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0.05) 70%)',
                  opacity: 0.5,
                  animation: 'voiceBlob2 2s ease-in-out infinite'
                }}
              />
            </>
          )}

          <div
            ref={rippleRef}
            style={{
              position: 'absolute',
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.6) 0%, transparent 70%)',
              opacity: 0
            }}
          />

          <div
            ref={glowRef}
            style={{
              position: 'absolute',
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              border: '2px solid rgba(139, 92, 246, 0.4)',
              boxShadow: '0 0 30px rgba(139, 92, 246, 0.3)',
              opacity: 0
            }}
          />
          
          <div
            ref={pulseRef}
            style={{
              position: 'absolute',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              border: '1px solid rgba(139, 92, 246, 0.3)',
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
                ? 'radial-gradient(circle, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)'
                : 'radial-gradient(circle, #4c1d95 0%, #6b21a8 50%, #7c3aed 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
              transition: 'all 0.3s ease',
              zIndex: 20
            }}
          >
            {isSpeaking ? (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#ffffff',
                boxShadow: '0 0 15px rgba(255, 255, 255, 0.6)'
              }} />
            ) : (
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#e2e8f0',
                boxShadow: '0 0 8px rgba(226, 232, 240, 0.4)'
              }} />
            )}
          </button>
        </div>

        {/* Integrated happiness tracking with text labels */}
        <div style={{
          width: '100%',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '24px',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          padding: '24px',
          backdropFilter: 'blur(20px)'
        }}>
          {/* Current state indicator - no text labels */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            gap: '12px'
          }}>
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              background: currentColor,
              boxShadow: `0 0 12px ${currentColor}60`,
              animation: 'gentlePulse 4s ease-in-out infinite'
            }} />
            <span style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#ffffff'
            }}>
              {Math.round(currentHappiness)}
            </span>
          </div>

          {/* Happiness graph with text labels */}
          <div style={{
            position: 'relative',
            height: '120px',
            background: 'rgba(0, 0, 0, 0.2)',
            borderRadius: '16px',
            padding: '16px',
            overflow: 'hidden'
          }}>
            {/* Y-axis labels */}
            <div style={{
              position: 'absolute',
              left: '4px',
              top: '16px',
              bottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              fontSize: '10px',
              color: '#94a3b8',
              fontWeight: '500'
            }}>
              <span>100</span>
              <span>50</span>
              <span>0</span>
            </div>

            {/* Graph area */}
            <div style={{
              marginLeft: '20px',
              height: '100%',
              position: 'relative'
            }}>
              <svg
                style={{
                  width: '100%',
                  height: '100%'
                }}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {happinessData.length > 1 && (
                  <>
                    <defs>
                      <linearGradient id="miniAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={currentColor} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={currentColor} stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    
                    <path
                      d={`M 0 ${100 - (happinessData[0].value / maxValue) * 100} ${happinessData.map((point, index) => 
                        `L ${(index / (happinessData.length - 1)) * 100} ${100 - (point.value / maxValue) * 100}`
                      ).join(' ')} L 100 100 L 0 100 Z`}
                      fill="url(#miniAreaGradient)"
                    />
                    
                    <path
                      d={`M 0 ${100 - (happinessData[0].value / maxValue) * 100} ${happinessData.map((point, index) => 
                        `L ${(index / (happinessData.length - 1)) * 100} ${100 - (point.value / maxValue) * 100}`
                      ).join(' ')}`}
                      stroke={currentColor}
                      strokeWidth="2.5"
                      fill="none"
                      style={{
                        filter: `drop-shadow(0 0 6px ${currentColor}60)`
                      }}
                    />
                    
                    {happinessData.map((point, index) => (
                      <circle
                        key={index}
                        cx={(index / (happinessData.length - 1)) * 100}
                        cy={100 - (point.value / maxValue) * 100}
                        r="2"
                        fill={getStateColor(point.value)}
                        style={{
                          filter: `drop-shadow(0 0 4px ${getStateColor(point.value)})`
                        }}
                      />
                    ))}
                  </>
                )}
              </svg>
            </div>

            {/* X-axis time labels */}
            <div style={{
              position: 'absolute',
              bottom: '2px',
              left: '20px',
              right: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '9px',
              color: '#64748b',
              fontWeight: '500'
            }}>
              {happinessData.length > 0 && (
                <>
                  <span>{happinessData[0]?.time}</span>
                  <span>{happinessData[Math.floor(happinessData.length / 2)]?.time}</span>
                  <span>{happinessData[happinessData.length - 1]?.time}</span>
                </>
              )}
            </div>
          </div>

          {/* Legend with text labels */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '16px',
            gap: '20px'
          }}>
            {[
              { color: '#10b981', label: 'Happy' },
              { color: '#8b5cf6', label: 'Calm' },
              { color: '#ef4444', label: 'Crying' }
            ].map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: item.color,
                  boxShadow: `0 0 6px ${item.color}40`
                }} />
                <span style={{
                  fontSize: '11px',
                  color: '#94a3b8',
                  fontWeight: '500'
                }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes backgroundFlow {
          0%, 100% { 
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.1) 50%, rgba(192, 132, 252, 0.05) 100%);
          }
          33% { 
            background: linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(192, 132, 252, 0.08) 50%, rgba(139, 92, 246, 0.06) 100%);
          }
          66% { 
            background: linear-gradient(135deg, rgba(192, 132, 252, 0.1) 0%, rgba(139, 92, 246, 0.12) 50%, rgba(168, 85, 247, 0.08) 100%);
          }
        }
        
        @keyframes voiceBlob {
          0% { transform: scale(0.9); opacity: 0.3; }
          25% { transform: scale(1.1); opacity: 0.6; }
          50% { transform: scale(0.85); opacity: 0.4; }
          75% { transform: scale(1.05); opacity: 0.5; }
          100% { transform: scale(0.9); opacity: 0.3; }
        }
        
        @keyframes voiceBlob2 {
          0% { transform: scale(1.0); opacity: 0.4; }
          50% { transform: scale(0.8); opacity: 0.2; }
          100% { transform: scale(1.0); opacity: 0.4; }
        }
        
        @keyframes buttonPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        
        @keyframes glow {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.8; }
        }
        
        @keyframes ripple {
          0% { transform: scale(0); opacity: 0.8; }
          50% { opacity: 0.4; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        
        @keyframes gentlePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.8; }
        }
      `}</style>
    </div>
  )
}

export default VoiceInterface
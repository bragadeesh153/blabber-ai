import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Volume2, VolumeX, Play, Square } from 'lucide-react-native';
import * as Speech from 'expo-speech';

const { width, height } = Dimensions.get('window');

export default function VoiceInterface() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [currentMessage, setCurrentMessage] = useState("Hello there! I'm your friendly voice assistant. How are you doing today?");
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const backgroundPulse = useRef(new Animated.Value(0.3)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const voiceBlobAnim = useRef(new Animated.Value(0)).current;

  // Sample messages for the voice assistant
  const messages = [
    "Hello there! I'm your friendly voice assistant. How are you doing today?",
    "The weather is beautiful today. Perfect for a nice walk outside.",
    "Remember to take breaks and stay hydrated throughout the day.",
    "You're doing great! Keep up the wonderful work.",
    "Time for a gentle reminder to stretch and relax your shoulders.",
    "Sweet dreams are made of peaceful moments like these.",
  ];

  // Initialize Web Audio API for web-based feedback
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);
      } catch (error) {
        console.log('Web Audio API not supported');
      }
    }
  }, []);

  // Web-based audio feedback
  const playTone = (frequency: number, duration: number, volume: number = 0.1) => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  // Slow background pulse effect when not speaking
  useEffect(() => {
    const backgroundVibration = () => {
      if (Platform.OS === 'web') {
        // Gentle audio tone for background pulse
        playTone(220, 0.1, 0.02);
        
        // Visual pulse effect
        Animated.sequence([
          Animated.timing(backgroundPulse, {
            toValue: 0.8,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(backgroundPulse, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: false,
          }),
        ]).start();
      }
    };

    const interval = setInterval(() => {
      if (!isSpeaking) {
        backgroundVibration();
      }
    }, 3000); // Slow pulse every 3 seconds

    return () => clearInterval(interval);
  }, [isSpeaking, audioContext]);

  // Continuous background pulse animation
  useEffect(() => {
    const createBackgroundPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(backgroundPulse, {
            toValue: 0.6,
            duration: 2000,
            useNativeDriver: false,
          }),
          Animated.timing(backgroundPulse, {
            toValue: 0.3,
            duration: 2000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };

    createBackgroundPulse();
  }, []);

  // Voice blob animation when speaking
  useEffect(() => {
    if (isSpeaking) {
      // Fast vibrating animation for voice blob
      const createVoiceBlob = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(voiceBlobAnim, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(voiceBlobAnim, {
              toValue: 0.3,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(voiceBlobAnim, {
              toValue: 0.8,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(voiceBlobAnim, {
              toValue: 0.2,
              duration: 200,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };
      createVoiceBlob();

      // Button pulse animation when speaking
      const createPulse = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.15,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };
      createPulse();

      // Glow effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 300,
            useNativeDriver: false,
          }),
        ])
      ).start();

      // Web audio feedback while speaking
      if (Platform.OS === 'web') {
        const speakingTones = setInterval(() => {
          playTone(Math.random() * 200 + 300, 0.1, 0.03);
        }, 300);

        return () => clearInterval(speakingTones);
      }
    } else {
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
      voiceBlobAnim.setValue(0);
    }
  }, [isSpeaking]);

  const handleStartSpeaking = () => {
    if (isSpeaking) {
      // Stop speaking
      Speech.stop();
      setIsSpeaking(false);
      
      // Stop audio feedback
      if (Platform.OS === 'web') {
        playTone(330, 0.2, 0.08);
      }
    } else {
      // Start speaking
      setIsSpeaking(true);
      
      // Get random message
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setCurrentMessage(randomMessage);
      
      // Start audio feedback
      if (Platform.OS === 'web') {
        playTone(440, 0.1, 0.15);
        setTimeout(() => playTone(550, 0.08, 0.12), 100);
        setTimeout(() => playTone(660, 0.06, 0.1), 200);
      }

      // Ripple effect
      rippleAnim.setValue(0);
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();

      // Scale animation
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }).start();

      // Start text-to-speech
      Speech.speak(randomMessage, {
        onDone: () => {
          setIsSpeaking(false);
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
            friction: 8,
          }).start();
        },
        onStopped: () => {
          setIsSpeaking(false);
          Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 300,
            friction: 8,
          }).start();
        },
        rate: 0.8,
        pitch: 1.1,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.backgroundOverlay,
          {
            opacity: backgroundPulse,
          },
        ]}
      />
      
      <LinearGradient
        colors={['#0a0a0b', '#1a1a2e', '#16213e']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Voice Speaker</Text>
            <Text style={styles.subtitle}>
              {isSpeaking ? 'Speaking...' : 'Touch to start speaking'}
            </Text>
            {Platform.OS === 'web' && (
              <View style={styles.webIndicator}>
                <Volume2 size={16} color="#8b5cf6" strokeWidth={2} />
                <Text style={styles.webIndicatorText}>Audio feedback enabled</Text>
              </View>
            )}
          </View>

          <View style={styles.voiceButtonContainer}>
            {/* Voice blob animations */}
            {isSpeaking && (
              <>
                <Animated.View
                  style={[
                    styles.voiceBlob1,
                    {
                      transform: [
                        {
                          scale: voiceBlobAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1.4],
                          }),
                        },
                      ],
                      opacity: voiceBlobAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 0.8],
                      }),
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.voiceBlob2,
                    {
                      transform: [
                        {
                          scale: voiceBlobAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1.2, 0.6],
                          }),
                        },
                      ],
                      opacity: voiceBlobAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 0.2],
                      }),
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.voiceBlob3,
                    {
                      transform: [
                        {
                          scale: voiceBlobAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.5, 1.1],
                          }),
                        },
                      ],
                      opacity: voiceBlobAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.6, 0.3],
                      }),
                    },
                  ]}
                />
              </>
            )}

            {/* Ripple effect */}
            <Animated.View
              style={[
                styles.rippleEffect,
                {
                  transform: [
                    {
                      scale: rippleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 2],
                      }),
                    },
                  ],
                  opacity: rippleAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.8, 0.4, 0],
                  }),
                },
              ]}
            />

            {/* Outer glow ring */}
            <Animated.View
              style={[
                styles.glowRing,
                {
                  opacity: glowAnim,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
            
            {/* Outer pulse ring */}
            <Animated.View
              style={[
                styles.outerRing,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: isSpeaking ? 0.8 : 0.3,
                },
              ]}
            />
            
            <TouchableOpacity
              style={styles.voiceButton}
              onPress={handleStartSpeaking}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.buttonInner,
                  {
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <LinearGradient
                  colors={
                    isSpeaking
                      ? ['#8b5cf6', '#a855f7', '#c084fc']
                      : ['#4c1d95', '#6b21a8', '#7c3aed']
                  }
                  style={styles.buttonGradient}
                >
                  {isSpeaking ? (
                    <Square size={48} color="#ffffff" strokeWidth={2} fill="#ffffff" />
                  ) : (
                    <Play size={48} color="#e2e8f0" strokeWidth={2} />
                  )}
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          </View>

          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>{currentMessage}</Text>
          </View>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor: isSpeaking ? '#10b981' : '#64748b',
                },
              ]}
            />
            <Text style={styles.statusText}>
              {isSpeaking ? 'Speaking' : 'Ready'}
            </Text>
          </View>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionText}>
              Tap the button to start speaking
            </Text>
            <Text style={styles.instructionSubtext}>
              Gentle voice with soothing visual feedback
            </Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0b',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#8b5cf6',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 12,
  },
  webIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  webIndicatorText: {
    fontSize: 12,
    color: '#8b5cf6',
    marginLeft: 6,
    fontWeight: '500',
  },
  voiceButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  voiceBlob1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#8b5cf6',
  },
  voiceBlob2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#a855f7',
  },
  voiceBlob3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#c084fc',
  },
  rippleEffect: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#8b5cf6',
  },
  glowRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  outerRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  voiceButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    elevation: 8,
    shadowColor: '#8b5cf6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
  },
  buttonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    maxWidth: '90%',
  },
  messageText: {
    fontSize: 16,
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 18,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  instructionSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
</Action>
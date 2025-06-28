import React, { useState } from 'react'
import { Volume2, MessageSquare, Moon, Palette, Monitor, Play } from 'lucide-react'

const Settings: React.FC = () => {
  const [audioFeedback, setAudioFeedback] = useState(true)
  const [visualEffects, setVisualEffects] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [gentleMode, setGentleMode] = useState(true)
  const [speechRate] = useState(0.7)

  const SettingItem: React.FC<{
    icon: React.ComponentType<any>
    title: string
    description: string
    value?: boolean
    onValueChange?: (value: boolean) => void
    hasSwitch?: boolean
  }> = ({ icon: Icon, title, description, value, onValueChange, hasSwitch = true }) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '16px',
      padding: '16px',
      marginBottom: '12px',
      border: '1px solid rgba(139, 92, 246, 0.2)'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'rgba(139, 92, 246, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '16px'
      }}>
        <Icon size={24} color="#8b5cf6" strokeWidth={2} />
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#ffffff',
          marginBottom: '4px'
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: '14px',
          color: '#94a3b8',
          lineHeight: '20px'
        }}>
          {description}
        </p>
      </div>
      {hasSwitch && (
        <label style={{
          position: 'relative',
          display: 'inline-block',
          width: '50px',
          height: '24px'
        }}>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onValueChange?.(e.target.checked)}
            style={{
              opacity: 0,
              width: 0,
              height: 0
            }}
          />
          <span style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: value ? '#8b5cf6' : '#374151',
            borderRadius: '24px',
            transition: '0.4s'
          }}>
            <span style={{
              position: 'absolute',
              content: '',
              height: '18px',
              width: '18px',
              left: value ? '29px' : '3px',
              bottom: '3px',
              background: '#ffffff',
              borderRadius: '50%',
              transition: '0.4s'
            }} />
          </span>
        </label>
      )}
    </div>
  )

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      padding: '0'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        padding: '60px 24px 32px',
        position: 'sticky',
        top: 0,
        background: 'linear-gradient(135deg, #0a0a0b 0%, #1a1a2e 50%, #16213e 100%)',
        zIndex: 10
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#ffffff',
          marginBottom: '8px'
        }}>
          Settings
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#cbd5e1',
          opacity: 0.8,
          marginBottom: '16px'
        }}>
          Customize your voice experience
        </p>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: 'rgba(16, 185, 129, 0.1)',
          padding: '6px 12px',
          borderRadius: '20px',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          gap: '6px'
        }}>
          <Monitor size={16} color="#10b981" strokeWidth={2} />
          <span style={{
            fontSize: '12px',
            color: '#10b981',
            fontWeight: '500'
          }}>
            Web Optimized
          </span>
        </div>
      </div>

      <div style={{ padding: '0 24px 100px' }}>
        {/* Speech Settings */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#e2e8f0',
            marginBottom: '16px'
          }}>
            Speech Settings
          </h2>
          
          <SettingItem
            icon={MessageSquare}
            title="Text-to-Speech"
            description="Gentle voice synthesis for calming communication"
            value={true}
            onValueChange={() => {}}
          />
          
          <SettingItem
            icon={Play}
            title="Speech Rate"
            description={`Current: ${speechRate} (Slower and more soothing)`}
            hasSwitch={false}
          />
        </div>

        {/* Feedback */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#e2e8f0',
            marginBottom: '16px'
          }}>
            Feedback
          </h2>
          
          <SettingItem
            icon={Volume2}
            title="Audio Feedback"
            description="Gentle tones when voice starts and stops"
            value={audioFeedback}
            onValueChange={setAudioFeedback}
          />
          
          <SettingItem
            icon={Palette}
            title="Visual Effects"
            description="Slow, calming voice blob animations"
            value={visualEffects}
            onValueChange={setVisualEffects}
          />
        </div>

        {/* Appearance */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#e2e8f0',
            marginBottom: '16px'
          }}>
            Appearance
          </h2>
          
          <SettingItem
            icon={Moon}
            title="Dark Mode"
            description="Easy on the eyes, perfect for any time"
            value={darkMode}
            onValueChange={setDarkMode}
          />
          
          <SettingItem
            icon={Palette}
            title="Gentle Mode"
            description="Softer colors and slower animations"
            value={gentleMode}
            onValueChange={setGentleMode}
          />
        </div>

        {/* Voice Features */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#e2e8f0',
            marginBottom: '16px'
          }}>
            Voice Features
          </h2>
          
          {[
            {
              title: '🗣️ Text-to-Speech Engine',
              description: 'Gentle voice synthesis with slower rate for calming effect'
            },
            {
              title: '🎵 Voice Blob Visualization',
              description: 'Slow, soothing visual feedback that gently pulses while speaking'
            },
            {
              title: '✨ Smooth Animations',
              description: 'Slower, more relaxing animations optimized for web browsers'
            },
            {
              title: '📱 Responsive Design',
              description: 'Perfect experience across desktop, tablet, and mobile browsers'
            }
          ].map((feature, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '8px'
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#94a3b8',
                lineHeight: '20px'
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* About */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#e2e8f0',
            marginBottom: '16px'
          }}>
            About
          </h2>
          
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '12px'
            }}>
              Simple Voice Speaker v1.0
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#94a3b8',
              lineHeight: '22px'
            }}>
              A minimalist voice interface with gentle, slow animations and 
              calming visual feedback. Features text-to-speech with soothing 
              voice blob visualizations that pulse slowly while speaking. 
              Designed for relaxation and ease of use.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
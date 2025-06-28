import React from 'react'
import { Mic, Settings } from 'lucide-react'

interface TabNavigationProps {
  activeTab: 'voice' | 'settings'
  onTabChange: (tab: 'voice' | 'settings') => void
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div style={{
      display: 'flex',
      background: '#1a1a1b',
      borderTop: '1px solid #2a2a2b',
      padding: '8px 0',
      height: '70px',
      position: 'relative',
      zIndex: 100
    }}>
      <button
        onClick={() => onTabChange('voice')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          color: activeTab === 'voice' ? '#8b5cf6' : '#64748b',
          transition: 'color 0.2s ease'
        }}
      >
        <Mic size={24} strokeWidth={2} />
        <span style={{
          fontSize: '12px',
          fontWeight: '500',
          marginTop: '4px'
        }}>
          Voice
        </span>
      </button>
      
      <button
        onClick={() => onTabChange('settings')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          color: activeTab === 'settings' ? '#8b5cf6' : '#64748b',
          transition: 'color 0.2s ease'
        }}
      >
        <Settings size={24} strokeWidth={2} />
        <span style={{
          fontSize: '12px',
          fontWeight: '500',
          marginTop: '4px'
        }}>
          Settings
        </span>
      </button>
    </div>
  )
}

export default TabNavigation
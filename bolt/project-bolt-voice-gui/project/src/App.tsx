import React, { useState } from 'react'
import VoiceInterface from './components/VoiceInterface'
import Settings from './components/Settings'
import TabNavigation from './components/TabNavigation'

function App() {
  const [activeTab, setActiveTab] = useState<'voice' | 'settings'>('voice')

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #0a0a0b 0%, #1a1a2e 50%, #16213e 100%)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'voice' ? <VoiceInterface /> : <Settings />}
      </div>
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App
import { useState } from 'react'
import './App.css'
import { Header } from './ui/Header'
import { Settings } from './ui/Settings'

function App() {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <>
      <Header onShowSettings={() => setShowSettings(true)} />
      {showSettings ? (
        <Settings onBack={() => setShowSettings(false)} />
      ) : (
        <div>
          <h1>
            hello world
          </h1>
        </div>
      )}
    </>
  )
}

export default App

import { useState } from 'react'
import './App.css'
import { Header } from './ui/Header'
import { Settings } from './ui/Settings'
import { LandingPage } from './ui/LandingPage'
import { PrayerListPage } from './ui/PrayerListPage'

type Page = 'landing' | 'settings' | 'prayerList'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing')

  return (
    <>
      <Header 
        onShowSettings={() => setCurrentPage('settings')}
        onShowPrayerList={() => setCurrentPage('prayerList')}
      />
      {currentPage === 'settings' ? (
        <Settings onBack={() => setCurrentPage('landing')} />
      ) : currentPage === 'prayerList' ? (
        <PrayerListPage onBack={() => setCurrentPage('landing')} />
      ) : (
        <LandingPage />
      )}
    </>
  )
}

export default App

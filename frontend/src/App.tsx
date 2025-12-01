import { useState, useEffect } from 'react'
import './App.css'
import { Header } from './ui/Header'
import { Settings } from './ui/Settings'
import { LandingPage } from './ui/LandingPage'
import { PrayerListPage } from './ui/PrayerListPage'
import { GroupsPage } from './ui/GroupsPage'
import { GroupPage } from './ui/GroupPage'
import { PublicGroupsPage } from './ui/PublicGroupsPage'
import { GroupSearchPage } from './ui/GroupSearchPage'
import { CreateGroupPage } from './ui/CreateGroupPage'
import { FeedbackPage } from './ui/FeedbackPage'
import { BiblePage } from './ui/BiblePage'

type Page = 'landing' | 'settings' | 'prayerList' | 'groups' | 'group' | 'publicGroups' | 'searchGroups' | 'createGroup' | 'feedback' | 'bible'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing')
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)

  // Handle URL-based routing for /feedback
  useEffect(() => {
    const pathname = window.location.pathname
    if (pathname === '/feedback') {
      setCurrentPage('feedback')
      // Update URL without reload
      window.history.pushState({}, '', '/feedback')
    }
  }, [])

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname
      if (pathname === '/feedback') {
        setCurrentPage('feedback')
      } else {
        setCurrentPage('landing')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigateToGroup = (groupId: string) => {
    setSelectedGroupId(groupId)
    setCurrentPage('group')
  }

  const navigateToGroups = () => {
    setCurrentPage('groups')
    setSelectedGroupId(null)
  }

  return (
    <>
      <Header 
        onShowSettings={() => setCurrentPage('settings')}
        onShowPrayerList={() => setCurrentPage('prayerList')}
        onShowGroups={navigateToGroups}
        onShowLanding={() => setCurrentPage('landing')}
        onShowBible={() => setCurrentPage('bible')}
      />
      {currentPage === 'settings' ? (
        <Settings onBack={() => setCurrentPage('landing')} />
      ) : currentPage === 'prayerList' ? (
        <PrayerListPage onBack={() => setCurrentPage('landing')} />
      ) : currentPage === 'groups' ? (
        <GroupsPage 
          onBack={() => setCurrentPage('landing')}
          onNavigateToGroup={navigateToGroup}
          onNavigateToCreateGroup={() => setCurrentPage('createGroup')}
          onNavigateToPublicGroups={() => setCurrentPage('publicGroups')}
          onNavigateToSearchGroups={() => setCurrentPage('searchGroups')}
        />
      ) : currentPage === 'group' && selectedGroupId ? (
        <GroupPage 
          groupId={selectedGroupId}
          onBack={navigateToGroups}
        />
      ) : currentPage === 'publicGroups' ? (
        <PublicGroupsPage 
          onBack={navigateToGroups}
          onNavigateToGroup={navigateToGroup}
        />
      ) : currentPage === 'searchGroups' ? (
        <GroupSearchPage 
          onBack={navigateToGroups}
          onNavigateToGroup={navigateToGroup}
        />
      ) : currentPage === 'createGroup' ? (
        <CreateGroupPage 
          onBack={navigateToGroups}
          onSuccess={navigateToGroup}
        />
      ) : currentPage === 'feedback' ? (
        <FeedbackPage />
      ) : currentPage === 'bible' ? (
        <BiblePage onBack={() => setCurrentPage('landing')} />
      ) : (
        <LandingPage />
      )}
    </>
  )
}

export default App

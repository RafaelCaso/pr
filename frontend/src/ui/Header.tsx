import { useState, useEffect } from 'react';
import { useStytchSession, useStytch } from '@stytch/react';
import { LoginOrSignup } from './StytchLogin';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useStytchUserSync } from '../hooks/useStytchUserSync';
import { useDevice } from '../providers/deviceProvider';

interface HeaderProps {
  onShowSettings?: () => void;
  onShowPrayerList?: () => void;
  onShowGroups?: () => void;
  onShowLanding?: () => void;
}

export const Header = ({ onShowSettings, onShowPrayerList, onShowGroups, onShowLanding }: HeaderProps = {}) => {
  const { session } = useStytchSession();
  const stytch = useStytch();
  const [showLogin, setShowLogin] = useState(false);
  const { isMobile } = useDevice();
  
  // Sync user with backend when Stytch session is available
  useStytchUserSync();

  useEffect(() => {
    if (session) {
      setShowLogin(false);
    }
  }, [session]);

  const handleLogout = async () => {
    if (stytch) {
      await stytch.session.revoke();
    }
  };

  const handleSettings = () => {
    if (onShowSettings) {
      onShowSettings();
    }
  };

  const handlePrayerList = () => {
    if (onShowPrayerList) {
      onShowPrayerList();
    }
  };

  const handleGroups = () => {
    if (onShowGroups) {
      onShowGroups();
    }
  };

  const handleLogoClick = () => {
    if (onShowLanding) {
      onShowLanding();
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <button
          onClick={handleLogoClick}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            marginRight: 'auto'
          }}
          aria-label="Go to home"
        >
          <img 
            src="/logo.svg" 
            alt="Prayer Requests" 
            style={{
              height: isMobile ? '32px' : '40px',
              width: 'auto',
              transition: 'opacity var(--transition-fast)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          />
        </button>
        {session ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="btn btn-ghost">Account</button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="dropdown-content">
              <DropdownMenu.Item className="dropdown-item" onClick={handleGroups}>
                Groups
              </DropdownMenu.Item>
              <DropdownMenu.Item className="dropdown-item" onClick={handlePrayerList}>
                Prayer List
              </DropdownMenu.Item>
              <DropdownMenu.Item className="dropdown-item" onClick={handleSettings}>
                Settings
              </DropdownMenu.Item>
              <DropdownMenu.Item className="dropdown-item" onClick={handleLogout}>
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        ) : (
          <button className="btn btn-primary" onClick={() => setShowLogin(true)}>
            Login
          </button>
        )}
      </div>
      {showLogin && !session && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: 'var(--color-bg-overlay)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 'var(--z-modal)',
          padding: isMobile ? 'var(--spacing-base)' : 'var(--spacing-xl)'
        }}>
          <div className="login-modal">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--spacing-base)' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowLogin(false)}>
                Close
              </button>
            </div>
            <LoginOrSignup />
          </div>
        </div>
      )}
    </header>
  );
};


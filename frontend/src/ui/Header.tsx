import { useState, useEffect } from 'react';
import { useStytchSession, useStytch } from '@stytch/react';
import { LoginOrSignup } from './StytchLogin';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useStytchUserSync } from '../hooks/useStytchUserSync';

interface HeaderProps {
  onShowSettings?: () => void;
  onShowPrayerList?: () => void;
}

export const Header = ({ onShowSettings, onShowPrayerList }: HeaderProps = {}) => {
  const { session } = useStytchSession();
  const stytch = useStytch();
  const [showLogin, setShowLogin] = useState(false);
  
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

  return (
    <header>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
        {session ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button>Account</button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item onClick={handleSettings}>
                Settings
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={handlePrayerList}>
                Prayer List
              </DropdownMenu.Item>
              <DropdownMenu.Item onClick={handleLogout}>
                Logout
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        ) : (
          <button onClick={() => setShowLogin(true)}>Login</button>
        )}
      </div>
      {showLogin && !session && (
        <div>
          <button onClick={() => setShowLogin(false)}>Close</button>
          <LoginOrSignup />
        </div>
      )}
    </header>
  );
};


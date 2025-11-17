import { useState, useEffect } from 'react';
import { useStytchSession, useStytch } from '@stytch/react';
import { LoginOrSignup } from './StytchLogin';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export const Header = () => {
  const { session } = useStytchSession();
  const stytch = useStytch();
  const [showLogin, setShowLogin] = useState(false);

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

  return (
    <header>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
        {session ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button>Account</button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
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


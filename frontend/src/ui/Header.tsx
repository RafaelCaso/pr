import { useState, useEffect } from 'react';
import { useStytchSession, useStytch } from '@stytch/react';
import { LoginOrSignup } from './StytchLogin';

export const Header = () => {
  const { session } = useStytchSession();
  const stytch = useStytch();
  const [showLogin, setShowLogin] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (session) {
      setShowLogin(false);
    }
  }, [session]);

  const handleLogout = async () => {
    if (stytch) {
      await stytch.session.revoke();
      setShowDropdown(false);
    }
  };

  return (
    <header>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
        {session ? (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setShowDropdown(!showDropdown)}>
              Account
            </button>
            {showDropdown && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '5px', border: '1px solid black', padding: '10px', backgroundColor: 'white' }}>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
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


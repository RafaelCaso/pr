import { useState, useEffect } from 'react';
import { useStytchSession } from '@stytch/react';
import { useStytchUserSync } from '../hooks/useStytchUserSync';
import { useUpdateUser } from '../api/user.api';

export const Settings = ({ onBack }: { onBack: () => void }) => {
  const { session } = useStytchSession();
  const { user } = useStytchUserSync();
  const updateUserMutation = useUpdateUser();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync form fields when user data loads
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user_id) return;
    
    setIsSaving(true);
    try {
      await updateUserMutation.mutateAsync({
        stytchId: session.user_id,
        updates: {
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
        },
      });
      // Success - the mutation will update the cache automatically
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={onBack}>← Back</button>
        <h1>Settings</h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="firstName" style={{ display: 'block', marginBottom: '5px' }}>
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            placeholder="Enter your first name"
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="lastName" style={{ display: 'block', marginBottom: '5px' }}>
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            placeholder="Enter your last name"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={isSaving}
          style={{ padding: '10px 20px', cursor: isSaving ? 'not-allowed' : 'pointer' }}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
};


import { useState, useEffect } from 'react';
import { useStytchSession } from '@stytch/react';
import { useStytchUserSync } from '../hooks/useStytchUserSync';
import { useUpdateUser } from '../api/user.api';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useDevice } from '../providers/deviceProvider';

export const Settings = ({ onBack }: { onBack: () => void }) => {
  const { session } = useStytchSession();
  const { user } = useStytchUserSync();
  const updateUserMutation = useUpdateUser();
  const { isMobile } = useDevice();
  
  // Redirect to home if user logs out
  useRequireAuth(onBack);
  
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
    
    if (!session) return;
    
    setIsSaving(true);
    try {
      await updateUserMutation.mutateAsync({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      // Success - the mutation will update the cache automatically
    } catch (error) {
      console.error('Error updating user:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container-form">
        <div className="page-header">
          <button className="btn btn-back" onClick={onBack}>← Back</button>
          <h1 className="page-title">Settings</h1>
        </div>
        
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                className="form-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                className="form-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


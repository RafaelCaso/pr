import { useStytchSession } from '@stytch/react';
import { useGetPublicGroups, useJoinGroup } from '../api/group.api';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useState } from 'react';

interface PublicGroupsPageProps {
  onBack: () => void;
  onNavigateToGroup: (groupId: string) => void;
}

export const PublicGroupsPage = ({ onBack, onNavigateToGroup }: PublicGroupsPageProps) => {
  const { session } = useStytchSession();
  const { data: groups, isLoading, error, refetch } = useGetPublicGroups();
  const joinMutation = useJoinGroup();
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  
  // Redirect to home if user logs out
  useRequireAuth(onBack);
  
  const handleJoin = async (groupId: string) => {
    if (!session) return;
    
    setJoiningGroupId(groupId);
    try {
      await joinMutation.mutateAsync({ id: groupId });
      // Refresh the list to show updated membership
      refetch();
    } catch (error) {
      console.error('Error joining group:', error);
      alert(error instanceof Error ? error.message : 'Failed to join group');
    } finally {
      setJoiningGroupId(null);
    }
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={onBack}>← Back</button>
        <h1 style={{ marginTop: '10px' }}>Public Groups</h1>
        <p style={{ color: '#666' }}>
          Browse and join public groups. No code required!
        </p>
      </div>
      
      {isLoading && <p>Loading public groups...</p>}
      
      {error && (
        <p style={{ color: 'red' }}>
          Error loading public groups. Please try again later.
        </p>
      )}
      
      {!isLoading && !error && groups && groups.length === 0 && (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <p>No public groups available yet.</p>
        </div>
      )}
      
      {!isLoading && !error && groups && groups.length > 0 && (
        <div>
          {groups.map((group) => (
            <div
              key={group._id}
              style={{
                padding: '16px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                marginBottom: '12px',
                backgroundColor: '#fff',
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: '8px' }}>{group.name}</h3>
              <p style={{ margin: '0 0 12px 0', color: '#666' }}>{group.description}</p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ 
                  padding: '4px 8px', 
                  backgroundColor: '#4caf50', 
                  color: 'white', 
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  Public
                </span>
                {session && (
                  <>
                    <button
                      onClick={() => onNavigateToGroup(group._id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      View Group
                    </button>
                    <button
                      onClick={() => handleJoin(group._id)}
                      disabled={joiningGroupId === group._id || joinMutation.isPending}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: joiningGroupId === group._id ? '#ccc' : '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: joiningGroupId === group._id ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      {joiningGroupId === group._id ? 'Joining...' : 'Join Group'}
                    </button>
                  </>
                )}
                {!session && (
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                    Please log in to join this group
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


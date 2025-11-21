import { useStytchSession } from '@stytch/react';
import { useGetPublicGroups, useJoinGroup } from '../api/group.api';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useDevice } from '../providers/deviceProvider';
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
  const { isMobile } = useDevice();
  
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
    <div className="page-wrapper">
      <div className="container-content">
        <div className="page-header">
          <button className="btn btn-back" onClick={onBack}>← Back</button>
          <h1 className="page-title">Public Groups</h1>
          <p className="page-description">
            Browse and join public groups. No code required!
          </p>
        </div>
        
        {isLoading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <span style={{ marginLeft: 'var(--spacing-sm)' }}>Loading public groups...</span>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            Error loading public groups. Please try again later.
          </div>
        )}
        
        {!isLoading && !error && groups && groups.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">No public groups</div>
            <div className="empty-state-message">No public groups available yet.</div>
          </div>
        )}
        
        {!isLoading && !error && groups && groups.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-base)' }}>
            {groups.map((group) => (
              <div key={group._id} className="card">
                <h3 style={{ marginTop: 0, marginBottom: 'var(--spacing-sm)' }}>{group.name}</h3>
                <p style={{ margin: '0 0 var(--spacing-base) 0', color: 'var(--color-text-secondary)' }}>
                  {group.description}
                </p>
                <div className="flex items-center gap-base" style={{ flexWrap: 'wrap' }}>
                  <span className="badge badge-success">Public</span>
                  {session && (
                    <>
                      <button
                        onClick={() => onNavigateToGroup(group._id)}
                        className={`btn btn-info ${isMobile ? 'btn-sm' : ''}`}
                      >
                        View Group
                      </button>
                      <button
                        onClick={() => handleJoin(group._id)}
                        disabled={joiningGroupId === group._id || joinMutation.isPending}
                        className={`btn btn-success ${isMobile ? 'btn-sm' : ''}`}
                      >
                        {joiningGroupId === group._id ? 'Joining...' : 'Join Group'}
                      </button>
                    </>
                  )}
                  {!session && (
                    <p className="text-secondary" style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                      Please log in to join this group
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


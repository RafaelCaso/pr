import { useStytchSession } from '@stytch/react';
import { useSearchGroups, useJoinGroup } from '../api/group.api';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useDevice } from '../providers/deviceProvider';
import { useState } from 'react';

interface GroupSearchPageProps {
  onBack: () => void;
  onNavigateToGroup: (groupId: string) => void;
}

export const GroupSearchPage = ({ onBack, onNavigateToGroup }: GroupSearchPageProps) => {
  const { session } = useStytchSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);
  const { isMobile } = useDevice();
  
  const { data: groups, isLoading, error } = useSearchGroups(searchQuery, searchQuery.length > 0);
  const joinMutation = useJoinGroup();
  
  // Redirect to home if user logs out
  useRequireAuth(onBack);
  
  const handleJoin = async (groupId: string, groupCode?: string) => {
    if (!session) return;
    
    setJoiningGroupId(groupId);
    try {
      await joinMutation.mutateAsync({ id: groupId, code: groupCode });
      alert('Successfully joined the group!');
      setSelectedGroupId(null);
      setCode('');
    } catch (error) {
      console.error('Error joining group:', error);
      alert(error instanceof Error ? error.message : 'Failed to join group');
    } finally {
      setJoiningGroupId(null);
    }
  };
  
  const handleSelectGroup = (groupId: string, isPublic: boolean) => {
    setSelectedGroupId(groupId);
    setCode('');
    if (isPublic) {
      // Auto-join public groups
      handleJoin(groupId);
    }
  };
  
  return (
    <div className="page-wrapper">
      <div className="container-content">
        <div className="page-header">
          <button className="btn btn-back" onClick={onBack}>← Back</button>
          <h1 className="page-title">Search Groups</h1>
          <p className="page-description">
            Search for groups by name. Private groups require a code to join.
          </p>
        </div>
        
        <div className="form-group">
          <input
            type="text"
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for groups..."
          />
        </div>
        
        {selectedGroupId && (
          <div className="card" style={{ 
            border: '2px solid var(--color-info)', 
            marginBottom: 'var(--spacing-lg)',
            backgroundColor: 'var(--color-bg-secondary)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 'var(--spacing-sm)' }}>Enter Group Code</h3>
            <p className="text-secondary" style={{ marginBottom: 'var(--spacing-base)' }}>
              This is a private group. Please enter the group code to join.
            </p>
            <div className="flex gap-base" style={{ flexWrap: 'wrap' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 1, minWidth: '200px', fontFamily: 'var(--font-family-mono)', letterSpacing: '2px', textTransform: 'uppercase' }}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Enter code (e.g., ABC123)"
              />
              <button
                onClick={() => handleJoin(selectedGroupId, code)}
                disabled={!code.trim() || joiningGroupId === selectedGroupId || joinMutation.isPending}
                className={`btn btn-success ${isMobile ? 'btn-sm' : ''}`}
              >
                {joiningGroupId === selectedGroupId ? 'Joining...' : 'Join'}
              </button>
              <button
                onClick={() => {
                  setSelectedGroupId(null);
                  setCode('');
                }}
                className={`btn btn-ghost ${isMobile ? 'btn-sm' : ''}`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <span style={{ marginLeft: 'var(--spacing-sm)' }}>Searching groups...</span>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            Error searching groups. Please try again later.
          </div>
        )}
        
        {!isLoading && !error && searchQuery.length > 0 && groups && groups.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">No groups found</div>
            <div className="empty-state-message">No groups found matching "{searchQuery}".</div>
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
                  {group.isPublic ? (
                    <>
                      <span className="badge badge-success">Public</span>
                      {session && (
                        <button
                          onClick={() => handleSelectGroup(group._id, true)}
                          disabled={joiningGroupId === group._id || joinMutation.isPending}
                          className={`btn btn-success ${isMobile ? 'btn-sm' : ''}`}
                        >
                          {joiningGroupId === group._id ? 'Joining...' : 'Join Group'}
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="badge badge-gray">Private</span>
                      {session && (
                        <button
                          onClick={() => handleSelectGroup(group._id, false)}
                          disabled={selectedGroupId === group._id}
                          className={`btn btn-info ${isMobile ? 'btn-sm' : ''}`}
                        >
                          {selectedGroupId === group._id ? 'Enter code above' : 'Join with Code'}
                        </button>
                      )}
                    </>
                  )}
                  {session && (
                    <button
                      onClick={() => onNavigateToGroup(group._id)}
                      className={`btn btn-info ${isMobile ? 'btn-sm' : ''}`}
                    >
                      View Group
                    </button>
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
        
        {!isLoading && !error && searchQuery.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">Search for groups</div>
            <div className="empty-state-message">Enter a search term above to find groups.</div>
          </div>
        )}
      </div>
    </div>
  );
};


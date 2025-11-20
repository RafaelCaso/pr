import { useStytchSession } from '@stytch/react';
import { useSearchGroups, useJoinGroup } from '../api/group.api';
import { useRequireAuth } from '../hooks/useRequireAuth';
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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={onBack}>← Back</button>
        <h1 style={{ marginTop: '10px' }}>Search Groups</h1>
        <p style={{ color: '#666' }}>
          Search for groups by name. Private groups require a code to join.
        </p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for groups..."
          style={{
            width: '100%',
            padding: '10px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
          }}
        />
      </div>
      
      {selectedGroupId && (
        <div style={{ 
          padding: '16px', 
          border: '2px solid #2196F3', 
          borderRadius: '8px', 
          marginBottom: '20px',
          backgroundColor: '#f0f7ff'
        }}>
          <h3 style={{ marginTop: 0 }}>Enter Group Code</h3>
          <p style={{ color: '#666', marginBottom: '12px' }}>
            This is a private group. Please enter the group code to join.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter code (e.g., ABC123)"
              style={{
                flex: 1,
                padding: '8px',
                fontSize: '16px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
                letterSpacing: '2px',
              }}
            />
            <button
              onClick={() => handleJoin(selectedGroupId, code)}
              disabled={!code.trim() || joiningGroupId === selectedGroupId || joinMutation.isPending}
              style={{
                padding: '8px 16px',
                backgroundColor: code.trim() && joiningGroupId !== selectedGroupId ? '#4caf50' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: code.trim() && joiningGroupId !== selectedGroupId ? 'pointer' : 'not-allowed',
                fontSize: '14px',
              }}
            >
              {joiningGroupId === selectedGroupId ? 'Joining...' : 'Join'}
            </button>
            <button
              onClick={() => {
                setSelectedGroupId(null);
                setCode('');
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {isLoading && <p>Searching groups...</p>}
      
      {error && (
        <p style={{ color: 'red' }}>
          Error searching groups. Please try again later.
        </p>
      )}
      
      {!isLoading && !error && searchQuery.length > 0 && groups && groups.length === 0 && (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <p>No groups found matching "{searchQuery}".</p>
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
                {group.isPublic ? (
                  <>
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
                      <button
                        onClick={() => handleSelectGroup(group._id, true)}
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
                    )}
                  </>
                ) : (
                  <>
                    <span style={{ 
                      padding: '4px 8px', 
                      backgroundColor: '#666', 
                      color: 'white', 
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      Private
                    </span>
                    {session && (
                      <button
                        onClick={() => handleSelectGroup(group._id, false)}
                        disabled={selectedGroupId === group._id}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: selectedGroupId === group._id ? '#ccc' : '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: selectedGroupId === group._id ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                        }}
                      >
                        {selectedGroupId === group._id ? 'Enter code above' : 'Join with Code'}
                      </button>
                    )}
                  </>
                )}
                {session && (
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
      
      {!isLoading && !error && searchQuery.length === 0 && (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <p>Enter a search term above to find groups.</p>
        </div>
      )}
    </div>
  );
};


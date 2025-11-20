import { useStytchSession } from '@stytch/react';
import { useGetMyGroups } from '../api/group.api';
import { useRequireAuth } from '../hooks/useRequireAuth';

interface GroupsPageProps {
  onBack: () => void;
  onNavigateToGroup: (groupId: string) => void;
  onNavigateToCreateGroup: () => void;
  onNavigateToPublicGroups: () => void;
  onNavigateToSearchGroups: () => void;
}

export const GroupsPage = ({ 
  onBack, 
  onNavigateToGroup, 
  onNavigateToCreateGroup,
  onNavigateToPublicGroups,
  onNavigateToSearchGroups 
}: GroupsPageProps) => {
  const { session } = useStytchSession();
  
  const { data: groups, isLoading, error } = useGetMyGroups();
  
  // Redirect to home if user logs out
  useRequireAuth(onBack);
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={onBack}>← Back</button>
        <h1 style={{ marginTop: '10px' }}>My Groups</h1>
        <p style={{ color: '#666' }}>
          Groups you've joined or created.
        </p>
      </div>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={onNavigateToCreateGroup}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Create Group
        </button>
        <button
          onClick={onNavigateToPublicGroups}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Browse Public Groups
        </button>
        <button
          onClick={onNavigateToSearchGroups}
          style={{
            padding: '10px 20px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Search Groups
        </button>
      </div>
      
      {isLoading && <p>Loading your groups...</p>}
      
      {error && (
        <p style={{ color: 'red' }}>
          Error loading your groups. Please try again later.
        </p>
      )}
      
      {!isLoading && !error && groups && groups.length === 0 && (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <p>You haven't joined any groups yet.</p>
          <p>Create a new group or browse public groups to get started!</p>
        </div>
      )}
      
      {!isLoading && !error && groups && groups.length > 0 && (
        <div>
          {groups.map((group) => (
            <div
              key={group._id}
              onClick={() => onNavigateToGroup(group._id)}
              style={{
                padding: '16px',
                border: '1px solid #ccc',
                borderRadius: '8px',
                marginBottom: '12px',
                backgroundColor: '#fff',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: '8px' }}>{group.name}</h3>
              <p style={{ margin: '0 0 8px 0', color: '#666' }}>{group.description}</p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {group.isPublic ? (
                  <span style={{ 
                    padding: '4px 8px', 
                    backgroundColor: '#4caf50', 
                    color: 'white', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    Public
                  </span>
                ) : (
                  <span style={{ 
                    padding: '4px 8px', 
                    backgroundColor: '#666', 
                    color: 'white', 
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    Private
                  </span>
                )}
                <span style={{ fontSize: '12px', color: '#999' }}>
                  Click to view group →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


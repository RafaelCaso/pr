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
  
  const { data: groups, isLoading, error } = useGetMyGroups();
  
  // Redirect to home if user logs out
  useRequireAuth(onBack);
  
  return (
    <div className="page-wrapper">
      <div className="container-content">
        <div className="page-header">
          <button className="btn btn-back" onClick={onBack}>← Back</button>
          <h1 className="page-title">My Groups</h1>
          <p className="page-description">
            Groups you've joined or created.
          </p>
        </div>
        
        <div className="action-group">
          <button
            onClick={onNavigateToCreateGroup}
            className="btn btn-success"
          >
            Create Group
          </button>
          <button
            onClick={onNavigateToPublicGroups}
            className="btn btn-info"
          >
            Browse Public Groups
          </button>
          <button
            onClick={onNavigateToSearchGroups}
            className="btn btn-secondary"
          >
            Search Groups
          </button>
        </div>
        
        {isLoading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <span style={{ marginLeft: 'var(--spacing-sm)' }}>Loading your groups...</span>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            Error loading your groups. Please try again later.
          </div>
        )}
        
        {!isLoading && !error && groups && groups.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <div className="empty-state-title">No groups yet</div>
            <div className="empty-state-message">
              You haven't joined any groups yet. Create a new group or browse public groups to get started!
            </div>
          </div>
        )}
        
        {!isLoading && !error && groups && groups.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-base)' }}>
            {groups.map((group) => (
              <div
                key={group._id}
                onClick={() => onNavigateToGroup(group._id)}
                className="card card-interactive"
              >
                <h3 style={{ marginTop: 0, marginBottom: 'var(--spacing-sm)' }}>{group.name}</h3>
                <p style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--color-text-secondary)' }}>
                  {group.description}
                </p>
                <div className="flex items-center gap-base" style={{ flexWrap: 'wrap' }}>
                  {group.isPublic ? (
                    <span className="badge badge-success">Public</span>
                  ) : (
                    <span className="badge badge-gray">Private</span>
                  )}
                  <span className="text-tertiary" style={{ fontSize: 'var(--font-size-sm)' }}>
                    Click to view group →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


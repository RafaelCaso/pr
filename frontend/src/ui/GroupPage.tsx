import { useStytchSession } from '@stytch/react';
import { PrayerRequestForm } from './PrayerRequestForm';
import { PrayerRequestCard } from './PrayerRequestCard';
import { useGetGroupById, useGetGroupFeed, useGetGroupCode } from '../api/group.api';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useStytchUserSync } from '../hooks/useStytchUserSync';
import { useDevice } from '../providers/deviceProvider';
import { useState } from 'react';

interface GroupPageProps {
  groupId: string;
  onBack: () => void;
}

export const GroupPage = ({ groupId, onBack }: GroupPageProps) => {
  const { session } = useStytchSession();
  const { user } = useStytchUserSync();
  const [showCode, setShowCode] = useState(false);
  const { isMobile } = useDevice();
  
  const { data: group, isLoading: loadingGroup, error: groupError } = useGetGroupById(groupId);
  const { data: prayerRequests, isLoading: loadingFeed, error: feedError, refetch: refetchFeed } = useGetGroupFeed(groupId);
  const { data: codeData } = useGetGroupCode(groupId, showCode);
  
  // Redirect to home if user logs out
  useRequireAuth(onBack);
  
  // Check if user is owner
  const isOwner = user?._id && group?.ownerId && 
    (typeof group.ownerId === 'string' ? group.ownerId === user._id : group.ownerId._id === user._id);
  
  const handleRequestSuccess = () => {
    refetchFeed();
  };
  
  return (
    <div className="page-wrapper">
      <div className="container-content">
        <div className="page-header">
          <button className="btn btn-back" onClick={onBack}>← Back</button>
          {loadingGroup && (
            <div className="loading">
              <div className="loading-spinner"></div>
              <span style={{ marginLeft: 'var(--spacing-sm)' }}>Loading group...</span>
            </div>
          )}
          {groupError && (
            <div className="error-message">
              Error loading group. Please try again later.
            </div>
          )}
          {!loadingGroup && group && (
            <>
              <h1 className="page-title">{group.name}</h1>
              <p className="page-description">{group.description}</p>
              <div className="flex items-center gap-base" style={{ marginBottom: 'var(--spacing-base)', flexWrap: 'wrap' }}>
                {group.isPublic ? (
                  <span className="badge badge-success">Public Group</span>
                ) : (
                  <span className="badge badge-gray">Private Group</span>
                )}
                {isOwner && !group.isPublic && (
                  <button
                    onClick={() => setShowCode(!showCode)}
                    className="btn btn-info btn-sm"
                  >
                    {showCode ? 'Hide' : 'Show'} Group Code
                  </button>
                )}
              </div>
              {showCode && codeData && (
                <div className="group-code-display">
                  <p className="group-code-label">Group Code:</p>
                  <p className="group-code-value">
                    {codeData}
                  </p>
                  <p className="group-code-help">
                    Share this code with others to let them join the group
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        
        {session && group && (
          <PrayerRequestForm 
            groupId={groupId} 
            onSuccess={handleRequestSuccess}
          />
        )}
        
        <div>
          <h2 style={{ marginBottom: 'var(--spacing-base)' }}>Group Prayer Requests</h2>
          
          {loadingFeed && (
            <div className="loading">
              <div className="loading-spinner"></div>
              <span style={{ marginLeft: 'var(--spacing-sm)' }}>Loading prayer requests...</span>
            </div>
          )}
          
          {feedError && (
            <div className="error-message">
              Error loading prayer requests. Please try again later.
            </div>
          )}
          
          {!loadingFeed && !feedError && prayerRequests && prayerRequests.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🙏</div>
              <div className="empty-state-title">No prayer requests yet</div>
              <div className="empty-state-message">
                No prayer requests in this group yet. Be the first to share one!
              </div>
            </div>
          )}
          
          {!loadingFeed && !feedError && prayerRequests && prayerRequests.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-base)' }}>
              {prayerRequests.map((request) => (
                <PrayerRequestCard key={request._id} prayerRequest={request} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


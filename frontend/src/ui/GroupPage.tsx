import { useStytchSession } from '@stytch/react';
import { PrayerRequestForm } from './PrayerRequestForm';
import { PrayerRequestCard } from './PrayerRequestCard';
import { useGetGroupById, useGetGroupFeed, useGetGroupCode } from '../api/group.api';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useStytchUserSync } from '../hooks/useStytchUserSync';
import { useState } from 'react';

interface GroupPageProps {
  groupId: string;
  onBack: () => void;
}

export const GroupPage = ({ groupId, onBack }: GroupPageProps) => {
  const { session } = useStytchSession();
  const { user } = useStytchUserSync();
  const [showCode, setShowCode] = useState(false);
  
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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={onBack}>← Back</button>
        {loadingGroup && <p>Loading group...</p>}
        {groupError && (
          <p style={{ color: 'red' }}>
            Error loading group. Please try again later.
          </p>
        )}
        {!loadingGroup && group && (
          <>
            <h1 style={{ marginTop: '10px' }}>{group.name}</h1>
            <p style={{ color: '#666', marginBottom: '12px' }}>{group.description}</p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
              {group.isPublic ? (
                <span style={{ 
                  padding: '4px 8px', 
                  backgroundColor: '#4caf50', 
                  color: 'white', 
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  Public Group
                </span>
              ) : (
                <span style={{ 
                  padding: '4px 8px', 
                  backgroundColor: '#666', 
                  color: 'white', 
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                  Private Group
                </span>
              )}
              {isOwner && !group.isPublic && (
                <button
                  onClick={() => setShowCode(!showCode)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  {showCode ? 'Hide' : 'Show'} Group Code
                </button>
              )}
            </div>
            {showCode && codeData && (
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#f0f0f0', 
                borderRadius: '4px',
                marginBottom: '12px'
              }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Group Code:</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '24px', fontFamily: 'monospace', letterSpacing: '2px' }}>
                  {codeData}
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
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
        <h2>Group Prayer Requests</h2>
        
        {loadingFeed && <p>Loading prayer requests...</p>}
        
        {feedError && (
          <p style={{ color: 'red' }}>
            Error loading prayer requests. Please try again later.
          </p>
        )}
        
        {!loadingFeed && !feedError && prayerRequests && prayerRequests.length === 0 && (
          <p>No prayer requests in this group yet. Be the first to share one!</p>
        )}
        
        {!loadingFeed && !feedError && prayerRequests && prayerRequests.length > 0 && (
          <div>
            {prayerRequests.map((request) => (
              <PrayerRequestCard key={request._id} prayerRequest={request} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


import { useStytchSession } from '@stytch/react';
import { PrayerRequestForm } from './PrayerRequestForm';
import { PrayerRequestCard } from './PrayerRequestCard';
import { 
  useGetGroupById, 
  useGetGroupFeed, 
  useGetGroupCode,
  useGetGroupMembers,
  useGetTopMessage,
  useUpdateDisplayName,
  useCreateMessage,
  useUpdateMessage
} from '../api/group.api';
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
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [displayNameValue, setDisplayNameValue] = useState('');
  const [messageValue, setMessageValue] = useState('');
  const { isMobile } = useDevice();
  
  const { data: group, isLoading: loadingGroup, error: groupError } = useGetGroupById(groupId);
  const { data: prayerRequests, isLoading: loadingFeed, error: feedError, refetch: refetchFeed } = useGetGroupFeed(groupId);
  const { data: codeData } = useGetGroupCode(groupId, showCode);
  const { data: members } = useGetGroupMembers(groupId, !!session);
  const { data: topMessage } = useGetTopMessage(groupId, !!session);
  
  const updateDisplayNameMutation = useUpdateDisplayName();
  const createMessageMutation = useCreateMessage();
  const updateMessageMutation = useUpdateMessage();
  
  // Redirect to home if user logs out
  useRequireAuth(onBack);
  
  // Check if user is owner
  const isOwner = user?._id && group?.ownerId && 
    (typeof group.ownerId === 'string' ? group.ownerId === user._id : group.ownerId._id === user._id);
  
  // Check if user is admin
  const isAdmin = user?._id && members?.some(member => {
    const memberUserId = typeof member.userId === 'string' ? member.userId : member.userId._id;
    return memberUserId === user._id && member.role === 'admin';
  });
  
  // Check if user is owner or admin
  const isOwnerOrAdmin = isOwner || isAdmin;
  
  // Get display name (displayName or name)
  const displayName = group?.displayName || group?.name || '';
  
  const handleRequestSuccess = () => {
    refetchFeed();
  };
  
  const handleStartEditDisplayName = () => {
    setDisplayNameValue(displayName);
    setIsEditingDisplayName(true);
  };
  
  const handleCancelEditDisplayName = () => {
    setIsEditingDisplayName(false);
    setDisplayNameValue('');
  };
  
  const handleSaveDisplayName = async () => {
    if (!displayNameValue.trim() || !group) return;
    
    try {
      await updateDisplayNameMutation.mutateAsync({
        id: groupId,
        displayName: displayNameValue.trim(),
      });
      setIsEditingDisplayName(false);
      setDisplayNameValue('');
    } catch (error) {
      console.error('Error updating display name:', error);
    }
  };
  
  const handleStartEditMessage = () => {
    if (topMessage) {
      setMessageValue(topMessage.message);
      setIsEditingMessage(true);
    } else {
      setMessageValue('');
      setIsEditingMessage(true);
    }
  };
  
  const handleCancelEditMessage = () => {
    setIsEditingMessage(false);
    setMessageValue('');
  };
  
  const handleSaveMessage = async () => {
    if (!messageValue.trim() || !group) return;
    
    try {
      if (topMessage) {
        // Update existing message
        await updateMessageMutation.mutateAsync({
          id: groupId,
          messageId: topMessage._id,
          message: messageValue.trim(),
        });
      } else {
        // Create new message
        await createMessageMutation.mutateAsync({
          id: groupId,
          message: messageValue.trim(),
          isPinned: false,
        });
      }
      setIsEditingMessage(false);
      setMessageValue('');
    } catch (error) {
      console.error('Error saving message:', error);
    }
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                {isEditingDisplayName ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flex: 1, minWidth: 0 }}>
                    <input
                      type="text"
                      value={displayNameValue}
                      onChange={(e) => setDisplayNameValue(e.target.value)}
                      className="form-input"
                      style={{ flex: 1, minWidth: 0 }}
                      autoFocus
                    />
                    <button
                      onClick={handleSaveDisplayName}
                      disabled={updateDisplayNameMutation.isPending || !displayNameValue.trim()}
                      className="btn btn-primary btn-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEditDisplayName}
                      disabled={updateDisplayNameMutation.isPending}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="page-title" style={{ margin: 0 }}>{displayName}</h1>
                    {isOwnerOrAdmin && (
                      <button
                        onClick={handleStartEditDisplayName}
                        className="btn btn-link btn-sm"
                        style={{ padding: 'var(--spacing-xs)' }}
                        title="Edit display name"
                      >
                        ✏️
                      </button>
                    )}
                  </>
                )}
              </div>
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
        
        {/* Top Message Section */}
        {group && (
          <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            {isEditingMessage ? (
              <div>
                <h3 style={{ marginTop: 0, marginBottom: 'var(--spacing-base)' }}>Group Message</h3>
                <textarea
                  value={messageValue}
                  onChange={(e) => setMessageValue(e.target.value)}
                  className="form-textarea"
                  placeholder="Enter a message for the group..."
                  rows={4}
                />
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-base)' }}>
                  <button
                    onClick={handleSaveMessage}
                    disabled={createMessageMutation.isPending || updateMessageMutation.isPending || !messageValue.trim()}
                    className="btn btn-primary"
                  >
                    {createMessageMutation.isPending || updateMessageMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelEditMessage}
                    disabled={createMessageMutation.isPending || updateMessageMutation.isPending}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: topMessage ? 'var(--spacing-base)' : 0 }}>
                  <h3 style={{ marginTop: 0, marginBottom: 0 }}>Group Message</h3>
                  {isOwnerOrAdmin && session && (
                    <button
                      onClick={handleStartEditMessage}
                      className="btn btn-link btn-sm"
                      style={{ padding: 'var(--spacing-xs)' }}
                    >
                      {topMessage ? 'Edit' : 'Add Message'}
                    </button>
                  )}
                </div>
                {topMessage ? (
                  <div>
                    <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{topMessage.message}</p>
                    {topMessage.userId && typeof topMessage.userId === 'object' && (
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: 'var(--spacing-sm)', marginBottom: 0 }}>
                        - {topMessage.userId.firstName} {topMessage.userId.lastName}
                      </p>
                    )}
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic', margin: 0 }}>
                    {isOwnerOrAdmin && session ? 'No message set for this group.' : ''}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
        
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


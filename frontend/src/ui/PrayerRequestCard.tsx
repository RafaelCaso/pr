import { useStytchSession } from '@stytch/react';
import type { PrayerRequest } from '../api/prayerRequest.api';
import { useCheckPrayerCommitment, useTogglePrayerCommitment, useDeletePrayerRequest } from '../api/prayerRequest.api';
import { useStytchUserSync } from '../hooks/useStytchUserSync';
import { useDevice } from '../providers/deviceProvider';

interface PrayerRequestCardProps {
  prayerRequest: PrayerRequest;
}

export const PrayerRequestCard = ({ prayerRequest }: PrayerRequestCardProps) => {
  const { session } = useStytchSession();
  const { user } = useStytchUserSync();
  const { isMobile } = useDevice();
  // Compare MongoDB _id for ownership check
  const getUserIdString = () => {
    if (!prayerRequest.userId) return null;
    if (typeof prayerRequest.userId === 'string') return prayerRequest.userId;
    if (typeof prayerRequest.userId === 'object' && prayerRequest.userId._id) return prayerRequest.userId._id;
    return null;
  };
  const isOwner = user?._id && getUserIdString() && user._id === getUserIdString();
  
  // Only check commitment status if user is logged in
  const { data: commitmentStatus, isLoading: checkingCommitment } = useCheckPrayerCommitment(
    prayerRequest._id,
    !!session // Only enable query if session exists
  );
  
  const toggleCommitmentMutation = useTogglePrayerCommitment();
  const deleteMutation = useDeletePrayerRequest();
  
  const hasCommitted = commitmentStatus?.hasCommitted || false;
  const isLoading = toggleCommitmentMutation.isPending || deleteMutation.isPending || checkingCommitment;
  
  const handleToggleCommitment = async () => {
    if (!session) return;
    
    try {
      await toggleCommitmentMutation.mutateAsync(prayerRequest._id);
    } catch (error) {
      console.error('Error toggling prayer commitment:', error);
    }
  };
  
  const handleDelete = async () => {
    if (!session || !isOwner) return;
    
    if (!confirm('Are you sure you want to delete this prayer request?')) {
      return;
    }
    
    try {
      await deleteMutation.mutateAsync(prayerRequest._id);
    } catch (error) {
      console.error('Error deleting prayer request:', error);
    }
  };
  
  // Get author name for display
  const getAuthorName = () => {
    if (prayerRequest.isAnonymous || !prayerRequest.userId) {
      return 'Anonymous';
    }
    // If userId is populated with user object, use firstName/lastName
    if (typeof prayerRequest.userId === 'object' && prayerRequest.userId.firstName) {
      const { firstName, lastName } = prayerRequest.userId;
      return lastName ? `${firstName} ${lastName}` : firstName;
    }
    // Fallback to Anonymous if we don't have user info
    return 'Anonymous';
  };

  // Get group name for display
  const getGroupName = () => {
    if (!prayerRequest.groupId) {
      return null; // Public request, no group
    }
    if (typeof prayerRequest.groupId === 'object' && prayerRequest.groupId.name) {
      return prayerRequest.groupId.name;
    }
    // If groupId is just a string/ObjectId (not populated), return null for now
    // Once Group model exists and is populated, this will show the group name
    return null;
  };
  
  return (
    <div className="card">
      <div className="card-body">
        <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 'var(--line-height-relaxed)' }}>
          {prayerRequest.text}
        </p>
      </div>
      
      <div className="card-footer">
        <div className="prayer-meta">
          <span>By: {getAuthorName()}</span>
          {getGroupName() && (
            <span style={{ fontStyle: 'italic' }}>
              Group: {getGroupName()}
            </span>
          )}
          <span>
            {prayerRequest.prayerCount} {prayerRequest.prayerCount === 1 ? 'person is' : 'people are'} praying
          </span>
        </div>
        
        <div className="prayer-actions">
          {session && (
            <button
              onClick={handleToggleCommitment}
              disabled={isLoading}
              className={`btn ${hasCommitted ? 'btn-danger' : 'btn-success'} ${isMobile ? 'btn-sm' : ''}`}
            >
              {hasCommitted ? (isMobile ? 'Remove' : 'Remove from Prayer List') : "I'll Pray"}
            </button>
          )}
          
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className={`btn btn-danger ${isMobile ? 'btn-sm' : ''}`}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


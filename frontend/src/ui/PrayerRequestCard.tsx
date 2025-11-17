import { useStytchSession } from '@stytch/react';
import type { PrayerRequest } from '../api/prayerRequest.api';
import { useCheckPrayerCommitment, useTogglePrayerCommitment, useDeletePrayerRequest } from '../api/prayerRequest.api';
import { useStytchUserSync } from '../hooks/useStytchUserSync';

interface PrayerRequestCardProps {
  prayerRequest: PrayerRequest;
}

export const PrayerRequestCard = ({ prayerRequest }: PrayerRequestCardProps) => {
  const { session } = useStytchSession();
  const { user } = useStytchUserSync();
  const stytchId = session?.user_id || null;
  // Compare MongoDB _id for ownership check
  const getUserIdString = () => {
    if (!prayerRequest.userId) return null;
    if (typeof prayerRequest.userId === 'string') return prayerRequest.userId;
    if (typeof prayerRequest.userId === 'object' && prayerRequest.userId._id) return prayerRequest.userId._id;
    return null;
  };
  const isOwner = user?._id && getUserIdString() && user._id === getUserIdString();
  
  const { data: commitmentStatus, isLoading: checkingCommitment } = useCheckPrayerCommitment(
    prayerRequest._id,
    stytchId
  );
  
  const toggleCommitmentMutation = useTogglePrayerCommitment();
  const deleteMutation = useDeletePrayerRequest();
  
  const hasCommitted = commitmentStatus?.hasCommitted || false;
  const isLoading = toggleCommitmentMutation.isPending || deleteMutation.isPending || checkingCommitment;
  
  const handleToggleCommitment = async () => {
    if (!stytchId) return;
    
    try {
      await toggleCommitmentMutation.mutateAsync({
        id: prayerRequest._id,
        stytchId,
      });
    } catch (error) {
      console.error('Error toggling prayer commitment:', error);
    }
  };
  
  const handleDelete = async () => {
    if (!stytchId || !isOwner) return;
    
    if (!confirm('Are you sure you want to delete this prayer request?')) {
      return;
    }
    
    try {
      await deleteMutation.mutateAsync({
        id: prayerRequest._id,
        stytchId,
      });
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
  
  return (
    <div style={{ 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      padding: '16px', 
      marginBottom: '16px',
      backgroundColor: '#fff'
    }}>
      <div style={{ marginBottom: '12px' }}>
        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{prayerRequest.text}</p>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        fontSize: '14px',
        color: '#666'
      }}>
        <div>
          <span>By: {getAuthorName()}</span>
          <span style={{ marginLeft: '16px' }}>
            {prayerRequest.prayerCount} {prayerRequest.prayerCount === 1 ? 'person is' : 'people are'} praying
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {stytchId && (
            <button
              onClick={handleToggleCommitment}
              disabled={isLoading}
              style={{
                padding: '6px 12px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                backgroundColor: hasCommitted ? '#ff6b6b' : '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              {hasCommitted ? 'Remove from Prayer List' : "I'll Pray"}
            </button>
          )}
          
          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isLoading}
              style={{
                padding: '6px 12px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


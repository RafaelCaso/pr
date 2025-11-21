import { useState } from 'react';
import { useStytchSession } from '@stytch/react';
import { useCreatePrayerRequest } from '../api/prayerRequest.api';
import { useDevice } from '../providers/deviceProvider';

interface PrayerRequestFormProps {
  groupId?: string;
  onSuccess?: () => void;
}

export const PrayerRequestForm = ({ groupId, onSuccess }: PrayerRequestFormProps) => {
  const { session } = useStytchSession();
  const createMutation = useCreatePrayerRequest();
  const { isMobile } = useDevice();
  
  const [text, setText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPublic, setIsPublic] = useState(false); // "Make request public" checkbox
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session || !text.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        text: text.trim(),
        isAnonymous,
        groupId,
        isGroupOnly: groupId ? !isPublic : undefined, // If in group, isGroupOnly is inverse of isPublic
      });
      // Reset form on success
      setText('');
      setIsAnonymous(false);
      setIsPublic(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating prayer request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!session) {
    return (
      <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <p className="text-center">Please log in to create a prayer request.</p>
      </div>
    );
  }
  
  return (
    <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
      <h2 style={{ marginTop: 0, marginBottom: 'var(--spacing-base)' }}>Create Prayer Request</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="prayerText" className="form-label">
            Prayer Request
          </label>
          <textarea
            id="prayerText"
            className="form-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your prayer request..."
            required
          />
        </div>
        
        <div className="form-group">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <span>Post anonymously</span>
          </label>
        </div>
        
        {groupId && (
          <div className="form-group">
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <span>Make request public (visible in main feed)</span>
            </label>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          className="btn btn-primary"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Prayer Request'}
        </button>
      </form>
    </div>
  );
};


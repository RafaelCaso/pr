import { useState } from 'react';
import { useStytchSession } from '@stytch/react';
import { useCreatePrayerRequest } from '../api/prayerRequest.api';

interface PrayerRequestFormProps {
  groupId?: string;
  onSuccess?: () => void;
}

export const PrayerRequestForm = ({ groupId, onSuccess }: PrayerRequestFormProps) => {
  const { session } = useStytchSession();
  const createMutation = useCreatePrayerRequest();
  
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
      <div style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '24px' }}>
        <p>Please log in to create a prayer request.</p>
      </div>
    );
  }
  
  return (
    <div style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '24px', backgroundColor: '#fff' }}>
      <h2 style={{ marginTop: 0 }}>Create Prayer Request</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '12px' }}>
          <label htmlFor="prayerText" style={{ display: 'block', marginBottom: '5px' }}>
            Prayer Request
          </label>
          <textarea
            id="prayerText"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '8px',
              minHeight: '100px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            placeholder="Share your prayer request..."
            required
          />
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <span>Post anonymously</span>
          </label>
        </div>
        
        {groupId && (
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              <span>Make request public (visible in main feed)</span>
            </label>
          </div>
        )}
        
        <button
          type="submit"
          disabled={isSubmitting || !text.trim()}
          style={{
            padding: '10px 20px',
            cursor: isSubmitting || !text.trim() ? 'not-allowed' : 'pointer',
            backgroundColor: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Prayer Request'}
        </button>
      </form>
    </div>
  );
};


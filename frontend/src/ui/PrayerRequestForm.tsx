import { useState } from 'react';
import { useStytchSession } from '@stytch/react';
import { useCreatePrayerRequest } from '../api/prayerRequest.api';

export const PrayerRequestForm = () => {
  const { session } = useStytchSession();
  const createMutation = useCreatePrayerRequest();
  
  const [text, setText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user_id || !text.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        stytchId: session.user_id,
        text: text.trim(),
        isAnonymous,
      });
      // Reset form on success
      setText('');
      setIsAnonymous(false);
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


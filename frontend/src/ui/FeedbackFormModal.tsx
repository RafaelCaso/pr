import { useState } from 'react';
import { useCreateFeedback } from '../api/feedback.api';
import { useDevice } from '../providers/deviceProvider';

interface FeedbackFormModalProps {
  onClose: () => void;
}

export const FeedbackFormModal = ({ onClose }: FeedbackFormModalProps) => {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { isMobile } = useDevice();
  const createMutation = useCreateFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({ text: text.trim() });
      setShowSuccess(true);
      setText('');
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'var(--color-bg-overlay)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 'var(--z-modal)',
      padding: isMobile ? 'var(--spacing-base)' : 'var(--spacing-xl)'
    }}>
      <div className="login-modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-base)' }}>
          <h2 style={{ 
            fontSize: 'var(--font-size-lg)', 
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
            margin: 0
          }}>
            Share Your Feedback
          </h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
        
        {showSuccess ? (
          <div style={{ 
            textAlign: 'center', 
            padding: 'var(--spacing-lg)',
            color: 'var(--color-success)'
          }}>
            <div style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-sm)' }}>✓</div>
            <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
              Thank you for your feedback!
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="feedback-text">
                Your thoughts and suggestions
              </label>
              <textarea
                id="feedback-text"
                className="form-textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share your feedback about the app..."
                rows={6}
                required
                disabled={isSubmitting}
              />
            </div>
            
            {createMutation.isError && (
              <div className="error-message" style={{ marginBottom: 'var(--spacing-base)' }}>
                Error submitting feedback. Please try again.
              </div>
            )}
            
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn btn-ghost" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isSubmitting || !text.trim()}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};


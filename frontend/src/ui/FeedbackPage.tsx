import { useGetAllFeedback } from '../api/feedback.api';

export const FeedbackPage = () => {
  const { data: feedback, isLoading, error } = useGetAllFeedback();
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  return (
    <div className="page-wrapper">
      <div className="container-content">
        <div className="page-header">
          <h1 className="page-title">Feedback</h1>
          <p className="page-description">
            All feedback submitted by users.
          </p>
        </div>
        
        {isLoading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <span style={{ marginLeft: 'var(--spacing-sm)' }}>Loading feedback...</span>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            Error loading feedback. Please try again later.
          </div>
        )}
        
        {!isLoading && !error && feedback && feedback.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">💬</div>
            <div className="empty-state-title">No feedback yet</div>
            <div className="empty-state-message">No feedback has been submitted yet.</div>
          </div>
        )}
        
        {!isLoading && !error && feedback && feedback.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-base)' }}>
            {feedback.map((item) => (
              <div key={item._id} className="card">
                <p style={{ 
                  fontSize: 'var(--font-size-base)', 
                  color: 'var(--color-text-primary)',
                  lineHeight: 'var(--line-height-relaxed)',
                  marginBottom: 'var(--spacing-sm)',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {item.text}
                </p>
                <p style={{ 
                  fontSize: 'var(--font-size-sm)', 
                  color: 'var(--color-text-tertiary)'
                }}>
                  {formatDate(item.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


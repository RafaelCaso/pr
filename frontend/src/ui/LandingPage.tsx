import { useState } from 'react';
import { PrayerRequestForm } from './PrayerRequestForm';
import { PrayerRequestCard } from './PrayerRequestCard';
import { useGetAllPrayerRequests } from '../api/prayerRequest.api';
import { FeedbackFormModal } from './FeedbackFormModal';

export const LandingPage = () => {
  const { data: prayerRequests, isLoading, error } = useGetAllPrayerRequests();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  return (
    <div className="page-wrapper">
      <div className="container-content">
        <div className="page-header">
          <h1 className="page-title">Prayer Requests</h1>
          <p className="page-description">
            {/* Share your prayer requests and join others in prayer. Together we lift our hearts to God. */}
          </p>
        </div>
        
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ marginBottom: 'var(--spacing-base)' }}>
            <h2 style={{ 
              fontSize: 'var(--font-size-lg)', 
              fontWeight: 'var(--font-weight-semibold)',
              marginBottom: 'var(--spacing-sm)',
              color: 'var(--color-text-primary)'
            }}>
              Welcome to Prayer Requests
            </h2>
            <p style={{ 
              fontSize: 'var(--font-size-base)', 
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--line-height-relaxed)',
              marginBottom: 'var(--spacing-base)'
            }}>
              This is a prototype app designed to help communities share prayer requests and support one another in prayer. I'm actively looking for feedback to create the app that users want.
            </p>
          </div>
          
          <div>
            <h3 style={{ 
              fontSize: 'var(--font-size-md)', 
              fontWeight: 'var(--font-weight-semibold)',
              marginBottom: 'var(--spacing-sm)',
              color: 'var(--color-text-primary)'
            }}>
              How it works:
            </h3>
            <ul style={{ 
              paddingLeft: 'var(--spacing-lg)',
              marginBottom: 'var(--spacing-base)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--line-height-relaxed)'
            }}>
              <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>Main Feed (below):</strong> Browse and create prayer requests that are visible to the community. Share your needs and see how others are praying.
              </li>
              <li style={{ marginBottom: 'var(--spacing-sm)' }}>
                <strong style={{ color: 'var(--color-text-primary)' }}>Prayer List (account button):</strong> When you commit to praying for a request, it appears in your personal Prayer List so you can keep track of what you're praying for.
              </li>
              <li>
                <strong style={{ color: 'var(--color-text-primary)' }}>Prayer Groups (account button):</strong> Create or join prayer groups to share prayer requests within smaller communities. Groups can be public or private, and members can share requests specific to their group.
              </li>
            </ul>
            <p style={{ 
              fontSize: 'var(--font-size-sm)', 
              color: 'var(--color-text-tertiary)',
              fontStyle: 'italic',
              marginTop: 'var(--spacing-base)',
              paddingTop: 'var(--spacing-base)',
              borderTop: '1px solid var(--color-border-light)'
            }}>
              Your feedback helps shape this app.{' '}
              <button
                onClick={() => setShowFeedbackModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--color-text-link)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontStyle: 'italic',
                  fontSize: 'inherit',
                  fontFamily: 'inherit'
                }}
              >
                Please share your thoughts and suggestions!
              </button>
            </p>
          </div>
        </div>
        
        <PrayerRequestForm />
        
        <div>
          <h2 style={{ marginBottom: 'var(--spacing-base)' }}>All Prayer Requests</h2>
          
          {isLoading && (
            <div className="loading">
              <div className="loading-spinner"></div>
              <span style={{ marginLeft: 'var(--spacing-sm)' }}>Loading prayer requests...</span>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              Error loading prayer requests. Please try again later.
            </div>
          )}
          
          {!isLoading && !error && prayerRequests && prayerRequests.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">🙏</div>
              <div className="empty-state-title">No prayer requests yet</div>
              <div className="empty-state-message">Be the first to share a prayer request above.</div>
            </div>
          )}
          
          {!isLoading && !error && prayerRequests && prayerRequests.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-base)' }}>
              {prayerRequests.map((request) => (
                <PrayerRequestCard key={request._id} prayerRequest={request} />
              ))}
            </div>
          )}
        </div>
        
        <div className="card" style={{ marginTop: 'var(--spacing-2xl)' }}>
          <h2 style={{ 
            fontSize: 'var(--font-size-lg)', 
            fontWeight: 'var(--font-weight-semibold)',
            marginBottom: 'var(--spacing-base)',
            color: 'var(--color-text-primary)'
          }}>
            Recent Changes
          </h2>
          <ul style={{ 
            paddingLeft: 'var(--spacing-lg)',
            margin: 0,
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--line-height-relaxed)'
          }}>
            <li style={{ marginBottom: 'var(--spacing-sm)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>Mon Dec 1:</strong> Basic Bible API integration - Access the Bible reader from your account menu to read scripture in multiple versions.
            </li>
            <li style={{ marginBottom: 'var(--spacing-sm)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>Mon Nov 24:</strong> User sessions now persist for 30 days. You'll stay logged in unless you manually log out.
            </li>
          </ul>
        </div>
      </div>
      {showFeedbackModal && (
        <FeedbackFormModal onClose={() => setShowFeedbackModal(false)} />
      )}
    </div>
  );
};


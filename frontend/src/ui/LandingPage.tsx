import { PrayerRequestForm } from './PrayerRequestForm';
import { PrayerRequestCard } from './PrayerRequestCard';
import { useGetAllPrayerRequests } from '../api/prayerRequest.api';
import { useDevice } from '../providers/deviceProvider';

export const LandingPage = () => {
  const { data: prayerRequests, isLoading, error } = useGetAllPrayerRequests();
  const { isMobile } = useDevice();
  
  return (
    <div className="page-wrapper">
      <div className="container-content">
        <div className="page-header">
          <h1 className="page-title">Prayer Requests</h1>
          <p className="page-description">
            Share your prayer requests and join others in prayer. Together we lift our hearts to God.
          </p>
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
      </div>
    </div>
  );
};


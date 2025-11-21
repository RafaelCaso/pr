import { useState } from 'react';
import { useStytchSession } from '@stytch/react';
import { PrayerRequestCard } from './PrayerRequestCard';
import { useGetUserPrayerList, useGetMyPrayerRequests } from '../api/prayerRequest.api';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { useDevice } from '../providers/deviceProvider';

interface PrayerListPageProps {
  onBack: () => void;
}

type Tab = 'committed' | 'myRequests';

export const PrayerListPage = ({ onBack }: PrayerListPageProps) => {
  const { session } = useStytchSession();
  const [activeTab, setActiveTab] = useState<Tab>('committed');
  const { isMobile } = useDevice();
  
  const { data: committedRequests, isLoading: isLoadingCommitted, error: committedError } = useGetUserPrayerList();
  const { data: myRequests, isLoading: isLoadingMyRequests, error: myRequestsError } = useGetMyPrayerRequests();
  
  // Redirect to home if user logs out
  useRequireAuth(onBack);
  
  const isLoading = activeTab === 'committed' ? isLoadingCommitted : isLoadingMyRequests;
  const error = activeTab === 'committed' ? committedError : myRequestsError;
  const prayerRequests = activeTab === 'committed' ? committedRequests : myRequests;
  
  const title = activeTab === 'committed' ? 'My Prayer List' : 'My Requests';
  const description = activeTab === 'committed' 
    ? "These are the prayer requests you've committed to pray for."
    : "These are the prayer requests you've created.";
  
  const emptyMessage = activeTab === 'committed'
    ? "You haven't committed to pray for any requests yet. Visit the main feed to add some!"
    : "You haven't created any prayer requests yet. Create one on the main feed!";
  
  return (
    <div className="page-wrapper">
      <div className="container-content">
        <div className="page-header">
          <button className="btn btn-back" onClick={onBack}>← Back</button>
          <h1 className="page-title">{title}</h1>
          <p className="page-description">
            {description}
          </p>
          
          {/* Tab buttons */}
          <div className="tabs">
            <button
              onClick={() => setActiveTab('committed')}
              className={`tab-button ${activeTab === 'committed' ? 'tab-button-active' : ''}`}
            >
              My Prayer List
            </button>
            <button
              onClick={() => setActiveTab('myRequests')}
              className={`tab-button ${activeTab === 'myRequests' ? 'tab-button-active' : ''}`}
            >
              My Requests
            </button>
          </div>
        </div>
        
        {isLoading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            <span style={{ marginLeft: 'var(--spacing-sm)' }}>Loading...</span>
          </div>
        )}
        
        {error && (
          <div className="error-message">
            Error loading data. Please try again later.
          </div>
        )}
        
        {!isLoading && !error && prayerRequests && prayerRequests.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📿</div>
            <div className="empty-state-title">No prayer requests</div>
            <div className="empty-state-message">{emptyMessage}</div>
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
  );
};


import { useState } from 'react';
import { useStytchSession } from '@stytch/react';
import { PrayerRequestCard } from './PrayerRequestCard';
import { useGetUserPrayerList, useGetMyPrayerRequests } from '../api/prayerRequest.api';
import { useRequireAuth } from '../hooks/useRequireAuth';

interface PrayerListPageProps {
  onBack: () => void;
}

type Tab = 'committed' | 'myRequests';

export const PrayerListPage = ({ onBack }: PrayerListPageProps) => {
  const { session } = useStytchSession();
  const [activeTab, setActiveTab] = useState<Tab>('committed');
  
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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={onBack}>← Back</button>
        <h1 style={{ marginTop: '10px' }}>{title}</h1>
        <p style={{ color: '#666' }}>
          {description}
        </p>
        
        {/* Tab buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px', marginBottom: '20px' }}>
          <button
            onClick={() => setActiveTab('committed')}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              backgroundColor: activeTab === 'committed' ? '#007bff' : '#fff',
              color: activeTab === 'committed' ? '#fff' : '#000',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            My Prayer List
          </button>
          <button
            onClick={() => setActiveTab('myRequests')}
            style={{
              padding: '8px 16px',
              border: '1px solid #ccc',
              backgroundColor: activeTab === 'myRequests' ? '#007bff' : '#fff',
              color: activeTab === 'myRequests' ? '#fff' : '#000',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            My Requests
          </button>
        </div>
      </div>
      
      {isLoading && <p>Loading...</p>}
      
      {error && (
        <p style={{ color: 'red' }}>
          Error loading data. Please try again later.
        </p>
      )}
      
      {!isLoading && !error && prayerRequests && prayerRequests.length === 0 && (
        <p>{emptyMessage}</p>
      )}
      
      {!isLoading && !error && prayerRequests && prayerRequests.length > 0 && (
        <div>
          {prayerRequests.map((request) => (
            <PrayerRequestCard key={request._id} prayerRequest={request} />
          ))}
        </div>
      )}
    </div>
  );
};


import { useStytchSession } from '@stytch/react';
import { PrayerRequestCard } from './PrayerRequestCard';
import { useGetUserPrayerList } from '../api/prayerRequest.api';
import { useRequireAuth } from '../hooks/useRequireAuth';

interface PrayerListPageProps {
  onBack: () => void;
}

export const PrayerListPage = ({ onBack }: PrayerListPageProps) => {
  const { session } = useStytchSession();
  
  const { data: prayerRequests, isLoading, error } = useGetUserPrayerList();
  
  // Redirect to home if user logs out
  useRequireAuth(onBack);
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={onBack}>← Back</button>
        <h1 style={{ marginTop: '10px' }}>My Prayer List</h1>
        <p style={{ color: '#666' }}>
          These are the prayer requests you've committed to pray for.
        </p>
      </div>
      
      {isLoading && <p>Loading your prayer list...</p>}
      
      {error && (
        <p style={{ color: 'red' }}>
          Error loading your prayer list. Please try again later.
        </p>
      )}
      
      {!isLoading && !error && prayerRequests && prayerRequests.length === 0 && (
        <p>You haven't committed to pray for any requests yet. Visit the main feed to add some!</p>
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


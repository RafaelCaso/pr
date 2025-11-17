import { PrayerRequestForm } from './PrayerRequestForm';
import { PrayerRequestCard } from './PrayerRequestCard';
import { useGetAllPrayerRequests } from '../api/prayerRequest.api';

export const LandingPage = () => {
  const { data: prayerRequests, isLoading, error } = useGetAllPrayerRequests();
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ marginTop: 0 }}>Prayer Requests</h1>
      
      <PrayerRequestForm />
      
      <div>
        <h2>All Prayer Requests</h2>
        
        {isLoading && <p>Loading prayer requests...</p>}
        
        {error && (
          <p style={{ color: 'red' }}>
            Error loading prayer requests. Please try again later.
          </p>
        )}
        
        {!isLoading && !error && prayerRequests && prayerRequests.length === 0 && (
          <p>No prayer requests yet. Be the first to share one!</p>
        )}
        
        {!isLoading && !error && prayerRequests && prayerRequests.length > 0 && (
          <div>
            {prayerRequests.map((request) => (
              <PrayerRequestCard key={request._id} prayerRequest={request} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


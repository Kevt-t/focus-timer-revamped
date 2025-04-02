import { useEffect } from 'react';

const useAnalytics = () => {
  useEffect(() => {
    // Placeholder for analytics logic
    console.log('Analytics hook initialized');
  }, []);

  const trackEvent = (event: string) => {
    console.log(`Event tracked: ${event}`);
  };

  return { trackEvent };
};

export default useAnalytics;

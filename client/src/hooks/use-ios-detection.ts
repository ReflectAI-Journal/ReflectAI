import { useState, useEffect } from 'react';

export function useIsiOS() {
  const [isiOS, setIsiOS] = useState(false);

  useEffect(() => {
    // Check for iOS devices
    const detectiOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent) || 
             (userAgent.includes('mac') && 'ontouchend' in document);
    };

    setIsiOS(detectiOS());

    // No need for event listener as OS won't change during session
  }, []);

  return isiOS;
} 
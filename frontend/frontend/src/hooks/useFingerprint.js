import { useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

export const useFingerprint = () => {
  const [visitorId, setVisitorId] = useState(() => {
    return localStorage.getItem('jamboard_device_id') || '';
  });

  useEffect(() => {
    if (visitorId) return;

    const getFingerprint = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        const id = result.visitorId;
        localStorage.setItem('jamboard_device_id', id);
        setVisitorId(id);
      } catch (err) {
        // Fallback random hash if blocking scripts are active
        const fallback = 'anon_' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('jamboard_device_id', fallback);
        setVisitorId(fallback);
      }
    };

    getFingerprint();
  }, [visitorId]);

  return visitorId;
};
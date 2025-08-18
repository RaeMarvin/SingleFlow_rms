import { useCallback, useState } from 'react';

export const useSignalFlash = () => {
  const [isFlashing, setIsFlashing] = useState(false);

  const triggerSignalFlash = useCallback(() => {
    setIsFlashing(true);
    
    // Stop flashing after 500ms (single flash)
    setTimeout(() => {
      setIsFlashing(false);
    }, 500);
  }, []);

  return {
    isFlashing,
    triggerSignalFlash,
  };
};

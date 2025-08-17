import { useCallback, useState } from 'react';

export const useBorderFlash = () => {
  const [isFlashing, setIsFlashing] = useState(false);
  
  // Check if user is on desktop
  const isDesktop = useCallback(() => {
    return !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && 
           window.innerWidth > 768;
  }, []);

  const triggerBorderFlash = useCallback(() => {
    if (!isDesktop()) {
      console.log('Mobile detected - skipping border flash, confetti handled elsewhere');
      return;
    }

    console.log('Desktop detected - triggering border flash');
    
    setIsFlashing(true);
    
    // Stop flashing after 3 seconds (6 flashes at 0.5s each)
    setTimeout(() => {
      setIsFlashing(false);
    }, 3000);
  }, [isDesktop]);

  return {
    isFlashing,
    triggerBorderFlash,
  };
};

import { useEffect } from 'react';
import { useConfetti } from '../hooks/useConfetti';
import { useBorderFlash } from '../hooks/useBorderFlash';

export function ConfettiHandler() {
  const { triggerConfetti } = useConfetti();
  const { triggerBorderFlash } = useBorderFlash();

  useEffect(() => {
    const handleAchievementTrigger = (event: CustomEvent) => {
      console.log('Debug - Achievement event received:', event.detail);
      
      // Trigger confetti on mobile, border flash on desktop
      triggerConfetti();
      triggerBorderFlash();
      
      // Also dispatch a border flash event that the StatsPanel can listen to
      window.dispatchEvent(new CustomEvent('fozzle-border-flash-trigger', event));
    };

    // Listen for the custom achievement trigger event
    window.addEventListener('fozzle-confetti-trigger', handleAchievementTrigger as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('fozzle-confetti-trigger', handleAchievementTrigger as EventListener);
    };
  }, [triggerConfetti, triggerBorderFlash]);

  // This component renders nothing - it just handles events
  return null;
}

export default ConfettiHandler;

import { useEffect } from 'react';
import { useConfetti } from '../hooks/useConfetti';

export function ConfettiHandler() {
  const { triggerConfetti } = useConfetti();

  useEffect(() => {
    const handleConfettiTrigger = (event: CustomEvent) => {
      console.log('Debug - ConfettiHandler received event:', event.detail);
      triggerConfetti();
    };

    // Listen for the custom confetti trigger event
    window.addEventListener('fozzle-confetti-trigger', handleConfettiTrigger as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('fozzle-confetti-trigger', handleConfettiTrigger as EventListener);
    };
  }, [triggerConfetti]);

  // This component renders nothing - it just handles events
  return null;
}

export default ConfettiHandler;

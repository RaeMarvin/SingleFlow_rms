import { useEffect } from 'react';
import { useConfetti } from '../hooks/useConfetti';

const ConfettiHandler: React.FC = () => {
  const { triggerConfetti } = useConfetti();

  useEffect(() => {
    const handleConfettiTrigger = (event: CustomEvent) => {
      const { signalRatio } = event.detail;
      console.log('🎉 Confetti triggered! Signal ratio:', signalRatio);
      triggerConfetti();
    };

    // Listen for confetti trigger events
    window.addEventListener('fozzle-confetti-trigger', handleConfettiTrigger as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('fozzle-confetti-trigger', handleConfettiTrigger as EventListener);
    };
  }, [triggerConfetti]);

  // This component doesn't render anything
  return null;
};

export default ConfettiHandler;

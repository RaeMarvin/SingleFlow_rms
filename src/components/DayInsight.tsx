import React, { useEffect, useState, useRef } from 'react';
import { Star } from 'lucide-react';

interface DayInsightProps {
  todayPercent: number;
}

const NEEDS_IMPROVEMENT = [
  "You scored [X]% - this is totally normal as you're building your focus muscles.",
  "You're learning the Fozzle way! [X]% is a solid foundation - most people start here. Each day of practice makes your signal clearer and your focus stronger.",
  "Welcome to focus training! Your [X]% score shows you're taking the first steps. Review the Noise items to see how you can reduce them",
];

const REALLY_GOOD = [
  "Fantastic Fozzler! You scored [X]% - you're really getting the hang of spotting your signals. Keep this momentum going and watch your clarity soar!",
  "Impressive signal detection! [X]% shows you're mastering the art of saying no to noise. You're so close to focus mastery - keep pushing forward!",
  "Well done, Fozzler! Your [X]% score proves you're building serious priority skills. A few more tweaks and you'll be in the excellence zone!",
];

const EXCELLENT = [
  "Outstanding Fozzle mastery! You achieved [X]% Fozzle score today. You're operating at peak clarity - this is what focus excellence looks like!",
  "Incredible signal clarity! [X]% is focus perfection in action. You've truly mastered the art of prioritizing what matters. Keep this brilliant streak alive!",
  "Pure focus genius! Your [X]% score shows you've cracked the code of daily clarity. You're inspiring proof that Signal-to-Noise mastery is possible!",
];

const DayInsight: React.FC<DayInsightProps> = ({ todayPercent }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const p = Number.isFinite(todayPercent) ? todayPercent : 0;

    // clear any pending debounce
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    // start fade-out
    setVisible(false);

    // debounce selection to avoid rapid flicker on many quick updates
    debounceRef.current = window.setTimeout(() => {
      const bracket = p < 50 ? 'low' : p < 80 ? 'mid' : 'high';
      const arr = bracket === 'low' ? NEEDS_IMPROVEMENT : bracket === 'mid' ? REALLY_GOOD : EXCELLENT;
      // deterministic-ish selection: rotate by timestamp to reduce repeats
      const idx = Math.floor((Date.now() / 1000)) % arr.length;
      const chosen = arr[idx];
      setMessage(chosen.replace('[X]', `${Math.round(p)}`));
      // fade-in after setting message
      setVisible(true);
    }, 300);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [todayPercent]);

  if (!message) return null;

  const p = Math.round(todayPercent);
  const variant = p < 50 ? 'low' : p < 80 ? 'mid' : 'high';
  const accent = variant === 'low' ? 'text-noise-700' : variant === 'mid' ? 'text-primary-600' : 'text-yellow-500';
  const bgColor = variant === 'low' ? 'bg-noise-50' : variant === 'mid' ? 'bg-signal-50' : 'bg-yellow-50';
  const borderColor = variant === 'low' ? 'border-noise-200' : variant === 'mid' ? 'border-signal-200' : 'border-yellow-200';

  return (
    <div className={`rounded-xl shadow-sm p-4 border ${bgColor} ${borderColor}`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 mt-1 ${accent}`}>
          {/* Decorative icon */}
          {variant === 'high' ? (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l2.09 4.26L18.5 7l-3.5 2.5L15.18 14 12 11.8 8.82 14l.18-4.5L5.5 7l4.41-.74L12 2z"/></svg>
          ) : variant === 'mid' ? (
            <Star className="w-8 h-8" />
          ) : (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9" strokeWidth="1.5"/></svg>
          )}
        </div>

        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-700">Day Insight</div>
          <div className={`mt-2 text-sm text-gray-800 leading-relaxed transition-opacity duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`} role="status" aria-live="polite">
            {message}
          </div>
          {/* no CTA buttons as requested */}
        </div>
      </div>
    </div>
  );
};

export default DayInsight;

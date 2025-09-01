import React, { useEffect, useState } from 'react';

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

  useEffect(() => {
    const todayKey = new Date().toDateString();
    const storageKey = `dayInsight_${todayKey}`;

    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as { bracket: string; idx: number };
        // If bracket matches current percent range, reuse; otherwise pick new
        const pFloat = todayPercent; // use raw float for bracket boundaries
        const bracket = pFloat < 50 ? 'low' : pFloat < 80 ? 'mid' : 'high';
        if (parsed && parsed.bracket === bracket) {
          const arr = bracket === 'low' ? NEEDS_IMPROVEMENT : bracket === 'mid' ? REALLY_GOOD : EXCELLENT;
          const chosen = arr[parsed.idx % arr.length];
          setMessage(chosen.replace('[X]', `${Math.round(pFloat)}`));
          return;
        }
      }
    } catch (e) {
      // ignore storage errors
    }

    // pick a new one and persist
    const pFloat = todayPercent;
    const bracket = pFloat < 50 ? 'low' : pFloat < 80 ? 'mid' : 'high';
    const arr = bracket === 'low' ? NEEDS_IMPROVEMENT : bracket === 'mid' ? REALLY_GOOD : EXCELLENT;
    const idx = Math.floor(Math.random() * arr.length);
    const chosen = arr[idx];
    setMessage(chosen.replace('[X]', `${Math.round(pFloat)}`));

    try {
      const payload = JSON.stringify({ bracket, idx });
      sessionStorage.setItem(storageKey, payload);
    } catch (e) {
      // ignore
    }
  }, [todayPercent]);

  if (!message) return null;

  const p = Math.round(todayPercent);
  const variant = p < 50 ? 'low' : p < 80 ? 'mid' : 'high';
  const accent = variant === 'low' ? 'text-noise-700' : variant === 'mid' ? 'text-signal-700' : 'text-yellow-500';

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 mt-1 ${accent}`}>
          {/* Decorative icon */}
          {variant === 'high' ? (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l2.09 4.26L18.5 7l-3.5 2.5L15.18 14 12 11.8 8.82 14l.18-4.5L5.5 7l4.41-.74L12 2z"/></svg>
          ) : variant === 'mid' ? (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 2v6M2 12h6M12 22v-6M22 12h-6M4.9 4.9l4.24 4.24M18.9 18.9l-4.24-4.24M4.9 19.1l4.24-4.24M18.9 5.1l-4.24 4.24"/></svg>
          ) : (
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9" strokeWidth="1.5"/></svg>
          )}
        </div>

        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-700">Day Insight</div>
          <div className="mt-2 text-sm text-gray-800 leading-relaxed" role="status" aria-live="polite">
            {message}
          </div>
          {/* no CTA buttons as requested */}
        </div>
      </div>
    </div>
  );
};

export default DayInsight;

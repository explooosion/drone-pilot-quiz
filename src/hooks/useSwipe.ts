import { useCallback, useRef } from 'react';
import type React from 'react';

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

/**
 * Returns touch handlers that fire onSwipeLeft / onSwipeRight when
 * a horizontal swipe exceeds the threshold (default 50 px).
 * Vertical-dominant gestures (scrolling) are ignored.
 */
export function useSwipe(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  threshold = 50,
): SwipeHandlers {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (startX.current === null || startY.current === null) return;
      const dx = e.changedTouches[0].clientX - startX.current;
      const dy = e.changedTouches[0].clientY - startY.current;
      startX.current = null;
      startY.current = null;
      // Ignore when vertical scroll dominates
      if (Math.abs(dy) > Math.abs(dx)) return;
      if (Math.abs(dx) < threshold) return;
      if (dx < 0) onSwipeLeft();
      else onSwipeRight();
    },
    [onSwipeLeft, onSwipeRight, threshold],
  );

  return { onTouchStart, onTouchEnd };
}

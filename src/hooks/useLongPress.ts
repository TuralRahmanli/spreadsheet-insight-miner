import { useCallback, useRef, useState } from 'react';

interface LongPressOptions {
  onLongPress: (event?: React.TouchEvent | React.MouseEvent) => void;
  onPress?: (event?: React.TouchEvent | React.MouseEvent) => void;
  onRelease?: (event?: React.TouchEvent | React.MouseEvent) => void;
  delay?: number;
  shouldPreventDefault?: boolean;
  shouldStopPropagation?: boolean;
}

export const useLongPress = ({
  onLongPress,
  onPress,
  onRelease,
  delay = 500,
  shouldPreventDefault = true,
  shouldStopPropagation = true
}: LongPressOptions) => {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<NodeJS.Timeout>();
  const target = useRef<EventTarget>();

  const start = useCallback(
    (event: React.TouchEvent | React.MouseEvent) => {
      if (shouldStopPropagation) {
        event.stopPropagation();
      }
      
      if (shouldPreventDefault) {
        event.preventDefault();
      }

      onPress?.(event);
      target.current = event.target;
      timeout.current = setTimeout(() => {
        onLongPress(event);
        setLongPressTriggered(true);
      }, delay);
    },
    [onLongPress, onPress, delay, shouldPreventDefault, shouldStopPropagation]
  );

  const clear = useCallback(
    (event: React.TouchEvent | React.MouseEvent, shouldTriggerOnRelease = true) => {
      timeout.current && clearTimeout(timeout.current);
      shouldTriggerOnRelease && onRelease?.(event);
      setLongPressTriggered(false);
    },
    [onRelease]
  );

  return {
    onTouchStart: (event: React.TouchEvent) => start(event),
    onTouchEnd: (event: React.TouchEvent) => clear(event),
    onMouseDown: (event: React.MouseEvent) => start(event),
    onMouseUp: (event: React.MouseEvent) => clear(event),
    onMouseLeave: (event: React.MouseEvent) => clear(event, false),
    longPressTriggered
  };
};
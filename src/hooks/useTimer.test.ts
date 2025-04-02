import { renderHook, act } from '@testing-library/react-hooks';
import { useTimer } from './useTimer';

// Define test phases
const testPhases = [
  { label: 'Focus', duration: 1500 }, // 25 minutes
  { label: 'Break', duration: 300 },  // 5 minutes
];

describe('useTimer Hook', () => {
  it('should initialize with the correct default time', () => {
    const { result } = renderHook(() => useTimer(testPhases));
    expect(result.current.time).toBe(testPhases[0].duration);
    expect(result.current.currentPhaseIndex).toBe(0);
  });

  it('should start the timer and transition to RUNNING state', () => {
    const { result } = renderHook(() => useTimer(testPhases));
    act(() => {
      result.current.start();
    });
    expect(result.current.isActive).toBe(true);
  });

  it('should pause the timer and transition to PAUSED state', () => {
    const { result } = renderHook(() => useTimer(testPhases));
    act(() => {
      result.current.start();
      result.current.pause();
    });
    expect(result.current.isPaused).toBe(true);
  });

  it('should resume the timer from PAUSED state', () => {
    const { result } = renderHook(() => useTimer(testPhases));
    act(() => {
      result.current.start();
      result.current.pause();
      result.current.resume();
    });
    expect(result.current.isPaused).toBe(false);
  });

  it('should reset the timer to IDLE state', () => {
    const { result } = renderHook(() => useTimer(testPhases));
    act(() => {
      result.current.start();
      result.current.reset();
    });
    expect(result.current.isActive).toBe(false);
    expect(result.current.currentPhaseIndex).toBe(0);
  });
});

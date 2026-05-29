import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JuiceManager } from '../shared/systems/JuiceManager';

describe('JuiceManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.className = '';
  });

  it('should trigger success flash class', () => {
    JuiceManager.success();
    expect(document.body.classList.contains('reality-success-flash')).toBe(true);
    vi.advanceTimersByTime(400);
    expect(document.body.classList.contains('reality-success-flash')).toBe(false);
  });

  it('should trigger danger vignette class', () => {
    JuiceManager.danger();
    expect(document.body.classList.contains('reality-danger-vignette')).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(document.body.classList.contains('reality-danger-vignette')).toBe(false);
  });

  it('should notify shake listeners', () => {
    const listener = vi.fn();
    const unsubscribe = JuiceManager.subscribe(listener);

    JuiceManager.shake(15);
    expect(listener).toHaveBeenCalledWith(15);

    vi.advanceTimersByTime(120);
    expect(listener).toHaveBeenCalledWith(0);

    unsubscribe();
  });
});

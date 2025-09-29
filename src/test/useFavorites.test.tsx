import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites } from '@/hooks/useFavorites';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty favorites when localStorage is empty', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useFavorites());
    
    expect(result.current.favoriteCount).toBe(0);
    expect(result.current.isFavorite('test-id')).toBe(false);
  });

  it('loads existing favorites from localStorage', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(['launch1', 'launch2']));
    
    const { result } = renderHook(() => useFavorites());
    
    expect(result.current.favoriteCount).toBe(2);
    expect(result.current.isFavorite('launch1')).toBe(true);
    expect(result.current.isFavorite('launch2')).toBe(true);
    expect(result.current.isFavorite('launch3')).toBe(false);
  });

  it('adds a favorite and persists to localStorage', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
    
    const { result } = renderHook(() => useFavorites());
    
    act(() => {
      result.current.toggleFavorite('new-launch');
    });
    
    expect(result.current.favoriteCount).toBe(1);
    expect(result.current.isFavorite('new-launch')).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'spacex-favorites',
      JSON.stringify(['new-launch'])
    );
  });

  it('removes a favorite and persists to localStorage', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify(['launch1', 'launch2']));
    
    const { result } = renderHook(() => useFavorites());
    
    act(() => {
      result.current.toggleFavorite('launch1');
    });
    
    expect(result.current.favoriteCount).toBe(1);
    expect(result.current.isFavorite('launch1')).toBe(false);
    expect(result.current.isFavorite('launch2')).toBe(true);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'spacex-favorites',
      JSON.stringify(['launch2'])
    );
  });

  it('handles invalid JSON in localStorage gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json');
    
    const { result } = renderHook(() => useFavorites());
    
    expect(result.current.favoriteCount).toBe(0);
    expect(result.current.isFavorite('test-id')).toBe(false);
  });

  it('toggles favorite multiple times correctly', () => {
    localStorageMock.getItem.mockReturnValue(JSON.stringify([]));
    
    const { result } = renderHook(() => useFavorites());
    
    // Add favorite
    act(() => {
      result.current.toggleFavorite('test-launch');
    });
    expect(result.current.isFavorite('test-launch')).toBe(true);
    
    // Remove favorite
    act(() => {
      result.current.toggleFavorite('test-launch');
    });
    expect(result.current.isFavorite('test-launch')).toBe(false);
    
    // Add again
    act(() => {
      result.current.toggleFavorite('test-launch');
    });
    expect(result.current.isFavorite('test-launch')).toBe(true);
  });
});
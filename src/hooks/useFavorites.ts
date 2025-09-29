import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'spacex-favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      try {
        const favoriteIds = JSON.parse(stored);
        setFavorites(new Set(favoriteIds));
      } catch (error) {
        console.error('Failed to parse favorites from localStorage:', error);
      }
    }
  }, []);

  const toggleFavorite = (launchId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(launchId)) {
        newFavorites.delete(launchId);
      } else {
        newFavorites.add(launchId);
      }
      
      // Save to localStorage
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(newFavorites)));
      
      return newFavorites;
    });
  };

  const isFavorite = (launchId: string) => favorites.has(launchId);

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    favoriteCount: favorites.size,
  };
};
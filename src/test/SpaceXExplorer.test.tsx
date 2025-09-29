import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SpaceXExplorer from '@/pages/SpaceXExplorer';
import { mockLaunches, mockRockets } from './mocks';

// Mock the API hooks
vi.mock('@/hooks/useSpaceXAPI', () => ({
  useSpaceXLaunches: () => ({
    data: mockLaunches,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  }),
  useSpaceXRocket: (rocketId: string) => ({
    data: mockRockets[rocketId],
    isLoading: false,
    error: null,
  }),
}));

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

const renderWithQueryClient = (component: React.ReactNode) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('SpaceXExplorer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('[]');
  });

  describe('Rendering and filtering the list', () => {
    it('renders the SpaceX Mission Explorer with all launches', () => {
      renderWithQueryClient(<SpaceXExplorer />);
      
      expect(screen.getByText('SpaceX Mission Explorer')).toBeInTheDocument();
      expect(screen.getByText('Test Mission 1')).toBeInTheDocument();
      expect(screen.getByText('Failed Mission')).toBeInTheDocument();
      expect(screen.getByText('Upcoming Mission')).toBeInTheDocument();
      expect(screen.getByText('Showing 3 of 3 launches')).toBeInTheDocument();
    });

    it('filters launches by search term', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SpaceXExplorer />);
      
      const searchInput = screen.getByPlaceholderText('Search missions...');
      await user.type(searchInput, 'Test Mission 1');
      
      await waitFor(() => {
        expect(screen.getByText('Test Mission 1')).toBeInTheDocument();
        expect(screen.queryByText('Failed Mission')).not.toBeInTheDocument();
        expect(screen.queryByText('Upcoming Mission')).not.toBeInTheDocument();
        expect(screen.getByText('Showing 1 of 3 launches')).toBeInTheDocument();
      });
    });

    it('filters launches by year', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SpaceXExplorer />);
      
      // Click on year select
      const yearSelect = screen.getByRole('combobox');
      await user.click(yearSelect);
      
      // Select 2024
      const year2024Option = screen.getByText('2024');
      await user.click(year2024Option);
      
      await waitFor(() => {
        expect(screen.getByText('Test Mission 1')).toBeInTheDocument();
        expect(screen.queryByText('Failed Mission')).not.toBeInTheDocument();
        expect(screen.queryByText('Upcoming Mission')).not.toBeInTheDocument();
        expect(screen.getByText('Showing 1 of 3 launches')).toBeInTheDocument();
      });
    });

    it('filters successful missions only', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SpaceXExplorer />);
      
      const successfulOnlyCheckbox = screen.getByLabelText('Successful missions only');
      await user.click(successfulOnlyCheckbox);
      
      await waitFor(() => {
        expect(screen.getByText('Test Mission 1')).toBeInTheDocument();
        expect(screen.queryByText('Failed Mission')).not.toBeInTheDocument();
        expect(screen.queryByText('Upcoming Mission')).not.toBeInTheDocument();
        expect(screen.getByText('Showing 1 of 3 launches')).toBeInTheDocument();
      });
    });

    it('shows empty state when no missions match filters', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SpaceXExplorer />);
      
      const searchInput = screen.getByPlaceholderText('Search missions...');
      await user.type(searchInput, 'NonexistentMission');
      
      await waitFor(() => {
        expect(screen.getByText('No missions found')).toBeInTheDocument();
        expect(screen.getByText('Try adjusting your filters to see more results.')).toBeInTheDocument();
      });
    });
  });

  describe('Favorites toggle and persistence', () => {
    it('allows adding and removing favorites', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SpaceXExplorer />);
      
      // Find the first mission card and its favorite button
      const missionCard = screen.getByText('Test Mission 1').closest('.group');
      expect(missionCard).toBeInTheDocument();
      
      const favoriteButton = missionCard!.querySelector('[data-testid="favorite-button"]') || 
                            missionCard!.querySelector('button');
      expect(favoriteButton).toBeInTheDocument();
      
      // Click to add to favorites
      await user.click(favoriteButton!);
      
      // Check that localStorage.setItem was called
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'spacex-favorites',
        JSON.stringify(['1'])
      );
    });

    it('shows favorites only when favorites filter is active', async () => {
      const user = userEvent.setup();
      
      // Mock localStorage to return a favorite
      localStorageMock.getItem.mockReturnValue(JSON.stringify(['1']));
      
      renderWithQueryClient(<SpaceXExplorer />);
      
      // Click the favorites button
      const favoritesButton = screen.getByText(/Favorites/);
      await user.click(favoritesButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test Mission 1')).toBeInTheDocument();
        expect(screen.queryByText('Failed Mission')).not.toBeInTheDocument();
        expect(screen.queryByText('Upcoming Mission')).not.toBeInTheDocument();
        expect(screen.getByText(/from your 1 favorites/)).toBeInTheDocument();
      });
    });

    it('shows empty favorites state when no favorites exist', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SpaceXExplorer />);
      
      // Click the favorites button
      const favoritesButton = screen.getByText(/Favorites/);
      await user.click(favoritesButton);
      
      await waitFor(() => {
        expect(screen.getByText('No missions found')).toBeInTheDocument();
        expect(screen.getByText("You haven't favorited any missions yet.")).toBeInTheDocument();
      });
    });
  });

  describe('Detail view rendering', () => {
    it('opens mission modal when view details is clicked', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SpaceXExplorer />);
      
      // Find and click the "View Details" button for the first mission
      const viewDetailsButtons = screen.getAllByText('View Details');
      await user.click(viewDetailsButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Test Mission 1')).toBeInTheDocument();
        expect(screen.getByText('Mission Success')).toBeInTheDocument();
        expect(screen.getByText('Flight #1')).toBeInTheDocument();
      });
    });

    it('displays mission patch image in modal', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SpaceXExplorer />);
      
      const viewDetailsButtons = screen.getAllByText('View Details');
      await user.click(viewDetailsButtons[0]);
      
      await waitFor(() => {
        const patchImage = screen.getByAltText('Test Mission 1 mission patch');
        expect(patchImage).toBeInTheDocument();
        expect(patchImage).toHaveAttribute('src', 'https://example.com/patch-large.png');
      });
    });

    it('displays mission details and description', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SpaceXExplorer />);
      
      const viewDetailsButtons = screen.getAllByText('View Details');
      await user.click(viewDetailsButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Mission Details')).toBeInTheDocument();
        expect(screen.getByText('This is a test mission description.')).toBeInTheDocument();
      });
    });

    it('displays rocket information', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SpaceXExplorer />);
      
      const viewDetailsButtons = screen.getAllByText('View Details');
      await user.click(viewDetailsButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Rocket: Falcon 9')).toBeInTheDocument();
        expect(screen.getByText('97%')).toBeInTheDocument(); // Success rate
        expect(screen.getByText('$62,000,000')).toBeInTheDocument(); // Cost
      });
    });

    it('displays links and resources', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SpaceXExplorer />);
      
      const viewDetailsButtons = screen.getAllByText('View Details');
      await user.click(viewDetailsButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByText('Links & Resources')).toBeInTheDocument();
        expect(screen.getByText('Watch Webcast')).toBeInTheDocument();
        expect(screen.getByText('Wikipedia')).toBeInTheDocument();
        expect(screen.getByText('Article')).toBeInTheDocument();
        expect(screen.getByText('Press Kit')).toBeInTheDocument();
      });
    });

    it('closes modal when close button is clicked', async () => {
      const user = userEvent.setup();
      renderWithQueryClient(<SpaceXExplorer />);
      
      // Open modal
      const viewDetailsButtons = screen.getAllByText('View Details');
      await user.click(viewDetailsButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      
      // Close modal
      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });
});
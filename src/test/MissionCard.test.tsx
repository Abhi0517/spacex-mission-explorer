import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MissionCard } from '@/components/MissionCard';
import { mockLaunches } from './mocks';

// Mock the favorites hook
vi.mock('@/hooks/useFavorites', () => ({
  useFavorites: () => ({
    isFavorite: vi.fn(() => false),
    toggleFavorite: vi.fn(),
  }),
}));

describe('MissionCard', () => {
  const mockOnViewDetails = vi.fn();
  const testLaunch = mockLaunches[0];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders mission card with basic information', () => {
    render(
      <MissionCard 
        launch={testLaunch} 
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText('Test Mission 1')).toBeInTheDocument();
    expect(screen.getByText('Flight #1')).toBeInTheDocument();
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('View Details')).toBeInTheDocument();
  });

  it('calls onViewDetails when view details button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MissionCard 
        launch={testLaunch} 
        onViewDetails={mockOnViewDetails}
      />
    );

    const viewDetailsButton = screen.getByText('View Details');
    await user.click(viewDetailsButton);

    expect(mockOnViewDetails).toHaveBeenCalledWith(testLaunch);
  });

  it('displays mission patch image when available', () => {
    render(
      <MissionCard 
        launch={testLaunch} 
        onViewDetails={mockOnViewDetails}
      />
    );

    const patchImage = screen.getByAltText('Test Mission 1 mission patch');
    expect(patchImage).toBeInTheDocument();
    expect(patchImage).toHaveAttribute('src', testLaunch.links.patch.small);
  });

  it('handles failed missions correctly', () => {
    const failedLaunch = mockLaunches[1];
    render(
      <MissionCard 
        launch={failedLaunch} 
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText('Failed Mission')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('handles upcoming missions correctly', () => {
    const upcomingLaunch = mockLaunches[2];
    render(
      <MissionCard 
        launch={upcomingLaunch} 
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByText('Upcoming Mission')).toBeInTheDocument();
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
  });
});
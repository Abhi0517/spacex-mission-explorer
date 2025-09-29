import { useState, useMemo } from 'react';
import { useSpaceXLaunches } from '@/hooks/useSpaceXAPI';
import { useFavorites } from '@/hooks/useFavorites';
import { useDebounce } from '@/hooks/useDebounce';
import { LaunchFilters, SpaceXLaunch } from '@/types/spacex';
import { MissionCard } from '@/components/MissionCard';
import { LaunchFiltersComponent } from '@/components/LaunchFilters';
import { MissionModal } from '@/components/MissionModal';
import { LoadingGrid } from '@/components/LoadingGrid';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Rocket, RefreshCw } from 'lucide-react';

const SpaceXExplorer = () => {
  const [filters, setFilters] = useState<LaunchFilters>({
    search: '',
    year: 'all',
    successfulOnly: false,
    favoritesOnly: false,
  });
  
  const [selectedLaunch, setSelectedLaunch] = useState<SpaceXLaunch | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { data: launches, isLoading, error, refetch } = useSpaceXLaunches();
  const { favorites, favoriteCount, isFavorite } = useFavorites();
  const debouncedSearch = useDebounce(filters.search, 300);

  const filteredLaunches = useMemo(() => {
    if (!launches) return [];

    return launches.filter(launch => {
      // Search filter
      if (debouncedSearch && !launch.name.toLowerCase().includes(debouncedSearch.toLowerCase())) {
        return false;
      }

      // Year filter
      if (filters.year && filters.year !== 'all') {
        const launchYear = new Date(launch.date_utc).getFullYear().toString();
        if (launchYear !== filters.year) return false;
      }

      // Success filter
      if (filters.successfulOnly && launch.success !== true) {
        return false;
      }

      // Favorites filter
      if (filters.favoritesOnly && !isFavorite(launch.id)) {
        return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date_utc).getTime() - new Date(a.date_utc).getTime());
  }, [launches, debouncedSearch, filters.year, filters.successfulOnly, filters.favoritesOnly, isFavorite]);

  const handleViewDetails = (launch: SpaceXLaunch) => {
    setSelectedLaunch(launch);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLaunch(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Rocket className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">SpaceX Mission Explorer</h1>
                <p className="text-muted-foreground">
                  Fetch real data from the SpaceX public API. Filter, explore, and favorite launches.
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <LaunchFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          favoriteCount={favoriteCount}
        />

        {/* Error State */}
        {error && (
          <Alert className="mt-6 border-destructive/50 bg-destructive/10">
            <AlertDescription className="text-destructive">
              Failed to load SpaceX launches. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="mt-8">
            <LoadingGrid />
          </div>
        ) : (
          <div className="mt-8">
            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing {filteredLaunches.length} of {launches?.length || 0} launches
                {filters.favoritesOnly && ` from your ${favoriteCount} favorites`}
                {filters.successfulOnly && ' (successful only)'}
                {filters.year && ` from ${filters.year}`}
                {debouncedSearch && ` matching "${debouncedSearch}"`}
              </p>
            </div>

            {/* Mission Grid */}
            {filteredLaunches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLaunches.map((launch) => (
                  <MissionCard
                    key={launch.id}
                    launch={launch}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Rocket className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No missions found</h3>
                <p className="text-muted-foreground">
                  {filters.favoritesOnly
                    ? "You haven't favorited any missions yet."
                    : "Try adjusting your filters to see more results."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mission Details Modal */}
      <MissionModal
        launch={selectedLaunch}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default SpaceXExplorer;
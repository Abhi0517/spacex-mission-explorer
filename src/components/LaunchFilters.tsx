import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Search } from 'lucide-react';
import { LaunchFilters } from '@/types/spacex';

interface LaunchFiltersProps {
  filters: LaunchFilters;
  onFiltersChange: (filters: LaunchFilters) => void;
  favoriteCount: number;
}

export const LaunchFiltersComponent = ({ filters, onFiltersChange, favoriteCount }: LaunchFiltersProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2005 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-4 p-6 bg-card border border-border rounded-xl">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by mission name (e.g., Starlink, CRS, Demo...)"
              value={filters.search}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select
            value={filters.year}
            onValueChange={(value) => onFiltersChange({ ...filters, year: value })}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant={filters.successfulOnly ? "default" : "outline"}
            onClick={() => onFiltersChange({ ...filters, successfulOnly: !filters.successfulOnly })}
            className="whitespace-nowrap"
          >
            Successful only
          </Button>
          
          <Button
            variant={filters.favoritesOnly ? "default" : "outline"}
            onClick={() => onFiltersChange({ ...filters, favoritesOnly: !filters.favoritesOnly })}
            className="whitespace-nowrap"
          >
            <Heart className="w-4 h-4 mr-2" />
            Favorites
            {favoriteCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {favoriteCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
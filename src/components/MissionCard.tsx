import { SpaceXLaunch } from '@/types/spacex';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Calendar, Rocket, ExternalLink } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { format } from 'date-fns';

interface MissionCardProps {
  launch: SpaceXLaunch;
  onViewDetails: (launch: SpaceXLaunch) => void;
}

export const MissionCard = ({ launch, onViewDetails }: MissionCardProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy, HH:mm:ss');
    } catch {
      return 'TBD';
    }
  };

  const getStatusBadge = () => {
    if (launch.upcoming) {
      return <Badge variant="secondary">Upcoming</Badge>;
    }
    if (launch.success === true) {
      return <Badge variant="success">Success</Badge>;
    }
    if (launch.success === false) {
      return <Badge variant="destructive">Failed</Badge>;
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  return (
    <Card className="mission-card group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {launch.name}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(launch.date_local)}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Rocket className="w-4 h-4" />
              <span>Flight #{launch.flight_number}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleFavorite(launch.id)}
              className="favorite-btn"
              data-testid="favorite-button"
            >
              <Heart 
                className={`w-4 h-4 ${isFavorite(launch.id) ? 'fill-accent text-accent' : 'text-muted-foreground'}`} 
              />
            </Button>
            {launch.links.patch.small && (
              <img 
                src={launch.links.patch.small} 
                alt={`${launch.name} mission patch`}
                className="w-12 h-12 rounded-full object-cover bg-muted"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
          </div>
        </div>

        <div className="space-y-2">
          {getStatusBadge()}
          {launch.details && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {launch.details}
            </p>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="px-6 py-4 border-t border-border">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onViewDetails(launch)}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};
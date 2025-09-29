import { SpaceXLaunch } from '@/types/spacex';
import { useSpaceXRocket } from '@/hooks/useSpaceXAPI';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, 
  Rocket, 
  ExternalLink, 
  Youtube, 
  Globe,
  Heart,
  Target,
  DollarSign
} from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { format } from 'date-fns';

interface MissionModalProps {
  launch: SpaceXLaunch | null;
  isOpen: boolean;
  onClose: () => void;
}

export const MissionModal = ({ launch, isOpen, onClose }: MissionModalProps) => {
  const { data: rocket, isLoading: isLoadingRocket } = useSpaceXRocket(launch?.rocket || '');
  const { isFavorite, toggleFavorite } = useFavorites();

  if (!launch) return null;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'EEEE, MMMM d, yyyy \'at\' HH:mm:ss');
    } catch {
      return 'Date TBD';
    }
  };

  const getStatusBadge = () => {
    if (launch.upcoming) {
      return <Badge variant="secondary">Upcoming</Badge>;
    }
    if (launch.success === true) {
      return <Badge variant="success">Mission Success</Badge>;
    }
    if (launch.success === false) {
      return <Badge variant="destructive">Mission Failed</Badge>;
    }
    return <Badge variant="secondary">Status Unknown</Badge>;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold">{launch.name}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge()}
                <Badge variant="outline">Flight #{launch.flight_number}</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(launch.id)}
              >
                <Heart 
                  className={`w-5 h-5 ${isFavorite(launch.id) ? 'fill-accent text-accent' : 'text-muted-foreground'}`} 
                />
              </Button>
              {launch.links.patch.large && (
                <img 
                  src={launch.links.patch.large} 
                  alt={`${launch.name} mission patch`}
                  className="w-16 h-16 rounded-full object-cover bg-muted"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Mission Details */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Mission Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Launch Date</p>
                    <p className="font-medium">{formatDate(launch.date_local)}</p>
                  </div>
                </div>
                {rocket && (
                  <div className="flex items-center gap-3">
                    <Rocket className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Rocket</p>
                      <p className="font-medium">{rocket.name}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {launch.details && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-foreground leading-relaxed">{launch.details}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rocket Information */}
          {isLoadingRocket ? (
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ) : rocket ? (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Rocket: {rocket.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="font-medium">{rocket.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{rocket.company}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="font-medium">{rocket.success_rate_pct}%</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Cost per Launch</p>
                      <p className="font-medium">${rocket.cost_per_launch.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-foreground leading-relaxed">{rocket.description}</p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Links */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Links & Resources</h3>
              <div className="flex flex-wrap gap-2">
                {launch.links.webcast && (
                  <Button variant="outline" asChild>
                    <a href={launch.links.webcast} target="_blank" rel="noopener noreferrer">
                      <Youtube className="w-4 h-4 mr-2" />
                      Watch Webcast
                    </a>
                  </Button>
                )}
                {launch.links.wikipedia && (
                  <Button variant="outline" asChild>
                    <a href={launch.links.wikipedia} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Wikipedia
                    </a>
                  </Button>
                )}
                {launch.links.article && (
                  <Button variant="outline" asChild>
                    <a href={launch.links.article} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Article
                    </a>
                  </Button>
                )}
                {launch.links.presskit && (
                  <Button variant="outline" asChild>
                    <a href={launch.links.presskit} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Press Kit
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
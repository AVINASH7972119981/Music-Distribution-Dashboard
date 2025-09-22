import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Track } from "@shared/schema";
import { TrendingUp } from "lucide-react";

export default function TopTracks() {
  const { data: tracks, isLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks"],
  });

  // Sort tracks by plays and take top 4
  const topTracks = tracks
    ?.sort((a, b) => (b.plays || 0) - (a.plays || 0))
    .slice(0, 4) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Tracks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle data-testid="text-top-tracks-title">Top Performing Tracks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topTracks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground" data-testid="text-no-tracks">
                No tracks uploaded yet. Upload your first track to see analytics!
              </p>
            </div>
          ) : (
            topTracks.map((track, index) => (
              <div 
                key={track.id} 
                className="flex items-center space-x-3"
                data-testid={`track-item-${index}`}
              >
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-sm font-medium">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p 
                    className="font-medium text-foreground truncate"
                    data-testid={`text-track-title-${index}`}
                  >
                    {track.title}
                  </p>
                  <p 
                    className="text-sm text-muted-foreground"
                    data-testid={`text-track-plays-${index}`}
                  >
                    {(track.plays || 0).toLocaleString()} plays
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center text-secondary text-sm font-medium">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span data-testid={`text-track-growth-${index}`}>
                      {Math.floor(Math.random() * 30) + 5}%
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {topTracks.length > 0 && (
          <Button 
            variant="ghost" 
            className="w-full mt-4 text-primary hover:text-primary/80"
            data-testid="button-view-all-tracks"
          >
            View All Tracks →
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

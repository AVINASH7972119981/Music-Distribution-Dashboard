import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Playlist } from "@shared/schema";
import { Play, Share, MoreHorizontal } from "lucide-react";

export default function PlaylistManagement() {
  const { toast } = useToast();

  const { data: playlists, isLoading } = useQuery<Playlist[]>({
    queryKey: ["/api/playlists"],
  });

  const createPlaylistMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/playlists", {
        title: "New Playlist",
        description: "A new playlist",
        isPublic: true,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/playlists"] });
      toast({
        title: "Playlist created",
        description: "Your new playlist has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Create failed",
        description: "Failed to create playlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Playlists</CardTitle>
            <Skeleton className="h-5 w-20" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle data-testid="text-playlists-title">Playlists</CardTitle>
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary/80"
            data-testid="button-manage-all-playlists"
          >
            Manage All →
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {!playlists || playlists.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground mb-4" data-testid="text-no-playlists">
                No playlists created yet. Create your first playlist!
              </p>
              <Button 
                onClick={() => createPlaylistMutation.mutate()}
                disabled={createPlaylistMutation.isPending}
                data-testid="button-create-first-playlist"
              >
                Create Playlist
              </Button>
            </div>
          ) : (
            playlists.map((playlist, index) => (
              <div 
                key={playlist.id} 
                className="bg-muted/50 p-4 rounded-lg border border-border hover:shadow-md transition-shadow"
                data-testid={`playlist-item-${index}`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {playlist.trackCount || 0}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="font-medium text-foreground truncate"
                      data-testid={`text-playlist-title-${index}`}
                    >
                      {playlist.title}
                    </h4>
                    <p 
                      className="text-sm text-muted-foreground"
                      data-testid={`text-playlist-meta-${index}`}
                    >
                      {playlist.trackCount || 0} tracks • {formatDuration(playlist.totalDuration || 0)}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    data-testid={`button-playlist-menu-${index}`}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span 
                    className="text-muted-foreground"
                    data-testid={`text-playlist-plays-${index}`}
                  >
                    {(playlist.plays || 0).toLocaleString()} plays
                  </span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-6 w-6 text-primary hover:text-primary/80"
                      data-testid={`button-share-playlist-${index}`}
                    >
                      <Share className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-6 w-6 text-secondary hover:text-secondary/80"
                      data-testid={`button-play-playlist-${index}`}
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

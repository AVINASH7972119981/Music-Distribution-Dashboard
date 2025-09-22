import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import UploadZone from "../ui/upload-zone";
import { Track } from "@shared/schema";
import { Play, Edit, Trash2, Plus } from "lucide-react";

export default function TrackManagement() {
  const { toast } = useToast();
  const [showUploadZone, setShowUploadZone] = useState(false);

  const { data: tracks, isLoading } = useQuery<Track[]>({
    queryKey: ["/api/tracks"],
  });

  const deleteTrackMutation = useMutation({
    mutationFn: async (trackId: string) => {
      await apiRequest("DELETE", `/api/tracks/${trackId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Track deleted",
        description: "The track has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete the track. Please try again.",
        variant: "destructive",
      });
    },
  });

  const playTrackMutation = useMutation({
    mutationFn: async (trackId: string) => {
      await apiRequest("POST", `/api/tracks/${trackId}/play`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "secondary";
      case "processing":
        return "default";
      case "draft":
        return "outline";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Track Management</CardTitle>
            <div className="flex space-x-3">
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-36" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full mb-6" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
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
          <CardTitle data-testid="text-track-management-title">Track Management</CardTitle>
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => {/* TODO: Implement playlist creation */}}
              data-testid="button-create-playlist"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Playlist
            </Button>
            <Button 
              onClick={() => setShowUploadZone(!showUploadZone)}
              data-testid="button-toggle-upload"
            >
              <Plus className="h-4 w-4 mr-2" />
              Upload New Track
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {showUploadZone && (
          <div className="mb-6">
            <UploadZone onUpload={() => setShowUploadZone(false)} />
          </div>
        )}

        <div className="space-y-4">
          <h4 className="text-md font-semibold text-foreground">Recent Uploads</h4>
          
          {!tracks || tracks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground" data-testid="text-no-tracks-uploaded">
                No tracks uploaded yet. Upload your first track to get started!
              </p>
            </div>
          ) : (
            tracks
              .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
              .slice(0, 5)
              .map((track) => (
                <div 
                  key={track.id} 
                  className="track-item bg-muted/50 p-4 rounded-lg border border-border"
                  data-testid={`track-item-${track.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-card rounded-lg flex items-center justify-center">
                        <span className="text-xs font-medium text-muted-foreground">
                          {formatDuration(track.duration)}
                        </span>
                      </div>
                      <div>
                        <h5 
                          className="font-medium text-foreground"
                          data-testid={`text-track-title-${track.id}`}
                        >
                          {track.title}
                        </h5>
                        <p 
                          className="text-sm text-muted-foreground"
                          data-testid={`text-track-meta-${track.id}`}
                        >
                          Uploaded {new Date(track.createdAt!).toLocaleDateString()} • {formatDuration(track.duration)} • 320kbps
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge 
                            variant={getStatusColor(track.status)}
                            data-testid={`badge-track-status-${track.id}`}
                          >
                            {track.status === "published" && "✓ "}
                            {track.status === "processing" && "⏱ "}
                            {track.status.charAt(0).toUpperCase() + track.status.slice(1)}
                          </Badge>
                          <span 
                            className="text-xs text-muted-foreground"
                            data-testid={`text-track-plays-${track.id}`}
                          >
                            {(track.plays || 0).toLocaleString()} plays
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => playTrackMutation.mutate(track.id)}
                        disabled={playTrackMutation.isPending}
                        data-testid={`button-play-track-${track.id}`}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`button-edit-track-${track.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTrackMutation.mutate(track.id)}
                        disabled={deleteTrackMutation.isPending}
                        className="text-muted-foreground hover:text-destructive"
                        data-testid={`button-delete-track-${track.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
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

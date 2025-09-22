import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CloudUpload, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onUpload?: () => void;
}

export default function UploadZone({ onUpload }: UploadZoneProps) {
  const { toast } = useToast();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");

  const uploadTrackMutation = useMutation({
    mutationFn: async (trackData: any) => {
      const res = await apiRequest("POST", "/api/tracks", trackData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Track uploaded",
        description: "Your track has been uploaded successfully and is being processed.",
      });
      setSelectedFile(null);
      setTitle("");
      setGenre("");
      onUpload?.();
    },
    onError: () => {
      toast({
        title: "Upload failed",
        description: "Failed to upload track. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file => file.type.startsWith('audio/'));
    
    if (audioFile) {
      setSelectedFile(audioFile);
      if (!title) {
        setTitle(audioFile.name.replace(/\.[^/.]+$/, ""));
      }
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file (MP3, WAV, FLAC).",
        variant: "destructive",
      });
    }
  }, [title, toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a file and enter a track title.",
        variant: "destructive",
      });
      return;
    }

    // For demo purposes, we'll simulate file upload and create track metadata
    // In a real app, you'd upload the file to storage and get a URL
    const trackData = {
      title: title.trim(),
      duration: Math.floor(Math.random() * 300) + 120, // Random duration 2-7 minutes
      fileUrl: `https://example.com/uploads/${selectedFile.name}`,
      genre: genre.trim() || "Unknown",
      status: "processing" as const,
    };

    uploadTrackMutation.mutate(trackData);
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "upload-zone p-8 rounded-lg text-center cursor-pointer transition-colors",
          dragOver && "border-primary bg-primary/5"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
        data-testid="upload-zone"
      >
        <input
          id="file-input"
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleFileSelect}
          data-testid="input-file"
        />
        
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <CloudUpload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-foreground font-medium">Drag and drop your music files here</p>
            <p className="text-muted-foreground text-sm">or click to browse (MP3, WAV, FLAC supported)</p>
          </div>
          <Button variant="outline" data-testid="button-browse-files">
            Browse Files
          </Button>
        </div>
      </div>

      {selectedFile && (
        <div className="bg-card p-4 rounded-lg border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium" data-testid="text-selected-file">
                {selectedFile.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedFile(null)}
              data-testid="button-remove-file"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="track-title">Track Title *</Label>
              <Input
                id="track-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter track title"
                data-testid="input-track-title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="track-genre">Genre</Label>
              <Input
                id="track-genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="e.g. Electronic, Pop, Rock"
                data-testid="input-track-genre"
              />
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploadTrackMutation.isPending || !title.trim()}
            className="w-full"
            data-testid="button-upload-track"
          >
            {uploadTrackMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Track"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

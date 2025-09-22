import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertTrackSchema, insertPlaylistSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Track routes
  app.get("/api/tracks", requireAuth, async (req: any, res) => {
    try {
      const tracks = await storage.getTracksByUser(req.user.id);
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tracks" });
    }
  });

  app.post("/api/tracks", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertTrackSchema.parse(req.body);
      const track = await storage.createTrack({
        ...validatedData,
        userId: req.user.id,
      });
      res.status(201).json(track);
    } catch (error) {
      res.status(400).json({ message: "Invalid track data" });
    }
  });

  app.patch("/api/tracks/:id", requireAuth, async (req: any, res) => {
    try {
      const track = await storage.getTrack(req.params.id);
      if (!track || track.userId !== req.user.id) {
        return res.status(404).json({ message: "Track not found" });
      }
      
      const updatedTrack = await storage.updateTrack(req.params.id, req.body);
      res.json(updatedTrack);
    } catch (error) {
      res.status(500).json({ message: "Failed to update track" });
    }
  });

  app.delete("/api/tracks/:id", requireAuth, async (req: any, res) => {
    try {
      const track = await storage.getTrack(req.params.id);
      if (!track || track.userId !== req.user.id) {
        return res.status(404).json({ message: "Track not found" });
      }
      
      await storage.deleteTrack(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete track" });
    }
  });

  app.post("/api/tracks/:id/play", async (req, res) => {
    try {
      await storage.incrementTrackPlays(req.params.id);
      res.status(200).json({ message: "Play recorded" });
    } catch (error) {
      res.status(500).json({ message: "Failed to record play" });
    }
  });

  // Playlist routes
  app.get("/api/playlists", requireAuth, async (req: any, res) => {
    try {
      const playlists = await storage.getPlaylistsByUser(req.user.id);
      res.json(playlists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch playlists" });
    }
  });

  app.post("/api/playlists", requireAuth, async (req: any, res) => {
    try {
      const validatedData = insertPlaylistSchema.parse(req.body);
      const playlist = await storage.createPlaylist({
        ...validatedData,
        userId: req.user.id,
      });
      res.status(201).json(playlist);
    } catch (error) {
      res.status(400).json({ message: "Invalid playlist data" });
    }
  });

  app.patch("/api/playlists/:id", requireAuth, async (req: any, res) => {
    try {
      const playlist = await storage.getPlaylist(req.params.id);
      if (!playlist || playlist.userId !== req.user.id) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      
      const updatedPlaylist = await storage.updatePlaylist(req.params.id, req.body);
      res.json(updatedPlaylist);
    } catch (error) {
      res.status(500).json({ message: "Failed to update playlist" });
    }
  });

  app.delete("/api/playlists/:id", requireAuth, async (req: any, res) => {
    try {
      const playlist = await storage.getPlaylist(req.params.id);
      if (!playlist || playlist.userId !== req.user.id) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      
      await storage.deletePlaylist(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete playlist" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", requireAuth, async (req: any, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const analytics = await storage.getUserAnalytics(req.user.id, days);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", requireAuth, async (req: any, res) => {
    try {
      const tracks = await storage.getTracksByUser(req.user.id);
      const playlists = await storage.getPlaylistsByUser(req.user.id);
      const analytics = await storage.getUserAnalytics(req.user.id, 30);
      
      const totalPlays = tracks.reduce((sum, track) => sum + (track.plays || 0), 0);
      const totalRevenue = analytics.reduce((sum, entry) => sum + (entry.revenue || 0), 0);
      
      const stats = {
        totalPlays,
        totalRevenue,
        totalTracks: tracks.length,
        totalPlaylists: playlists.length,
        followers: 0, // This would come from a separate followers system
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

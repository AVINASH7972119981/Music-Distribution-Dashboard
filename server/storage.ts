import { type User, type InsertUser, type Track, type InsertTrack, type Playlist, type InsertPlaylist, type Analytics } from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Track operations
  getTrack(id: string): Promise<Track | undefined>;
  getTracksByUser(userId: string): Promise<Track[]>;
  createTrack(track: InsertTrack & { userId: string }): Promise<Track>;
  updateTrack(id: string, updates: Partial<Track>): Promise<Track | undefined>;
  deleteTrack(id: string): Promise<boolean>;
  
  // Playlist operations
  getPlaylist(id: string): Promise<Playlist | undefined>;
  getPlaylistsByUser(userId: string): Promise<Playlist[]>;
  createPlaylist(playlist: InsertPlaylist & { userId: string }): Promise<Playlist>;
  updatePlaylist(id: string, updates: Partial<Playlist>): Promise<Playlist | undefined>;
  deletePlaylist(id: string): Promise<boolean>;
  
  // Analytics operations
  getUserAnalytics(userId: string, days?: number): Promise<Analytics[]>;
  incrementTrackPlays(trackId: string): Promise<void>;
  addRevenue(userId: string, trackId: string, amount: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private tracks: Map<string, Track>;
  private playlists: Map<string, Playlist>;
  private analytics: Map<string, Analytics>;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.tracks = new Map();
    this.playlists = new Map();
    this.analytics = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      artistName: insertUser.artistName || null,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Track operations
  async getTrack(id: string): Promise<Track | undefined> {
    return this.tracks.get(id);
  }

  async getTracksByUser(userId: string): Promise<Track[]> {
    return Array.from(this.tracks.values()).filter(track => track.userId === userId);
  }

  async createTrack(trackData: InsertTrack & { userId: string }): Promise<Track> {
    const id = randomUUID();
    const track: Track = {
      ...trackData,
      genre: trackData.genre || null,
      artworkUrl: trackData.artworkUrl || null,
      status: trackData.status || "processing",
      id,
      plays: 0,
      createdAt: new Date(),
    };
    this.tracks.set(id, track);
    return track;
  }

  async updateTrack(id: string, updates: Partial<Track>): Promise<Track | undefined> {
    const track = this.tracks.get(id);
    if (!track) return undefined;
    
    const updatedTrack = { ...track, ...updates };
    this.tracks.set(id, updatedTrack);
    return updatedTrack;
  }

  async deleteTrack(id: string): Promise<boolean> {
    return this.tracks.delete(id);
  }

  // Playlist operations
  async getPlaylist(id: string): Promise<Playlist | undefined> {
    return this.playlists.get(id);
  }

  async getPlaylistsByUser(userId: string): Promise<Playlist[]> {
    return Array.from(this.playlists.values()).filter(playlist => playlist.userId === userId);
  }

  async createPlaylist(playlistData: InsertPlaylist & { userId: string }): Promise<Playlist> {
    const id = randomUUID();
    const playlist: Playlist = {
      ...playlistData,
      description: playlistData.description || null,
      coverUrl: playlistData.coverUrl || null,
      id,
      trackCount: 0,
      totalDuration: 0,
      plays: 0,
      isPublic: playlistData.isPublic ?? true,
      createdAt: new Date(),
    };
    this.playlists.set(id, playlist);
    return playlist;
  }

  async updatePlaylist(id: string, updates: Partial<Playlist>): Promise<Playlist | undefined> {
    const playlist = this.playlists.get(id);
    if (!playlist) return undefined;
    
    const updatedPlaylist = { ...playlist, ...updates };
    this.playlists.set(id, updatedPlaylist);
    return updatedPlaylist;
  }

  async deletePlaylist(id: string): Promise<boolean> {
    return this.playlists.delete(id);
  }

  // Analytics operations
  async getUserAnalytics(userId: string, days: number = 30): Promise<Analytics[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return Array.from(this.analytics.values()).filter(
      analytics => analytics.userId === userId && analytics.date && analytics.date >= cutoffDate
    );
  }

  async incrementTrackPlays(trackId: string): Promise<void> {
    const track = this.tracks.get(trackId);
    if (track) {
      track.plays = (track.plays || 0) + 1;
      this.tracks.set(trackId, track);
      
      // Add analytics entry
      const analyticsId = randomUUID();
      const analytics: Analytics = {
        id: analyticsId,
        userId: track.userId,
        trackId,
        playlistId: null,
        date: new Date(),
        plays: 1,
        revenue: 0,
      };
      this.analytics.set(analyticsId, analytics);
    }
  }

  async addRevenue(userId: string, trackId: string, amount: number): Promise<void> {
    const analyticsId = randomUUID();
    const analytics: Analytics = {
      id: analyticsId,
      userId,
      trackId,
      playlistId: null,
      date: new Date(),
      plays: 0,
      revenue: amount,
    };
    this.analytics.set(analyticsId, analytics);
  }
}

export const storage = new MemStorage();

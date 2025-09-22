import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  artistName: text("artist_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tracks = pgTable("tracks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  duration: integer("duration").notNull(), // in seconds
  fileUrl: text("file_url").notNull(),
  artworkUrl: text("artwork_url"),
  genre: text("genre"),
  status: text("status").notNull().default("processing"), // processing, published, draft
  plays: integer("plays").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playlists = pgTable("playlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  coverUrl: text("cover_url"),
  trackCount: integer("track_count").default(0),
  totalDuration: integer("total_duration").default(0), // in seconds
  plays: integer("plays").default(0),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const playlistTracks = pgTable("playlist_tracks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playlistId: varchar("playlist_id").references(() => playlists.id).notNull(),
  trackId: varchar("track_id").references(() => tracks.id).notNull(),
  position: integer("position").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
});

export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  trackId: varchar("track_id").references(() => tracks.id),
  playlistId: varchar("playlist_id").references(() => playlists.id),
  date: timestamp("date").defaultNow(),
  plays: integer("plays").default(0),
  revenue: real("revenue").default(0),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  artistName: true,
});

export const insertTrackSchema = createInsertSchema(tracks).omit({
  id: true,
  userId: true,
  plays: true,
  createdAt: true,
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  userId: true,
  trackCount: true,
  totalDuration: true,
  plays: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTrack = z.infer<typeof insertTrackSchema>;
export type Track = typeof tracks.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type Playlist = typeof playlists.$inferSelect;
export type PlaylistTrack = typeof playlistTracks.$inferSelect;
export type Analytics = typeof analytics.$inferSelect;

import { useState } from "react";
import Sidebar from "../components/dashboard/sidebar";
import StatsOverview from "../components/dashboard/stats-overview";
import AnalyticsChart from "../components/dashboard/analytics-chart";
import TopTracks from "../components/dashboard/top-tracks";
import TrackManagement from "../components/dashboard/track-management";
import PlaylistManagement from "../components/dashboard/playlist-management";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Bell, Menu, Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Dashboard() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card border-b border-border p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
                data-testid="button-sidebar-toggle"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
                <p className="text-muted-foreground" data-testid="text-welcome">
                  Welcome back, {user?.artistName || user?.username}! Here's your music performance overview.
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" data-testid="button-notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </Button>
              <Button data-testid="button-upload-track">
                <Plus className="h-4 w-4 mr-2" />
                Upload Track
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-6 space-y-6">
          <StatsOverview />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AnalyticsChart />
            </div>
            <TopTracks />
          </div>

          <TrackManagement />
          <PlaylistManagement />
        </div>
      </main>
    </div>
  );
}

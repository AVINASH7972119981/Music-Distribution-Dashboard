import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, DollarSign, Users, Music } from "lucide-react";

interface DashboardStats {
  totalPlays: number;
  totalRevenue: number;
  totalTracks: number;
  totalPlaylists: number;
  followers: number;
}

export default function StatsOverview() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const statCards = [
    {
      title: "Total Plays",
      value: stats?.totalPlays?.toLocaleString() || "0",
      change: "+12.5% from last month",
      icon: Play,
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
      testId: "stat-total-plays"
    },
    {
      title: "Monthly Revenue",
      value: `$${stats?.totalRevenue?.toFixed(2) || "0.00"}`,
      change: "+8.3% from last month",
      icon: DollarSign,
      bgColor: "bg-secondary/10",
      iconColor: "text-secondary",
      testId: "stat-revenue"
    },
    {
      title: "Followers",
      value: stats?.followers?.toLocaleString() || "0",
      change: "+156 new this week",
      icon: Users,
      bgColor: "bg-accent/10",
      iconColor: "text-accent",
      testId: "stat-followers"
    },
    {
      title: "Active Tracks",
      value: stats?.totalTracks?.toString() || "0",
      change: `${stats?.totalPlaylists || 0} playlists`,
      icon: Music,
      bgColor: "bg-muted",
      iconColor: "text-muted-foreground",
      testId: "stat-tracks"
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">{stat.title}</p>
                <p 
                  className="text-2xl font-bold text-foreground" 
                  data-testid={`text-${stat.testId}-value`}
                >
                  {stat.value}
                </p>
                <p 
                  className="text-secondary text-sm mt-1" 
                  data-testid={`text-${stat.testId}-change`}
                >
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <stat.icon className={`${stat.iconColor} text-lg h-6 w-6`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

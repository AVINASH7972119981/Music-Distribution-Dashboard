import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Analytics } from "@shared/schema";

export default function AnalyticsChart() {
  const [period, setPeriod] = useState("7d");

  const { data: analytics, isLoading } = useQuery<Analytics[]>({
    queryKey: ["/api/analytics", { days: period === "7d" ? 7 : period === "30d" ? 30 : 90 }],
  });

  // Process analytics data for chart
  const chartData = analytics?.reduce((acc, entry) => {
    if (!entry.date) return acc;
    
    const date = entry.date.toISOString().split('T')[0];
    const existing = acc.find(item => item.date === date);
    
    if (existing) {
      existing.plays += entry.plays || 0;
    } else {
      acc.push({
        date,
        plays: entry.plays || 0,
        displayDate: new Date(entry.date).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    
    return acc;
  }, [] as Array<{ date: string; plays: number; displayDate: string }>) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plays Over Time</CardTitle>
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle data-testid="text-chart-title">Plays Over Time</CardTitle>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32" data-testid="select-chart-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]" data-testid="chart-plays-over-time">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="displayDate" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Line
                type="monotone"
                dataKey="plays"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

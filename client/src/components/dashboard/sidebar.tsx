import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Music, 
  BarChart3, 
  Upload, 
  Disc, 
  List, 
  TrendingUp, 
  DollarSign,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navigationItems = [
    { icon: BarChart3, label: "Dashboard", active: true },
    { icon: Upload, label: "Upload", active: false },
    { icon: Disc, label: "My Tracks", active: false },
    { icon: List, label: "Playlists", active: false },
    { icon: TrendingUp, label: "Analytics", active: false },
    { icon: DollarSign, label: "Revenue", active: false },
  ];

  return (
    <aside 
      className={cn(
        "sidebar w-64 bg-black text-white flex-shrink-0 flex flex-col",
        "fixed lg:relative inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        "lg:flex"
      )}
    >
      {/* Brand */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
            <Music className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">MusicFlow</h1>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {navigationItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            className={cn(
              "w-full justify-start text-left h-auto py-3 px-3 text-white",
              "hover:bg-gray-700 hover:text-indigo-400", // hover  color change
              item.active && "bg-indigo-600 text-white" // active (selected) blue
            )}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </Button>
        ))}
      </nav>
      
      {/* User Info */}
      <div className="p-4">
        <div className="flex items-center space-x-3 p-3 bg-gray-900 rounded-lg">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gray-700 text-white">
              {user?.artistName?.charAt(0) || user?.username?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.artistName || user?.username}
            </p>
            <p className="text-xs text-gray-400">Independent Artist</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="h-8 w-8 text-gray-400 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
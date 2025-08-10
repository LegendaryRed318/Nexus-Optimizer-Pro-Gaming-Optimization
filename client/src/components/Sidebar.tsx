import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface SidebarItem {
  href: string;
  icon: string;
  label: string;
  color: string;
  isActive?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { href: "/", icon: "fas fa-tachometer-alt", label: "Dashboard", color: "text-neon-green", isActive: true },
  { href: "/system", icon: "fas fa-cogs", label: "System Optimizer", color: "text-neon-purple" },
  { href: "/network", icon: "fas fa-wifi", label: "Network Booster", color: "text-neon-blue" },
  { href: "/gpu", icon: "fas fa-display", label: "GPU Tuner", color: "text-neon-green" },
  { href: "/fortnite", icon: "fas fa-gamepad", label: "Fortnite Optimizer", color: "text-blue-400" },
  { href: "/restore", icon: "fas fa-history", label: "Restore Points", color: "text-neon-yellow" },
  { href: "/bios", icon: "fas fa-microchip", label: "BIOS Tweaks", color: "text-neon-purple" },
  { href: "/audio", icon: "fas fa-volume-up", label: "Audio Tweaks", color: "text-neon-blue" },
  { href: "/ram", icon: "fas fa-memory", label: "RAM Tweaks", color: "text-neon-green" },
  { href: "/misc", icon: "fas fa-tools", label: "Misc Mods", color: "text-neon-yellow" },
  { href: "/settings", icon: "fas fa-cog", label: "Settings", color: "text-neon-yellow" },
];

interface SidebarProps {
  onOpenSettings: () => void;
}

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <div className="w-60 bg-dark-card border-r border-dark-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-dark-border">
        <h1 className="font-orbitron text-xl font-bold text-neon-green neon-glow">
          <i className="fas fa-microchip mr-2"></i>
          Nexus Optimizer Pro
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = location === item.href || (item.href === "/" && location === "/");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center p-3 rounded-lg transition-all duration-300 group",
                isActive
                  ? "bg-neon-green/10 text-neon-green border border-neon-green/20"
                  : "hover:bg-dark-border"
              )}
            >
              <i
                className={cn(
                  item.icon,
                  "text-lg mr-3 transition-all duration-300 group-hover:scale-110",
                  isActive ? "text-neon-green neon-glow" : item.color
                )}
              />
              <span className={cn("font-medium", isActive ? "text-neon-green" : "text-white")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-dark-border">
        <div className="bg-dark-bg rounded-lg p-3 mb-3">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-neon-green to-neon-blue rounded-lg flex items-center justify-center mr-3">
              <i className="fas fa-user text-white text-sm" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{user?.username}</p>
              <p className="text-gray-400 text-xs">Pro Account</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

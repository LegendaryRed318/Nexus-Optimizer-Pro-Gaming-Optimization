import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface SidebarItem {
  href: string;
  icon: string;
  label: string;
  color: string;
  isActive?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { href: "/", icon: "fas fa-tachometer-alt", label: "Dashboard", color: "text-neon-green", isActive: true },
  { href: "/ai", icon: "fas fa-robot", label: "AI Assistant", color: "text-neon-blue" },
  { href: "/system", icon: "fas fa-cogs", label: "System Optimizer", color: "text-neon-purple" },
  { href: "/network", icon: "fas fa-wifi", label: "Network Booster", color: "text-neon-blue" },
  { href: "/gpu", icon: "fas fa-display", label: "GPU Tuner", color: "text-neon-green" },
  { href: "/gaming", icon: "fas fa-gamepad", label: "Gaming Profiles", color: "text-neon-purple" },
  { href: "/overlay", icon: "fas fa-chart-line", label: "FPS Overlay", color: "text-neon-blue" },
  { href: "/premium", icon: "fas fa-crown", label: "Premium", color: "text-yellow-400" },
];

interface SidebarProps {
  onOpenSettings: () => void;
}

export function Sidebar({ onOpenSettings }: SidebarProps) {
  const [location] = useLocation();

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
            <a
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
                  "text-lg mr-3 transition-all duration-300 group-hover:scale-110",
                  isActive ? "text-neon-green neon-glow" : item.color
                )}
              />
              <span className={cn("font-medium", isActive ? "text-neon-green" : "text-white")}>
                {item.label}
              </span>
            </a>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-dark-border">
        <button
          onClick={onOpenSettings}
          className="flex items-center p-3 rounded-lg hover:bg-dark-border transition-colors w-full group"
        >
          <i className="fas fa-cog text-lg mr-3 transition-all duration-300 group-hover:scale-110" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}

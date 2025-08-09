import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import type { ThemeType } from "@/types/system";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const themeColors = [
  { type: 'green' as ThemeType, color: 'bg-neon-green', name: 'Green' },
  { type: 'blue' as ThemeType, color: 'bg-neon-blue', name: 'Blue' },
  { type: 'purple' as ThemeType, color: 'bg-neon-purple', name: 'Purple' },
  { type: 'yellow' as ThemeType, color: 'bg-yellow-400', name: 'Yellow' },
];

export function Settings({ isOpen, onClose }: SettingsProps) {
  const { theme, setTheme, isDarkMode, setIsDarkMode } = useTheme();

  const handleSave = () => {
    // Settings are automatically saved via localStorage in the useTheme hook
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-dark-card border-dark-border">
        <DialogHeader>
          <DialogTitle className="flex items-center text-white">
            <i className="fas fa-cog text-neon-green text-2xl mr-3 neon-glow" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Theme Color</label>
            <div className="flex space-x-3">
              {themeColors.map((colorOption) => (
                <button
                  key={colorOption.type}
                  onClick={() => setTheme(colorOption.type)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all duration-300 hover:scale-110",
                    colorOption.color,
                    theme === colorOption.type && "ring-2 ring-white ring-offset-2 ring-offset-dark-card"
                  )}
                  title={colorOption.name}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Dark Mode</span>
            <Switch
              checked={isDarkMode}
              onCheckedChange={setIsDarkMode}
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Animations</span>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Sound Effects</span>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Auto-Optimization</span>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-300">Performance Alerts</span>
            <Switch defaultChecked />
          </div>

          <Button
            onClick={handleSave}
            className="w-full py-3 bg-neon-green text-dark-bg rounded-lg font-medium hover:bg-neon-green/90 transition-colors"
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

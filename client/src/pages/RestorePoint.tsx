import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface MockSettings {
  performanceMode: boolean;
  audioLatencyMs: number;
  ramCompression: boolean;
}

interface RestorePointItem {
  id: string;
  createdAt: string;
  settingsSnapshot: MockSettings;
}

const RESTORE_POINTS_KEY = "restorePoints";
const CURRENT_SETTINGS_KEY = "currentSettings";

export default function RestorePoint() {
  const [restorePoints, setRestorePoints] = useState<RestorePointItem[]>([]);
  const [currentSettings, setCurrentSettings] = useState<MockSettings>({
    performanceMode: true,
    audioLatencyMs: 10,
    ramCompression: false,
  });
  const { toast } = useToast();

  // Load persisted state
  useEffect(() => {
    try {
      const savedPoints = localStorage.getItem(RESTORE_POINTS_KEY);
      if (savedPoints) {
        setRestorePoints(JSON.parse(savedPoints));
      }
      const savedCurrent = localStorage.getItem(CURRENT_SETTINGS_KEY);
      if (savedCurrent) {
        setCurrentSettings(JSON.parse(savedCurrent));
      }
    } catch {}
  }, []);

  // Persist whenever changes occur
  useEffect(() => {
    localStorage.setItem(RESTORE_POINTS_KEY, JSON.stringify(restorePoints));
  }, [restorePoints]);

  useEffect(() => {
    localStorage.setItem(CURRENT_SETTINGS_KEY, JSON.stringify(currentSettings));
  }, [currentSettings]);

  const createRestorePoint = () => {
    const newPoint: RestorePointItem = {
      id: `${Date.now()}`,
      createdAt: new Date().toLocaleString(),
      settingsSnapshot: currentSettings,
    };
    setRestorePoints((prev) => [newPoint, ...prev]);
    toast({ title: "Restore Point Created", description: `Saved at ${newPoint.createdAt}` });
  };

  const restoreFromPoint = (id: string) => {
    const point = restorePoints.find((p) => p.id === id);
    if (!point) return;
    setCurrentSettings(point.settingsSnapshot);
    toast({
      title: "Settings Restored",
      description: `Restored settings from ${point.createdAt}`,
    });
  };

  const deletePoint = (id: string) => {
    setRestorePoints((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="flex h-screen bg-dark-bg text-white font-inter overflow-hidden">
      <Sidebar onOpenSettings={() => {}} />
      <div className="flex-1 flex flex-col">
        <header className="bg-dark-card border-b border-dark-border p-4">
          <h2 className="text-2xl font-bold">Restore Points</h2>
          <p className="text-gray-400">Save and restore your optimizer configuration. Data persists locally.</p>
        </header>

        <main className="flex-1 p-6 overflow-y-auto space-y-6">
          <section className="bg-dark-card border border-dark-border rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Current Settings (Mock)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-dark-bg rounded-lg p-4 border border-dark-border">
                <label className="flex items-center justify-between">
                  <span>Performance Mode</span>
                  <input
                    type="checkbox"
                    checked={currentSettings.performanceMode}
                    onChange={(e) => setCurrentSettings((s) => ({ ...s, performanceMode: e.target.checked }))}
                  />
                </label>
              </div>
              <div className="bg-dark-bg rounded-lg p-4 border border-dark-border">
                <label className="block mb-2">Audio Latency (ms)</label>
                <input
                  type="number"
                  min={0}
                  className="w-full bg-transparent border border-dark-border rounded px-3 py-2"
                  value={currentSettings.audioLatencyMs}
                  onChange={(e) => setCurrentSettings((s) => ({ ...s, audioLatencyMs: Number(e.target.value) }))}
                />
              </div>
              <div className="bg-dark-bg rounded-lg p-4 border border-dark-border">
                <label className="flex items-center justify-between">
                  <span>RAM Compression</span>
                  <input
                    type="checkbox"
                    checked={currentSettings.ramCompression}
                    onChange={(e) => setCurrentSettings((s) => ({ ...s, ramCompression: e.target.checked }))}
                  />
                </label>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button onClick={createRestorePoint} className="bg-neon-green text-dark-bg hover:bg-neon-green/90">
                <i className="fas fa-save mr-2" />
                Create Restore Point
              </Button>
            </div>
          </section>

          <section className="bg-dark-card border border-dark-border rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4">Saved Restore Points</h3>
            {restorePoints.length === 0 ? (
              <p className="text-gray-400">No restore points yet. Create one above.</p>
            ) : (
              <ul className="space-y-3">
                {restorePoints.map((point) => (
                  <li key={point.id} className="bg-dark-bg border border-dark-border rounded-lg p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{point.createdAt}</p>
                      <p className="text-xs text-gray-400">performanceMode: {String(point.settingsSnapshot.performanceMode)}, audioLatencyMs: {point.settingsSnapshot.audioLatencyMs}, ramCompression: {String(point.settingsSnapshot.ramCompression)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => restoreFromPoint(point.id)} className="bg-neon-blue text-white hover:bg-neon-blue/90">
                        <i className="fas fa-undo mr-2" /> Restore
                      </Button>
                      <Button onClick={() => deletePoint(point.id)} className="bg-red-600 hover:bg-red-700">
                        <i className="fas fa-trash mr-2" /> Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
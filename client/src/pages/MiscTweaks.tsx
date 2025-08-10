import { Sidebar } from "@/components/Sidebar";

export default function MiscTweaks() {
  return (
    <div className="flex h-screen bg-dark-bg text-white font-inter overflow-hidden">
      <Sidebar onOpenSettings={() => {}} />
      <div className="flex-1 flex flex-col">
        <header className="bg-dark-card border-b border-dark-border p-4">
          <h2 className="text-2xl font-bold">Miscellaneous Tweaks</h2>
          <p className="text-gray-400">Extra gaming and performance settings not covered elsewhere.</p>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <p className="text-gray-300">Coming soon: Game Mode, background service trimming, scheduler tweaks, and more.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
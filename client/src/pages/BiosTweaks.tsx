import { Sidebar } from "@/components/Sidebar";

export default function BiosTweaks() {
  return (
    <div className="flex h-screen bg-dark-bg text-white font-inter overflow-hidden">
      <Sidebar onOpenSettings={() => {}} />
      <div className="flex-1 flex flex-col">
        <header className="bg-dark-card border-b border-dark-border p-4">
          <h2 className="text-2xl font-bold">BIOS Tweaks</h2>
          <p className="text-gray-400">Enable/disable advanced BIOS-level optimizations (mock UI).</p>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6">
            <p className="text-gray-300">Coming soon: XMP/EXPO toggles, PBO limits, Resizable BAR, and more.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
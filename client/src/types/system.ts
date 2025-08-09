export interface SystemStats {
  cpuUsage: number;
  cpuTemp: number;
  gpuUsage: number;
  gpuTemp: number;
  ramUsed: string;
  ramAvailable: string;
  networkPing: number;
  networkUpload: number;
  networkDownload: number;
  fps: number;
}

export interface GameProfile {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
  settings: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp?: Date;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
}

export type ThemeType = 'green' | 'blue' | 'purple' | 'yellow';

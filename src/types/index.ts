export interface Project {
  id: string;
  name: string;
  width: number;
  height: number;
  createdAt: number;
  updatedAt: number;
  activePageId: string;
}

export type PlayStoreDevicePreset = 'phone' | 'tablet_7' | 'tablet_10';

export interface DeviceVariantData {
  canvasJSON?: string;
  thumbnailDataUrl?: string;
  isCustomized?: boolean; // if true, tablet is decoupled and edited independently; if false, synced with phone
}

export interface ProjectPage {
  id: string;
  projectId: string;
  name: string;
  canvasJSON: string;
  order: number;
  screenshotAssetId?: string;
  thumbnailDataUrl?: string;
  headingText?: string;
  subtitleText?: string;
  badgeText?: string;
  themeId?: string;
  customPalette?: ThemePalette;
  variation?: ThemeVariation;
  frameType?: DeviceFrameType;
  variants?: {
    phone?: DeviceVariantData;
    tablet_7?: DeviceVariantData;
    tablet_10?: DeviceVariantData;
  };
}

export interface Asset {
  id: string;
  projectId: string;
  name: string;
  mimeType: string;
  blob: Blob;
  width: number;
  height: number;
  size: number;
  createdAt: number;
}

export interface AppSetting {
  key: string;
  value: unknown;
}

export type PresetCategory = 'phone' | 'tablet' | 'social' | 'custom';

export interface Preset {
  id: string;
  name: string;
  category: PresetCategory;
  width: number;
  height: number;
  description: string;
  ratio: string;
}

export type ThemeVariation = 
  | 'heading_screenshot'        // Classic Top Headline
  | 'screenshot_heading'        // Bottom Headline
  | 'centered_screenshot'       // Centered Hero Focus
  | 'hero_screenshot'          // Max Screen Immersion
  | 'tilted_isometric_left'     // 3D Isometric Tilt Left (-11°)
  | 'tilted_isometric_right'    // 3D Isometric Tilt Right (+11°)
  | 'bottom_peek_bleed'         // Giant Peeking Bleed Screen
  | 'minimal_editorial_left'    // Editorial Magazine Left Aligned
  | 'floating_perspective'      // Cinematic Floating Tilt (-5°)
  | 'compact_double_glow';      // Compact Dual Aura

export type DeviceFrameType = 'phone' | 'tablet' | 'frameless';

export interface ThemePalette {
  id: string;
  name: string;
  background: string;
  backgroundGradient?: {
    type: 'linear' | 'radial';
    stops: { offset: number; color: string }[];
    angle?: number;
  };
  primary: string;
  secondary: string;
  text: string;
  subtitle: string;
  accent: string;
  frameColor?: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  category: string;
  description: string;
  previewColors: string[];
  defaultPalette: ThemePalette;
  defaultVariation: ThemeVariation;
  defaultFrame: DeviceFrameType;
  accentBadgeText?: string;
  tags?: string[];
  ratingBadge?: string;
}

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'webp';
  resolution: 1 | 2 | 3;
  quality: number; // 0.1 - 1.0
  fileNamePrefix?: string;
}

export interface CanvasLayerItem {
  id: string;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
  dataTag?: string;
}

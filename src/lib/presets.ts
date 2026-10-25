import { Preset } from '@/types';

export const PRESETS: Preset[] = [
  // Official Google Play Store Image Sizes
  {
    id: 'playstore-phone-1080-1920',
    name: '📱 Phone Screenshots',
    category: 'phone',
    width: 1080,
    height: 1920,
    description: 'Official Google Play Store Phone format (16:9 vertical portrait)',
    ratio: '9:16',
  },
  {
    id: 'playstore-tablet-7inch-1200-1920',
    name: '📲 7-inch Tablet (Play Store)',
    category: 'tablet',
    width: 1200,
    height: 1920,
    description: 'Official Google Play Store 7-inch Tablet format (1200 × 1920 px, 16:10)',
    ratio: '10:16',
  },
  {
    id: 'playstore-tablet-10inch-1536-2048',
    name: '📲 10-inch Tablet (Play Store)',
    category: 'tablet',
    width: 1536,
    height: 2048,
    description: 'Official Google Play Store 10-inch Tablet format (1536 × 2048 px, 3:4 portrait)',
    ratio: '3:4',
  },

  // Additional Modern Phone Presets
  {
    id: 'android-1080-2400',
    name: 'Modern Android Tall',
    category: 'phone',
    width: 1080,
    height: 2400,
    description: '20:9 tall aspect ratio for contemporary Android flagship devices',
    ratio: '9:20',
  },
  {
    id: 'mobile-1179-2556',
    name: 'Universal 6.1" Display',
    category: 'phone',
    width: 1179,
    height: 2556,
    description: '19.5:9 high-density display preset for modern 6.1" phones',
    ratio: '19.5:9',
  },
  {
    id: 'mobile-1290-2796',
    name: 'Universal 6.7" Display',
    category: 'phone',
    width: 1290,
    height: 2796,
    description: '19.5:9 high-density display preset for large 6.7" phones',
    ratio: '19.5:9',
  },

  // Additional Tablet Presets
  {
    id: 'tablet-2560-1600',
    name: '10" Tablet Landscape',
    category: 'tablet',
    width: 2560,
    height: 1600,
    description: '16:10 landscape tablet resolution for showcase presentations',
    ratio: '16:10',
  },
  {
    id: 'tablet-2048-2732',
    name: 'Large 12.9" Tablet',
    category: 'tablet',
    width: 2048,
    height: 2732,
    description: 'High-resolution tablet portrait format for showcase displays',
    ratio: '3:4',
  },

  // Social Presets
  {
    id: 'social-1080-1080',
    name: 'Social Square',
    category: 'social',
    width: 1080,
    height: 1080,
    description: 'Square 1:1 format for promotional banners and social posts',
    ratio: '1:1',
  },
  {
    id: 'social-1080-1350',
    name: 'Social Portrait Feed',
    category: 'social',
    width: 1080,
    height: 1350,
    description: '4:5 vertical feed format for high engagement mobile feeds',
    ratio: '4:5',
  },
  {
    id: 'social-1080-1920',
    name: 'Social Story & Reel',
    category: 'social',
    width: 1080,
    height: 1920,
    description: '9:16 vertical full-screen format for Stories and Reels',
    ratio: '9:16',
  },
];

export const PLAYSTORE_SIZES = [
  { id: 'phone', name: '📱 Phone', width: 1080, height: 1920, label: '1080 × 1920 px' },
  { id: 'tablet_7', name: '📲 7-inch Tablet', width: 1200, height: 1920, label: '1200 × 1920 px' },
  { id: 'tablet_10', name: '📲 10-inch Tablet', width: 1536, height: 2048, label: '1536 × 2048 px' },
];

export const DEFAULT_PRESET = PRESETS[0]; // 1080 x 1920

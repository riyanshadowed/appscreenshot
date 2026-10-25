'use client';

import React, { useState, useMemo } from 'react';
import { useStudioStore } from '@/store/useStudioStore';
import { THEME_DEFINITIONS, THEME_VARIATIONS, DEVICE_FRAMES, THEME_CATEGORIES } from '@/lib/themes/definitions';
import { ThemeVariation, DeviceFrameType, CanvasLayerItem, ThemePalette } from '@/types';
import {
  Palette,
  Layout,
  Smartphone,
  Layers,
  Sparkles,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Check,
  Sliders,
  Maximize2,
  AlignCenter,
  PanelTop,
  PanelBottom,
  Search,
  Filter,
  CheckCircle2,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  RotateCw,
  AlignLeft,
  FolderPlus,
  Type,
} from 'lucide-react';
import {
  RICH_WORD_COLORS,
  extractWords,
  applyWordColorToFabricText,
  resetFabricTextWordStyles,
  getWordColorsFromFabricText,
} from '@/lib/canvas/textStyleHelper';

export const RICH_PALETTES = [
  {
    id: 'iphone_desert_titanium_pal',
    name: 'iPhone 16 Desert Titanium',
    category: 'iPhone & Apple Pro ',
    primary: '#d4a373',
    secondary: '#453221',
    accent: '#f6bd60',
    background: '#1a1410',
    text: '#ffffff',
    subtitle: '#faedcd',
    frameColor: '#261d16',
    accentBadgeText: ' DESERT TITANIUM',
    gradient: {
      type: 'linear' as const,
      angle: 155,
      stops: [
        { offset: 0, color: '#2d221a' },
        { offset: 0.5, color: '#1a1410' },
        { offset: 1, color: '#0d0a08' },
      ],
    },
  },
  {
    id: 'iphone_natural_titanium_pal',
    name: 'iPhone 16 Natural Titanium',
    category: 'iPhone & Apple Pro ',
    primary: '#9ca3af',
    secondary: '#374151',
    accent: '#e2e8f0',
    background: '#16171a',
    text: '#ffffff',
    subtitle: '#e5e7eb',
    frameColor: '#202227',
    accentBadgeText: ' NATURAL TITANIUM',
    gradient: {
      type: 'linear' as const,
      angle: 180,
      stops: [
        { offset: 0, color: '#27292f' },
        { offset: 0.55, color: '#16171a' },
        { offset: 1, color: '#0c0d0f' },
      ],
    },
  },
  {
    id: 'iphone_liquid_violet_pal',
    name: 'iOS 18 Liquid Violet',
    category: 'iPhone & Apple Pro ',
    primary: '#8b5cf6',
    secondary: '#4c1d95',
    accent: '#c084fc',
    background: '#130e26',
    text: '#ffffff',
    subtitle: '#e9d5ff',
    frameColor: '#18122c',
    accentBadgeText: ' LIQUID GLASS VIOLET',
    gradient: {
      type: 'linear' as const,
      angle: 140,
      stops: [
        { offset: 0, color: '#2b1b4d' },
        { offset: 0.5, color: '#130e26' },
        { offset: 1, color: '#070510' },
      ],
    },
  },
  {
    id: 'iphone_pastel_blossom_pal',
    name: 'iOS Pastel Blossom Peach',
    category: 'iPhone & Apple Pro ',
    primary: '#e11d48',
    secondary: '#fecdd3',
    accent: '#f43f5e',
    background: '#ffe4e6',
    text: '#881337',
    subtitle: '#9f1239',
    frameColor: '#4c0519',
    accentBadgeText: '🌸 AESTHETIC BLOSSOM',
    gradient: {
      type: 'linear' as const,
      angle: 145,
      stops: [
        { offset: 0, color: '#fff7ed' },
        { offset: 0.5, color: '#ffe4e6' },
        { offset: 1, color: '#fed7aa' },
      ],
    },
  },
  {
    id: 'cyberpunk_neon',
    name: 'Electric Cyberpunk',
    category: 'Neon & Cyber',
    primary: '#00f5ff',
    secondary: '#1e003a',
    accent: '#ff007f',
    background: '#0a0319',
    text: '#ffffff',
    subtitle: '#e0e7ff',
    frameColor: '#12052c',
    accentBadgeText: '⚡ NEXT-GEN VIBES',
    gradient: {
      type: 'linear' as const,
      angle: 155,
      stops: [
        { offset: 0, color: '#380954' },
        { offset: 0.6, color: '#0d0420' },
        { offset: 1, color: '#030108' },
      ],
    },
  },
  {
    id: 'royal_gold_onyx',
    name: '24K Royal Gold & Onyx',
    category: 'Luxury & Gold',
    primary: '#f59e0b',
    secondary: '#451a03',
    accent: '#fbbf24',
    background: '#08080a',
    text: '#ffffff',
    subtitle: '#fde68a',
    frameColor: '#181512',
    accentBadgeText: '👑 VIP PREMIUM',
    gradient: {
      type: 'linear' as const,
      angle: 180,
      stops: [
        { offset: 0, color: '#241e17' },
        { offset: 0.6, color: '#090807' },
        { offset: 1, color: '#020202' },
      ],
    },
  },
  {
    id: 'imperial_emerald',
    name: 'Imperial Emerald & Mint',
    category: 'Luxury & Gold',
    primary: '#10b981',
    secondary: '#064e3b',
    accent: '#34d399',
    background: '#03140e',
    text: '#ffffff',
    subtitle: '#a7f3d0',
    frameColor: '#07241a',
    accentBadgeText: '💎 LUXURY GRADE',
    gradient: {
      type: 'linear' as const,
      angle: 175,
      stops: [
        { offset: 0, color: '#0c3526' },
        { offset: 0.6, color: '#03140e' },
        { offset: 1, color: '#010805' },
      ],
    },
  },
  {
    id: 'sunset_flamingo',
    name: 'Sunset Flamingo & Mango',
    category: 'Vibrant Gradients',
    primary: '#ff4b72',
    secondary: '#881337',
    accent: '#fbbf24',
    background: '#240816',
    text: '#ffffff',
    subtitle: '#fef08a',
    frameColor: '#2b091a',
    accentBadgeText: '🔥 HOT & TRENDING',
    gradient: {
      type: 'linear' as const,
      angle: 145,
      stops: [
        { offset: 0, color: '#541032' },
        { offset: 0.55, color: '#240816' },
        { offset: 1, color: '#0e0108' },
      ],
    },
  },
  {
    id: 'cosmic_violet_nebula',
    name: 'Cosmic Violet Nebula',
    category: 'Aesthetic & Dreamy',
    primary: '#a855f7',
    secondary: '#4c1d95',
    accent: '#c084fc',
    background: '#0d061f',
    text: '#ffffff',
    subtitle: '#e9d5ff',
    frameColor: '#170933',
    accentBadgeText: '✨ EDITORS CHOICE',
    gradient: {
      type: 'linear' as const,
      angle: 160,
      stops: [
        { offset: 0, color: '#2e1261' },
        { offset: 0.6, color: '#0d061f' },
        { offset: 1, color: '#04010a' },
      ],
    },
  },
  {
    id: 'miami_vice_cyan',
    name: 'Miami Vice Ocean & Pink',
    category: 'Vibrant Gradients',
    primary: '#06b6d4',
    secondary: '#0e7490',
    accent: '#f43f5e',
    background: '#031724',
    text: '#ffffff',
    subtitle: '#cffafe',
    frameColor: '#062338',
    accentBadgeText: '🌴 SUMMER POP',
    gradient: {
      type: 'linear' as const,
      angle: 155,
      stops: [
        { offset: 0, color: '#0b3859' },
        { offset: 0.65, color: '#031724' },
        { offset: 1, color: '#01080d' },
      ],
    },
  },
  {
    id: 'scuderia_rosso',
    name: 'Scuderia Rosso & Carbon',
    category: 'Gaming & Nitro',
    primary: '#ef4444',
    secondary: '#7f1d1d',
    accent: '#f59e0b',
    background: '#120304',
    text: '#ffffff',
    subtitle: '#fed7aa',
    frameColor: '#1a0406',
    accentBadgeText: '🏎️ ULTRA HIGH SPEED',
    gradient: {
      type: 'linear' as const,
      angle: 180,
      stops: [
        { offset: 0, color: '#31080b' },
        { offset: 0.6, color: '#120304' },
        { offset: 1, color: '#050102' },
      ],
    },
  },
  {
    id: 'champagne_rose',
    name: 'Champagne Crema & Rose',
    category: 'Luxury & Gold',
    primary: '#fb7185',
    secondary: '#500724',
    accent: '#fde047',
    background: '#1c0c14',
    text: '#ffffff',
    subtitle: '#fce7f3',
    frameColor: '#260f1b',
    accentBadgeText: '🌸 COUTURE EDITION',
    gradient: {
      type: 'linear' as const,
      angle: 165,
      stops: [
        { offset: 0, color: '#3d1629' },
        { offset: 0.65, color: '#1c0c14' },
        { offset: 1, color: '#0a0307' },
      ],
    },
  },
  {
    id: 'nordic_glacier',
    name: 'Nordic Glacier & Frost',
    category: 'Ocean & Arctic',
    primary: '#38bdf8',
    secondary: '#0369a1',
    accent: '#67e8f9',
    background: '#071626',
    text: '#ffffff',
    subtitle: '#e0f2fe',
    frameColor: '#0c223a',
    accentBadgeText: '❄️ ARCTIC CLEAR',
    gradient: {
      type: 'linear' as const,
      angle: 180,
      stops: [
        { offset: 0, color: '#123459' },
        { offset: 0.65, color: '#071626' },
        { offset: 1, color: '#02070d' },
      ],
    },
  },
  {
    id: 'acid_matrix',
    name: 'Acid Lime & Matrix Green',
    category: 'Neon & Cyber',
    primary: '#84cc16',
    secondary: '#14532d',
    accent: '#22c55e',
    background: '#061305',
    text: '#ffffff',
    subtitle: '#dcfce7',
    frameColor: '#091c07',
    accentBadgeText: '👾 CYBER NITRO',
    gradient: {
      type: 'linear' as const,
      angle: 170,
      stops: [
        { offset: 0, color: '#133310' },
        { offset: 0.65, color: '#061305' },
        { offset: 1, color: '#010401' },
      ],
    },
  },
  {
    id: 'ultraviolet_orange',
    name: 'Ultraviolet & Orange',
    category: 'Vibrant Gradients',
    primary: '#fb923c',
    secondary: '#4c1d95',
    accent: '#c084fc',
    background: '#140624',
    text: '#ffffff',
    subtitle: '#fed7aa',
    frameColor: '#1c0933',
    accentBadgeText: '⚡ HIGH ENERGY',
    gradient: {
      type: 'linear' as const,
      angle: 150,
      stops: [
        { offset: 0, color: '#310d59' },
        { offset: 0.6, color: '#140624' },
        { offset: 1, color: '#06010c' },
      ],
    },
  },
  {
    id: 'aurora_borealis',
    name: 'Aurora Borealis Mystic Teal',
    category: 'Aesthetic & Dreamy',
    primary: '#14b8a6',
    secondary: '#0f766e',
    accent: '#a855f7',
    background: '#021a1f',
    text: '#ffffff',
    subtitle: '#ccfbf1',
    frameColor: '#052930',
    accentBadgeText: '🌌 AURORA MAGIC',
    gradient: {
      type: 'linear' as const,
      angle: 155,
      stops: [
        { offset: 0, color: '#073842' },
        { offset: 0.6, color: '#021a1f' },
        { offset: 1, color: '#010a0d' },
      ],
    },
  },
  {
    id: 'midnight_bordeaux',
    name: 'Midnight Bordeaux & Velvet Ruby',
    category: 'Luxury & Gold',
    primary: '#e11d48',
    secondary: '#881337',
    accent: '#fde047',
    background: '#160408',
    text: '#ffffff',
    subtitle: '#fecdd3',
    frameColor: '#24060d',
    accentBadgeText: '🍷 VINTAGE RESERVE',
    gradient: {
      type: 'linear' as const,
      angle: 165,
      stops: [
        { offset: 0, color: '#380913' },
        { offset: 0.65, color: '#160408' },
        { offset: 1, color: '#080103' },
      ],
    },
  },
  {
    id: 'solar_flare_indigo',
    name: 'Solar Flare & Royal Indigo',
    category: 'Vibrant Gradients',
    primary: '#f97316',
    secondary: '#1e1b4b',
    accent: '#fbbf24',
    background: '#0a0624',
    text: '#ffffff',
    subtitle: '#fed7aa',
    frameColor: '#130c3d',
    accentBadgeText: '☀️ SOLAR POWERED',
    gradient: {
      type: 'linear' as const,
      angle: 140,
      stops: [
        { offset: 0, color: '#270e59' },
        { offset: 0.55, color: '#0a0624' },
        { offset: 1, color: '#03010d' },
      ],
    },
  },
  {
    id: 'cobalt_azure',
    name: 'Electric Cobalt & Sky Azure',
    category: 'Ocean & Arctic',
    primary: '#3b82f6',
    secondary: '#1e3a8a',
    accent: '#38bdf8',
    background: '#050f29',
    text: '#ffffff',
    subtitle: '#bfdbfe',
    frameColor: '#0a1a45',
    accentBadgeText: '⚡ HYPER AZURE',
    gradient: {
      type: 'linear' as const,
      angle: 175,
      stops: [
        { offset: 0, color: '#0d2566' },
        { offset: 0.65, color: '#050f29' },
        { offset: 1, color: '#01040f' },
      ],
    },
  },
  {
    id: 'deep_abyss_cyan',
    name: 'Deep Abyss & Bioluminescent Cyan',
    category: 'Ocean & Arctic',
    primary: '#00f5d4',
    secondary: '#05383b',
    accent: '#7b2cbf',
    background: '#031317',
    text: '#ffffff',
    subtitle: '#d8f3dc',
    frameColor: '#07242c',
    accentBadgeText: '🌊 DEEP DIVE',
    gradient: {
      type: 'linear' as const,
      angle: 160,
      stops: [
        { offset: 0, color: '#08323d' },
        { offset: 0.6, color: '#031317' },
        { offset: 1, color: '#010708' },
      ],
    },
  },
  {
    id: 'desert_terracotta',
    name: 'Desert Dune & Warm Terracotta',
    category: 'Vibrant Gradients',
    primary: '#ea580c',
    secondary: '#7c2d12',
    accent: '#fed7aa',
    background: '#1c0e08',
    text: '#ffffff',
    subtitle: '#ffedd5',
    frameColor: '#29140c',
    accentBadgeText: '🏜️ SAHARA GOLD',
    gradient: {
      type: 'linear' as const,
      angle: 170,
      stops: [
        { offset: 0, color: '#3d1d11' },
        { offset: 0.65, color: '#1c0e08' },
        { offset: 1, color: '#0a0402' },
      ],
    },
  },
  {
    id: 'pastel_candy_pop',
    name: 'Pastel Candy Pop & Bubblegum',
    category: 'Aesthetic & Dreamy',
    primary: '#ec4899',
    secondary: '#831843',
    accent: '#c084fc',
    background: '#1c051f',
    text: '#ffffff',
    subtitle: '#fbcfe8',
    frameColor: '#2b0a30',
    accentBadgeText: '🍭 SWEET VIBES',
    gradient: {
      type: 'linear' as const,
      angle: 145,
      stops: [
        { offset: 0, color: '#450d4d' },
        { offset: 0.6, color: '#1c051f' },
        { offset: 1, color: '#0c020d' },
      ],
    },
  },
  {
    id: 'studio_titanium',
    name: 'Studio Titanium & Stealth Slate',
    category: 'Minimal & Clean',
    primary: '#cbd5e1',
    secondary: '#334155',
    accent: '#60a5fa',
    background: '#0b0f17',
    text: '#ffffff',
    subtitle: '#94a3b8',
    frameColor: '#161e2e',
    accentBadgeText: '🛡️ ENTERPRISE GRADE',
    gradient: {
      type: 'linear' as const,
      angle: 180,
      stops: [
        { offset: 0, color: '#1c2538' },
        { offset: 0.65, color: '#0b0f17' },
        { offset: 1, color: '#030508' },
      ],
    },
  },
  {
    id: 'pure_monochrome',
    name: 'Pure Monochrome Studio',
    category: 'Minimal & Clean',
    primary: '#ffffff',
    secondary: '#27272a',
    accent: '#a1a1aa',
    background: '#09090b',
    text: '#ffffff',
    subtitle: '#d4d4d8',
    frameColor: '#18181b',
    accentBadgeText: '★ 4.9 RATED (120K)',
    gradient: {
      type: 'linear' as const,
      angle: 180,
      stops: [
        { offset: 0, color: '#1f1f23' },
        { offset: 0.7, color: '#09090b' },
        { offset: 1, color: '#000000' },
      ],
    },
  },
];

interface LeftSidebarProps {
  layers: CanvasLayerItem[];
  onSelectLayer: (id: string) => void;
  onToggleLayerVisibility: (id: string) => void;
  onToggleLayerLock: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onApplyTheme: (themeId: string) => void;
  onApplyVariation: (variation: ThemeVariation) => void;
  onApplyFrame: (frame: DeviceFrameType) => void;
  onUpdatePalette?: (palette: Partial<ThemePalette>) => void;
  onApplyPaletteToAll?: (palette: ThemePalette) => void;
  onUpdateTextContent?: (type: 'heading' | 'subtitle' | 'badge', text: string) => void;
  onUpdateWordColor?: (type: 'heading' | 'subtitle' | 'badge', wordIndex: number, color: string) => void;
  onResetWordStyles?: (type: 'heading' | 'subtitle' | 'badge', uniformColor?: string) => void;
  onUploadScreenshot?: () => void;
  onBatchUpload?: () => void;
  onClearScreenshot?: () => void;
}

export function LeftSidebar({
  layers,
  onSelectLayer,
  onToggleLayerVisibility,
  onToggleLayerLock,
  onDeleteLayer,
  onApplyTheme,
  onApplyVariation,
  onApplyFrame,
  onUpdatePalette,
  onApplyPaletteToAll,
  onUpdateTextContent,
  onUpdateWordColor,
  onResetWordStyles,
  onUploadScreenshot,
  onBatchUpload,
  onClearScreenshot,
}: LeftSidebarProps) {
  const {
    activeThemeId,
    activeVariation,
    activeFrame,
    customPalette,
    setCustomPalette,
    headingText,
    subtitleText,
    badgeText,
    setHeadingText,
    setSubtitleText,
    setBadgeText,
    activeTab,
    setActiveTab,
    pages,
    activePageId,
  } = useStudioStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [colorCategory, setColorCategory] = useState<'all' | 'luxury' | 'cyber' | 'vibrant' | 'ocean' | 'minimal'>('all');
  const [selectedHeadingWordIdx, setSelectedHeadingWordIdx] = useState<number | null>(null);

  const handleTransformHeading = (mode: 'upper' | 'title' | 'lower' | 'clear') => {
    let res = '';
    if (mode === 'upper') res = headingText.toUpperCase();
    else if (mode === 'lower') res = headingText.toLowerCase();
    else if (mode === 'title') {
      res = headingText
        .split(' ')
        .map((w) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
        .join(' ');
    } else if (mode === 'clear') {
      res = '';
    }
    setHeadingText(res);
    if (onUpdateTextContent) onUpdateTextContent('heading', res);
  };

  const handleTransformSubtitle = (mode: 'sentence' | 'upper' | 'clear') => {
    let res = '';
    if (mode === 'sentence') {
      res = subtitleText ? subtitleText.charAt(0).toUpperCase() + subtitleText.slice(1) : '';
    } else if (mode === 'upper') {
      res = subtitleText.toUpperCase();
    } else if (mode === 'clear') {
      res = '';
    }
    setSubtitleText(res);
    if (onUpdateTextContent) onUpdateTextContent('subtitle', res);
  };

  const handleColorChange = (updates: Partial<ThemePalette>) => {
    setCustomPalette(updates);
    if (onUpdatePalette) {
      onUpdatePalette(updates);
    }
  };

  // Filtered themes
  const filteredThemes = useMemo(() => {
    return THEME_DEFINITIONS.filter((theme) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const catObj = THEME_CATEGORIES.find((c) => c.id === selectedCategory);
        if (catObj && theme.category !== catObj.name) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = theme.name.toLowerCase().includes(q);
        const matchesDesc = theme.description.toLowerCase().includes(q);
        const matchesCategory = theme.category.toLowerCase().includes(q);
        const matchesTags = theme.tags?.some((t) => t.toLowerCase().includes(q));
        return matchesName || matchesDesc || matchesCategory || matchesTags;
      }

      return true;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <aside className="w-84 h-full bg-[#0d101a] border-r border-slate-800/80 flex flex-col z-20 select-none">
      {/* Top Navigation Tabs */}
      <div className="flex items-center justify-around p-1.5 border-b border-slate-800/80 bg-slate-900/60 gap-1 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('themes')}
          className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl text-[10px] font-semibold transition shrink-0 ${
            activeTab === 'themes'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          title="Themes Library"
        >
          <Sparkles className="w-3.5 h-3.5 mb-0.5" />
          Themes
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl text-[10px] font-semibold transition shrink-0 ${
            activeTab === 'content'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          title="Write Headlines & Content"
        >
          <Type className="w-3.5 h-3.5 mb-0.5 text-indigo-400" />
          Content
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('colors')}
          className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl text-[10px] font-semibold transition shrink-0 ${
            activeTab === 'colors'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          title="Rich Colors & Gradient Palettes"
        >
          <Palette className="w-3.5 h-3.5 mb-0.5" />
          Colors
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl text-[10px] font-semibold transition shrink-0 ${
            activeTab === 'upload'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          title="App Screenshots & Uploads"
        >
          <Upload className="w-3.5 h-3.5 mb-0.5" />
          Screens
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('variations')}
          className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl text-[10px] font-semibold transition shrink-0 ${
            activeTab === 'variations'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          title="Layout Variations"
        >
          <Layout className="w-3.5 h-3.5 mb-0.5" />
          Layout
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('frames')}
          className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl text-[10px] font-semibold transition shrink-0 ${
            activeTab === 'frames'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          title="Device Mockup Frame"
        >
          <Smartphone className="w-3.5 h-3.5 mb-0.5" />
          Mockup
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('layers')}
          className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl text-[10px] font-semibold transition shrink-0 ${
            activeTab === 'layers'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
          title="Canvas Layers"
        >
          <Layers className="w-3.5 h-3.5 mb-0.5" />
          Layers
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* THEMES TAB */}
        {activeTab === 'themes' && (
          <div className="space-y-3.5">
            {/* Header & Count */}
            <div className="flex items-center justify-between pb-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Theme Library
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 font-mono">
                {filteredThemes.length} / {THEME_DEFINITIONS.length}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dark, gold, crypto, gradient..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {THEME_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition border ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Themes Grid */}
            <div className="space-y-3 pt-1">
              {filteredThemes.length === 0 ? (
                <div className="text-center py-8 px-2 text-slate-500 text-xs">
                  No themes match &ldquo;{searchQuery}&rdquo;. Try another search or filter.
                </div>
              ) : (
                filteredThemes.map((theme) => {
                  const isActive = activeThemeId === theme.id;
                  const bgStyle = theme.defaultPalette.backgroundGradient
                    ? `linear-gradient(${theme.defaultPalette.backgroundGradient.angle || 135}deg, ${theme.defaultPalette.backgroundGradient.stops
                        .map((s) => `${s.color} ${s.offset * 100}%`)
                        .join(', ')})`
                    : theme.defaultPalette.background;

                  return (
                    <div
                      key={theme.id}
                      onClick={() => onApplyTheme(theme.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all duration-200 group relative overflow-hidden ${
                        isActive
                          ? 'bg-[#151a2d] border-indigo-500 shadow-xl shadow-indigo-500/10 ring-2 ring-indigo-500/40'
                          : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Live Visual Mini-Card Preview */}
                      <div
                        className="w-full h-24 rounded-xl mb-2.5 overflow-hidden relative flex flex-col items-center justify-between p-2 shadow-inner border border-white/10"
                        style={{ background: bgStyle }}
                      >
                        {/* Mini Badge */}
                        <div
                          className="px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wider uppercase border text-white shadow-xs"
                          style={{
                            backgroundColor: theme.defaultPalette.secondary,
                            borderColor: theme.defaultPalette.accent,
                          }}
                        >
                          {theme.ratingBadge || 'TOP RATED'}
                        </div>

                        {/* Mini Headline */}
                        <div
                          className="text-[10px] font-extrabold tracking-tight text-center truncate max-w-[90%]"
                          style={{ color: theme.defaultPalette.text }}
                        >
                          {theme.name}
                        </div>

                        {/* Mini Phone Silhouette */}
                        <div
                          className="w-16 h-10 rounded-t-lg border-2 border-b-0 border-slate-700 bg-slate-900/90 shadow-md flex items-center justify-center"
                          style={{
                            borderColor: theme.defaultPalette.primary,
                          }}
                        >
                          <div
                            className="w-8 h-1 rounded-full"
                            style={{ backgroundColor: theme.defaultPalette.accent }}
                          />
                        </div>

                        {isActive && (
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-indigo-600 text-white text-[9px] font-bold flex items-center gap-1 shadow-md">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            Active
                          </div>
                        )}
                      </div>

                      {/* Theme Name & Category */}
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-xs text-white group-hover:text-indigo-300 transition">
                          {theme.name}
                        </div>
                        <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60">
                          {theme.category}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                        {theme.description}
                      </p>

                      {/* Color Palette Dots */}
                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/60">
                        <div className="flex items-center gap-1.5">
                          {theme.previewColors.map((color, idx) => (
                            <div
                              key={idx}
                              className="w-4 h-4 rounded-full border border-white/20 shadow-xs"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-indigo-400 font-mono font-medium">
                          {theme.accentBadgeText}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* VARIATIONS TAB */}
        {activeTab === 'variations' && (
          <div className="space-y-3">
            <div className="pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Layout Variations
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Switch layout structure instantly while preserving screenshot and text
              </p>
            </div>

            <div className="space-y-2.5">
              {THEME_VARIATIONS.map((v) => {
                const isActive = activeVariation === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => onApplyVariation(v.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                      isActive
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-2 rounded-xl border ${
                            isActive
                              ? 'bg-indigo-600 text-white border-indigo-400'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {v.id === 'heading_screenshot' && <PanelTop className="w-4 h-4" />}
                          {v.id === 'screenshot_heading' && <PanelBottom className="w-4 h-4" />}
                          {v.id === 'centered_screenshot' && <AlignCenter className="w-4 h-4" />}
                          {v.id === 'hero_screenshot' && <Maximize2 className="w-4 h-4" />}
                          {v.id === 'tilted_isometric_left' && <RotateCw className="w-4 h-4 -scale-x-100" />}
                          {v.id === 'tilted_isometric_right' && <RotateCw className="w-4 h-4" />}
                          {v.id === 'bottom_peek_bleed' && <Smartphone className="w-4 h-4" />}
                          {v.id === 'minimal_editorial_left' && <AlignLeft className="w-4 h-4" />}
                          {v.id === 'floating_perspective' && <Layers className="w-4 h-4" />}
                          {v.id === 'compact_double_glow' && <Sparkles className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{v.name}</span>
                            {(v as any).badge && (
                              <span className="text-[9px] font-semibold tracking-wide px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                {(v as any).badge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{v.description}</div>
                        </div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-indigo-400 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DEVICE FRAMES TAB */}
        {activeTab === 'frames' && (
          <div className="space-y-3">
            <div className="pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Device Mockup Frame
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Display screenshot inside a realistic device chassis or floating card
              </p>
            </div>

            <div className="space-y-2.5">
              {DEVICE_FRAMES.map((f) => {
                const isActive = activeFrame === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => onApplyFrame(f.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                      isActive
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{f.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{f.description}</div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-indigo-400 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TEXT & CONTENT TAB */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div className="pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block flex items-center gap-1.5">
                <Type className="w-4 h-4 text-indigo-400" />
                Text & Content Editor
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Edit headlines, feature badge, and customize per-word rich colors
              </p>
            </div>

            {/* Feature Badge / Top Pill */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
                  Feature Badge (Top Pill)
                </label>
                <span className="text-[10px] font-mono text-indigo-400">
                  {badgeText.length} chars
                </span>
              </div>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => {
                  const val = e.target.value;
                  setBadgeText(val);
                  if (onUpdateTextContent) onUpdateTextContent('badge', val);
                }}
                placeholder="e.g. ★ 4.9 (120K REVIEWS)"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs font-semibold text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {[
                  '★ 4.9 (150K REVIEWS)',
                  '#1 PRODUCTIVITY APP',
                  'EDITORS CHOICE 2026',
                  'ZERO TRANSACTION FEES',
                  '100% PRIVATE & SAFE',
                  'OFFLINE SUPPORT',
                ].map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setBadgeText(tag);
                      if (onUpdateTextContent) onUpdateTextContent('badge', tag);
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 hover:border-indigo-500/60 text-[10px] font-medium text-slate-400 hover:text-white transition"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Headline Input with Per-Word Rich Colorizer */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
                  Main Headline
                </label>
                <span className="text-[10px] font-mono text-indigo-400">
                  {headingText.length} chars • Ideal 20-45
                </span>
              </div>
              <textarea
                rows={3}
                value={headingText}
                onChange={(e) => {
                  const val = e.target.value;
                  setHeadingText(val);
                  if (onUpdateTextContent) onUpdateTextContent('heading', val);
                }}
                placeholder="e.g. Manage Your Business Effortlessly"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs font-semibold text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition leading-relaxed"
              />
              <div className="flex items-center gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleTransformHeading('upper')}
                  className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] font-semibold text-slate-400 hover:text-white transition"
                >
                  UPPERCASE
                </button>
                <button
                  type="button"
                  onClick={() => handleTransformHeading('title')}
                  className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] font-semibold text-slate-400 hover:text-white transition"
                >
                  Title Case
                </button>
                <button
                  type="button"
                  onClick={() => handleTransformHeading('clear')}
                  className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-800/60 text-[10px] font-semibold text-slate-500 hover:text-rose-400 transition ml-auto"
                >
                  Clear
                </button>
              </div>

              {/* PER-WORD RICH COLOR PICKER */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Per-Word Rich Color
                  </span>
                  {selectedHeadingWordIdx !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onResetWordStyles) onResetWordStyles('heading', customPalette.text || '#ffffff');
                      }}
                      className="text-[10px] text-rose-400 hover:text-rose-300 underline font-medium"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-slate-400">
                  Click any word to give it a custom glowing, neon, or gold color:
                </p>

                {/* Word pills */}
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800">
                  {extractWords(headingText).map((w, idx) => {
                    const isSelected = selectedHeadingWordIdx === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedHeadingWordIdx(isSelected ? null : idx)}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-400'
                            : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
                        }`}
                      >
                        <span>{w}</span>
                      </button>
                    );
                  })}
                  {extractWords(headingText).length === 0 && (
                    <span className="text-[11px] text-slate-600 italic">Type headline above to color words</span>
                  )}
                </div>

                {/* Rich Color Swatches */}
                {selectedHeadingWordIdx !== null && (
                  <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between text-[11px] text-slate-300">
                      <span className="text-amber-400 font-semibold">
                        Selected: &ldquo;{extractWords(headingText)[selectedHeadingWordIdx]}&rdquo;
                      </span>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-1 pb-1">
                      {[
                        { label: '★ 24K Gold', color: '#fbbf24' },
                        { label: '⚡ Neon Cyan', color: '#00f5ff' },
                        { label: '💖 Neon Pink', color: '#ff007f' },
                        { label: '🌿 Mint Glow', color: '#34d399' },
                      ].map((preset) => (
                        <button
                          key={preset.color}
                          type="button"
                          onClick={() => {
                            if (onUpdateWordColor && selectedHeadingWordIdx !== null) {
                              onUpdateWordColor('heading', selectedHeadingWordIdx, preset.color);
                            }
                          }}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold border border-slate-800 bg-slate-950 hover:bg-slate-900 transition flex items-center gap-1"
                          style={{ color: preset.color }}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: preset.color }} />
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* 16 Rich Colors Grid */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {RICH_WORD_COLORS.map((rc) => (
                        <button
                          key={rc.name}
                          type="button"
                          onClick={() => {
                            if (onUpdateWordColor && selectedHeadingWordIdx !== null) {
                              onUpdateWordColor('heading', selectedHeadingWordIdx, rc.color);
                            }
                          }}
                          className="flex flex-col items-center p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition group text-center"
                          title={`${rc.name} (${rc.color})`}
                        >
                          <span
                            className="w-4 h-4 rounded-md shadow-xs group-hover:scale-110 transition border border-white/20"
                            style={{ backgroundColor: rc.color }}
                          />
                          <span className="text-[9px] font-medium text-slate-400 group-hover:text-white truncate max-w-full mt-1">
                            {rc.name.split(' ')[0]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Subtitle / Description Input (with Clear / Remove Subtitle option) */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1">
                  Subtitle Description
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-indigo-400">
                    {subtitleText.length} chars
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSubtitleText('');
                      if (onUpdateTextContent) onUpdateTextContent('subtitle', '');
                    }}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-[10px] font-semibold text-rose-300 hover:text-white transition"
                    title="Remove subtitle from canvas"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    <span>Remove Subtitle</span>
                  </button>
                </div>
              </div>
              <textarea
                rows={2}
                value={subtitleText}
                onChange={(e) => {
                  const val = e.target.value;
                  setSubtitleText(val);
                  if (onUpdateTextContent) onUpdateTextContent('subtitle', val);
                }}
                placeholder="Supporting description (or click Remove Subtitle to hide)"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition leading-relaxed"
              />
              <div className="flex items-center gap-1.5 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleTransformSubtitle('sentence')}
                  className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] font-semibold text-slate-400 hover:text-white transition"
                >
                  Sentence case
                </button>
                <button
                  type="button"
                  onClick={() => handleTransformSubtitle('upper')}
                  className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-[10px] font-semibold text-slate-400 hover:text-white transition"
                >
                  UPPERCASE
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubtitleText('');
                    if (onUpdateTextContent) onUpdateTextContent('subtitle', '');
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-rose-800/60 text-[10px] font-semibold text-slate-500 hover:text-rose-400 transition ml-auto"
                >
                  Clear Subtitle
                </button>
              </div>
            </div>

            {/* Play Store Visual Conversion Tip */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Rich Color Play Store Secret</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Coloring 1 key action word (e.g. <span className="text-amber-400 font-bold">&ldquo;Instantly&rdquo;</span>, <span className="text-cyan-400 font-bold">&ldquo;Zero Fees&rdquo;</span>, or <span className="text-pink-400 font-bold">&ldquo;AI&rdquo;</span>) increases Play Store screenshot click-through rate by up to <strong className="text-white">35%</strong>!
              </p>
            </div>
          </div>
        )}

        {/* COLORS & RICH PALETTES TAB */}
        {activeTab === 'colors' && (
          <div className="space-y-4">
            <div className="pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-indigo-400" />
                Rich Color Studio
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                20 Curated high-vibrancy luxury gradients & studio color schemes
              </p>
            </div>

            {/* Apply Current Theme to All Screens Button */}
            {onApplyPaletteToAll && (
              <button
                type="button"
                onClick={() => {
                  onApplyPaletteToAll(customPalette);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 hover:text-white text-xs font-bold shadow-md transition"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Apply Current Colors to All {pages.length} Screens</span>
              </button>
            )}

            {/* Category Filter Pills for Rich Palettes */}
            <div className="flex flex-wrap gap-1 pt-1">
              {[
                { id: 'all', label: 'All 20 Palettes' },
                { id: 'luxury', label: 'Luxury & Gold' },
                { id: 'cyber', label: 'Neon & Cyber' },
                { id: 'vibrant', label: 'Vibrant Gradients' },
                { id: 'ocean', label: 'Ocean & Arctic' },
                { id: 'minimal', label: 'Minimal & Clean' },
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColorCategory(c.id as any)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition ${
                    colorCategory === c.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* 1-Tap Curated Rich Palettes */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 pt-1">
                {RICH_PALETTES.filter((pal) => {
                  if (colorCategory === 'all') return true;
                  if (colorCategory === 'luxury') return pal.category === 'Luxury & Gold';
                  if (colorCategory === 'cyber') return pal.category === 'Neon & Cyber';
                  if (colorCategory === 'vibrant') return pal.category === 'Vibrant Gradients';
                  if (colorCategory === 'ocean') return pal.category === 'Ocean & Arctic';
                  if (colorCategory === 'minimal') return pal.category === 'Minimal & Clean' || pal.category === 'Aesthetic & Dreamy';
                  return true;
                }).map((pal) => (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() => {
                      handleColorChange({
                        id: pal.id,
                        name: pal.name,
                        background: pal.background,
                        backgroundGradient: pal.gradient,
                        primary: pal.primary,
                        secondary: pal.secondary,
                        accent: pal.accent,
                        text: pal.text,
                        subtitle: pal.subtitle,
                        frameColor: pal.frameColor,
                      });
                      if (pal.accentBadgeText && onUpdateTextContent) {
                        setBadgeText(pal.accentBadgeText);
                        onUpdateTextContent('badge', pal.accentBadgeText);
                      }
                    }}
                    className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/80 transition text-left group flex flex-col justify-between h-28 shadow-sm"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-white truncate max-w-[95px]">
                        {pal.name}
                      </span>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pal.primary }} />
                    </div>

                    {/* Gradient preview bar */}
                    <div
                      className="w-full h-8 rounded-lg border border-white/10 shadow-inner flex items-center justify-center my-1"
                      style={{
                        background: `linear-gradient(${pal.gradient.angle}deg, ${pal.gradient.stops.map((s) => `${s.color} ${s.offset * 100}%`).join(', ')})`,
                      }}
                    >
                      <span
                        className="text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white/90 shadow-xs"
                        style={{ backgroundColor: `${pal.secondary}cc` }}
                      >
                        {pal.accentBadgeText}
                      </span>
                    </div>

                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                          style={{ backgroundColor: pal.background }}
                          title="Background"
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                          style={{ backgroundColor: pal.primary }}
                          title="Primary Brand"
                        />
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs"
                          style={{ backgroundColor: pal.accent }}
                          title="Accent Glow"
                        />
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 truncate max-w-[60px]">
                        {pal.category}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Granular Color Tokens */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Custom Palette Tokens
              </span>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs font-medium text-slate-300">Background</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customPalette.background}
                      onChange={(e) => handleColorChange({ background: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-400 uppercase">
                      {customPalette.background}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs font-medium text-slate-300">Primary Brand</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customPalette.primary}
                      onChange={(e) => handleColorChange({ primary: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-400 uppercase">
                      {customPalette.primary}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs font-medium text-slate-300">Secondary Pill</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customPalette.secondary}
                      onChange={(e) => handleColorChange({ secondary: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-400 uppercase">
                      {customPalette.secondary}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs font-medium text-slate-300">Accent Glow</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customPalette.accent}
                      onChange={(e) => handleColorChange({ accent: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-400 uppercase">
                      {customPalette.accent}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs font-medium text-slate-300">Heading Text</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customPalette.text}
                      onChange={(e) => handleColorChange({ text: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-400 uppercase">
                      {customPalette.text}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs font-medium text-slate-300">Subtitle Text</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customPalette.subtitle}
                      onChange={(e) => handleColorChange({ subtitle: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-400 uppercase">
                      {customPalette.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-xs font-medium text-slate-300">Chassis Frame</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customPalette.frameColor || '#111827'}
                      onChange={(e) => handleColorChange({ frameColor: e.target.value })}
                      className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-slate-400 uppercase">
                      {customPalette.frameColor || '#111827'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LAYERS TAB */}
        {activeTab === 'layers' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Canvas Layers ({layers.length})
              </span>
            </div>

            <div className="space-y-1.5">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  onClick={() => onSelectLayer(layer.id)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50 transition cursor-pointer text-xs"
                >
                  <span className="font-medium text-slate-200 truncate max-w-[140px]">
                    {layer.name}
                  </span>

                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onToggleLayerVisibility(layer.id)}
                      className="p-1 text-slate-400 hover:text-white rounded transition"
                      title={layer.visible ? 'Hide layer' : 'Show layer'}
                    >
                      {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleLayerLock(layer.id)}
                      className="p-1 text-slate-400 hover:text-white rounded transition"
                      title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                    >
                      {layer.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                    {layer.dataTag !== 'background' && (
                      <button
                        type="button"
                        onClick={() => onDeleteLayer(layer.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 rounded transition"
                        title="Delete layer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UPLOAD & SCREENSHOTS TAB */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div className="pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                App Screenshots
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Upload your app screenshots to place them inside the phone frame
              </p>
            </div>

            {/* Current Screen Status */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Active Screen</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                  {pages.findIndex((p) => p.id === activePageId) + 1} of {pages.length}
                </span>
              </div>

              {pages.find((p) => p.id === activePageId)?.screenshotAssetId ? (
                <div className="space-y-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
                    <div className="w-12 h-16 rounded-lg bg-black/60 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                      {pages.find((p) => p.id === activePageId)?.thumbnailDataUrl ? (
                        <img
                          src={pages.find((p) => p.id === activePageId)?.thumbnailDataUrl}
                          alt="Screenshot"
                          className="object-contain max-h-full max-w-full"
                        />
                      ) : (
                        <Smartphone className="w-6 h-6 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {pages.find((p) => p.id === activePageId)?.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Screenshot Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {onUploadScreenshot && (
                      <button
                        type="button"
                        onClick={onUploadScreenshot}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Replace
                      </button>
                    )}
                    {onClearScreenshot && (
                      <button
                        type="button"
                        onClick={onClearScreenshot}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                        title="Revert to default vector mockup"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Empty Upload Dropzone */
                <div
                  onClick={onUploadScreenshot}
                  className="p-5 rounded-xl border border-dashed border-indigo-500/50 hover:border-indigo-400 bg-indigo-950/20 hover:bg-indigo-950/40 text-center cursor-pointer transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-white">Upload Screenshot</div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Click to browse or drop an image here
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 mt-2">
                    PNG, JPG, WEBP • Full phone fit
                  </div>
                </div>
              )}
            </div>

            {/* Batch Upload Multiple Screenshots */}
            {onBatchUpload && (
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <FolderPlus className="w-4 h-4 text-indigo-400" />
                  <span>Batch Screenshot Upload</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Select multiple screenshots to automatically create all your Play Store slides in 1 click!
                </p>
                <button
                  type="button"
                  onClick={onBatchUpload}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition mt-1"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Upload Multiple Screenshots</span>
                </button>
              </div>
            )}

            {/* Frame Fitting Info Tip */}
            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-600/30 text-[11px] text-emerald-300/90 leading-relaxed flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-emerald-200">Auto Phone Frame Fit</span>
                Screenshots are placed directly inside the high-end phone chassis with realistic OLED screen curvature, Dynamic Island, and bezel.
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

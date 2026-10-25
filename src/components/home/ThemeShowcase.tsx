'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { THEME_DEFINITIONS, THEME_CATEGORIES } from '@/lib/themes/definitions';
import { ThemeDefinition } from '@/types';
import { createProject } from '@/lib/db';
import {
  Sparkles,
  Check,
  Search,
  Plus,
  ArrowRight,
  Copy,
  Layers,
  Palette,
  Eye,
  Smartphone,
  Star,
  CheckCircle2,
  Sliders,
  Zap,
} from 'lucide-react';

export function ThemeShowcase() {
  const router = useRouter();
  const [selectedThemeId, setSelectedThemeId] = useState<string>(THEME_DEFINITIONS[0].id);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const previewStageRef = useRef<HTMLDivElement>(null);

  const selectedTheme: ThemeDefinition = useMemo(() => {
    return (
      THEME_DEFINITIONS.find((t) => t.id === selectedThemeId) || THEME_DEFINITIONS[0]
    );
  }, [selectedThemeId]);

  // Filtered themes list
  const filteredThemes = useMemo(() => {
    return THEME_DEFINITIONS.filter((theme) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const catObj = THEME_CATEGORIES.find((c) => c.id === selectedCategory);
        if (catObj && theme.category !== catObj.name) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = theme.name.toLowerCase().includes(q);
        const matchesDesc = theme.description.toLowerCase().includes(q);
        const matchesCat = theme.category.toLowerCase().includes(q);
        const matchesTags = theme.tags?.some((t) => t.toLowerCase().includes(q));
        return matchesName || matchesDesc || matchesCat || matchesTags;
      }

      return true;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopyColor = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const handleSelectTheme = (themeId: string) => {
    setSelectedThemeId(themeId);
    if (previewStageRef.current) {
      const rect = previewStageRef.current.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        previewStageRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const handleCreateWithTheme = async (theme: ThemeDefinition) => {
    setIsCreating(true);
    try {
      const newProject = await createProject({
        name: `${theme.name} App`,
        width: 1080,
        height: 1920,
        themeId: theme.id,
        palette: theme.defaultPalette,
        variation: theme.defaultVariation || 'heading_screenshot',
        frameType: theme.defaultFrame || 'phone',
        headingText: 'Manage Your Business',
        subtitleText: 'Everything you need in one powerful place',
        badgeText: theme.accentBadgeText || '★ 4.9 (120K REVIEWS)',
      });

      router.push(`/editor/${newProject.id}`);
    } catch (err) {
      console.error('Failed to create project with theme:', err);
      alert('Could not create project with this theme.');
      setIsCreating(false);
    }
  };

  const pal = selectedTheme.defaultPalette;
  const bgGradientStyle = pal.backgroundGradient
    ? `linear-gradient(${pal.backgroundGradient.angle}deg, ${pal.backgroundGradient.stops
        .map((s) => `${s.color} ${s.offset * 100}%`)
        .join(', ')})`
    : pal.background;

  return (
    <section className="mt-14 pt-12 border-t border-slate-800/80 space-y-8" suppressHydrationWarning>
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Theme Gallery</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Explore All Play Store Themes
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Select any theme below to preview its realistic high-resolution phone mockup, gradient atmosphere, and color palette in real-time above.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 font-mono">
            {THEME_DEFINITIONS.length} Ready Themes
          </span>
        </div>
      </div>

      {/* TOP LIVE PREVIEW CARD SHOWCASE ("uper hi preview ho") */}
      <div
        ref={previewStageRef}
        suppressHydrationWarning
        className="relative rounded-3xl border border-slate-800 bg-[#0d111d]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden transition-all duration-300"
      >
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 left-1/4 w-96 h-96 rounded-full blur-[100px] opacity-25 pointer-events-none transition-all duration-500"
          style={{ backgroundColor: pal.accent || pal.primary }}
        />
        <div
          className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full blur-[100px] opacity-20 pointer-events-none transition-all duration-500"
          style={{ backgroundColor: pal.primary }}
        />

        {/* Top Card Header Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800/80 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Live Interactive Preview
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-semibold text-indigo-400">
              {selectedTheme.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300">
              {selectedTheme.category}
            </span>
            {selectedTheme.ratingBadge && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-300 flex items-center gap-1 shadow-xs">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {selectedTheme.ratingBadge}
              </span>
            )}
          </div>
        </div>

        {/* Showcase Grid: Left Phone Mockup | Right Details & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6 relative z-10">
          {/* Left: Realistic Live Phone Showcase Mockup */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div
              className="relative w-64 sm:w-72 aspect-[9/19] rounded-[44px] p-3.5 shadow-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden border border-white/10"
              style={{
                background: bgGradientStyle,
                boxShadow: `0 25px 60px -15px ${pal.primary}44, 0 0 35px ${pal.accent || pal.primary}22`,
              }}
            >
              {/* Dynamic Glow Orbs inside the screen mockup */}
              <div
                className="absolute -top-8 -right-8 w-44 h-44 rounded-full blur-2xl opacity-40 pointer-events-none"
                style={{ backgroundColor: pal.accent || pal.primary }}
              />
              <div
                className="absolute top-1/2 -left-10 w-40 h-40 rounded-full blur-2xl opacity-35 pointer-events-none"
                style={{ backgroundColor: pal.primary }}
              />

              {/* Accent Feature Badge Pill */}
              <div className="relative z-10 mx-auto mt-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase border shadow-md transition-colors"
                  style={{
                    backgroundColor: `${pal.secondary}ee`,
                    borderColor: pal.accent || 'rgba(255,255,255,0.3)',
                    color: pal.text,
                  }}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  {selectedTheme.accentBadgeText || '★ 4.9 (120K REVIEWS)'}
                </span>
              </div>

              {/* Headline & Subtitle */}
              <div className="relative z-10 text-center px-2 mt-2">
                <h4
                  className="text-base sm:text-lg font-black leading-tight tracking-tight drop-shadow-md line-clamp-2"
                  style={{ color: pal.text }}
                >
                  Manage Your Business Effortlessly
                </h4>
                <p
                  className="text-[11px] font-medium leading-snug mt-1 opacity-90 line-clamp-2"
                  style={{ color: pal.subtitle }}
                >
                  Everything you need in one powerful place
                </p>
              </div>

              {/* Phone Chassis with Vector Screen Display */}
              <div
                className="relative z-10 mx-auto w-[94%] h-[68%] rounded-t-[30px] border-t-[6px] border-x-[6px] p-2 flex flex-col justify-between overflow-hidden shadow-2xl mt-auto"
                style={{
                  backgroundColor: '#070a13',
                  borderColor: pal.frameColor || '#1e293b',
                }}
              >
                {/* Dynamic Island / Camera Notch */}
                <div className="w-16 h-3 rounded-full bg-black mx-auto mb-2 flex items-center justify-center border border-white/10 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-900 mr-3" />
                  <div className="w-1 h-1 rounded-full bg-slate-700" />
                </div>

                {/* App Screen Content Mock */}
                <div className="flex-1 flex flex-col gap-1.5 overflow-hidden">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/5 border border-white/5">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: pal.primary }}
                      />
                      <div className="w-12 h-2 rounded bg-white/50" />
                    </div>
                    <div className="w-5 h-2 rounded bg-white/20" />
                  </div>

                  {/* Hero Metric Card */}
                  <div
                    className="p-2.5 rounded-xl border border-white/10 space-y-1"
                    style={{
                      background: `linear-gradient(135deg, ${pal.secondary}99, rgba(15,23,42,0.85))`,
                    }}
                  >
                    <div className="text-[8px] font-bold text-white/70 uppercase">Total Volume</div>
                    <div className="text-xs font-black text-white">$142,500.00</div>
                    {/* Vector Bar Chart */}
                    <div className="flex items-end gap-1 h-8 pt-1">
                      {[30, 55, 40, 85, 70, 100].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-t-xs transition-all duration-300"
                          style={{
                            height: `${h}%`,
                            backgroundColor:
                              i === 5
                                ? pal.primary
                                : `${pal.accent || pal.primary}77`,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Activity Item 1 */}
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5 border border-white/5">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${pal.primary}33` }}
                    >
                      <div className="w-2 h-2 rounded-xs" style={{ backgroundColor: pal.primary }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="w-14 h-2 rounded bg-white/70 mb-0.5" />
                      <div className="w-20 h-1.5 rounded bg-white/30" />
                    </div>
                  </div>

                  {/* Activity Item 2 */}
                  <div className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5 border border-white/5">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${pal.accent || pal.primary}33` }}
                    >
                      <div className="w-2 h-2 rounded-xs" style={{ backgroundColor: pal.accent || pal.primary }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="w-16 h-2 rounded bg-white/70 mb-0.5" />
                      <div className="w-16 h-1.5 rounded bg-white/30" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Theme Details & Quick Action Panel */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-semibold">
                  Theme #{THEME_DEFINITIONS.findIndex((t) => t.id === selectedTheme.id) + 1} of {THEME_DEFINITIONS.length}
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-xs text-slate-400">1080 × 1920 Play Store Ready</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {selectedTheme.name}
              </h3>

              <p className="text-sm text-slate-300 mt-2 leading-relaxed max-w-xl">
                {selectedTheme.description}
              </p>

              {/* Tags */}
              {selectedTheme.tags && selectedTheme.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3.5">
                  {selectedTheme.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Curated Color Palette Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  Palette Tokens & Color Harmony
                </span>
                {copiedHex && (
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 animate-in fade-in duration-150">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Copied {copiedHex}!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { label: 'Background', color: pal.background },
                  { label: 'Primary Brand', color: pal.primary },
                  { label: 'Accent Glow', color: pal.accent || pal.primary },
                  { label: 'Secondary Pill', color: pal.secondary },
                  { label: 'Headline Text', color: pal.text },
                  { label: 'Subtitle Text', color: pal.subtitle },
                  { label: 'Chassis Frame', color: pal.frameColor || '#111827' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleCopyColor(item.color)}
                    className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 transition cursor-pointer group flex items-center gap-2"
                    title={`Click to copy ${item.color}`}
                  >
                    <span
                      className="w-5 h-5 rounded-lg border border-white/20 shadow-xs shrink-0 group-hover:scale-110 transition"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 truncate">{item.label}</div>
                      <div className="text-[11px] font-mono text-slate-200 uppercase truncate">
                        {item.color}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isCreating}
                onClick={() => handleCreateWithTheme(selectedTheme)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {isCreating
                    ? 'Creating Studio Project...'
                    : `Create Project with ${selectedTheme.name}`}
                </span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <button
                type="button"
                onClick={() => {
                  const targetCard = document.getElementById(`theme-card-${selectedTheme.id}`);
                  targetCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition"
              >
                View in Themes Grid
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* THEMES GRID SELECTOR */}
      <div className="space-y-5 pt-4">
        {/* Filter Bar: Category Pills + Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {THEME_CATEGORIES.map((c) => {
              const count =
                c.id === 'all'
                  ? THEME_DEFINITIONS.length
                  : THEME_DEFINITIONS.filter((t) => t.category === c.name).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
                    selectedCategory === c.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{c.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === c.id
                        ? 'bg-indigo-700 text-indigo-100'
                        : 'bg-slate-950 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search themes by name or tag..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
        </div>

        {/* Theme Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredThemes.map((theme) => {
            const isSelected = selectedThemeId === theme.id;
            const p = theme.defaultPalette;
            const gradientBg = p.backgroundGradient
              ? `linear-gradient(${p.backgroundGradient.angle}deg, ${p.backgroundGradient.stops
                  .map((s) => `${s.color} ${s.offset * 100}%`)
                  .join(', ')})`
              : p.background;

            return (
              <div
                id={`theme-card-${theme.id}`}
                key={theme.id}
                suppressHydrationWarning
                onClick={() => handleSelectTheme(theme.id)}
                className={`group relative rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 cursor-pointer text-left border ${
                  isSelected
                    ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/50 shadow-xl shadow-indigo-600/20'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-slate-700 shadow-sm'
                }`}
              >
                {/* Active Indicator Badge */}
                {isSelected && (
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[9px] font-bold shadow-md animate-in fade-in duration-150">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                    <span>Previewing</span>
                  </div>
                )}

                {/* Card Top: Gradient Banner */}
                <div
                  className="w-full h-20 rounded-xl border border-white/10 shadow-inner flex flex-col items-center justify-center relative overflow-hidden transition-transform group-hover:scale-[1.02]"
                  style={{ background: gradientBg }}
                >
                  <div
                    className="w-12 h-12 rounded-full blur-xl opacity-50 absolute"
                    style={{ backgroundColor: p.primary }}
                  />

                  {/* Mini phone frame silhouette */}
                  <div
                    className="w-12 h-14 rounded-t-lg border-t-2 border-x-2 border-slate-700 bg-slate-950/80 p-0.5 mt-auto flex flex-col items-center shadow-lg"
                    style={{ borderColor: p.frameColor || '#334155' }}
                  >
                    <div className="w-3 h-0.5 rounded-full bg-slate-700 mb-1" />
                    <div
                      className="w-8 h-2 rounded bg-indigo-500/60 mb-0.5"
                      style={{ backgroundColor: p.primary }}
                    />
                    <div className="w-6 h-1.5 rounded bg-white/20" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="mt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition truncate">
                      {theme.name}
                    </h4>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      {theme.category}
                    </span>
                  </div>

                  {/* Palette dots & 1-tap select */}
                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span
                        className="w-3 h-3 rounded-full border border-white/20 shadow-xs"
                        style={{ backgroundColor: p.background }}
                        title="Background"
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-white/20 shadow-xs"
                        style={{ backgroundColor: p.primary }}
                        title="Primary"
                      />
                      <span
                        className="w-3 h-3 rounded-full border border-white/20 shadow-xs"
                        style={{ backgroundColor: p.accent || p.primary }}
                        title="Accent"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreateWithTheme(theme);
                      }}
                      className="text-[10px] font-bold text-indigo-400 hover:text-white px-2 py-0.5 rounded-md hover:bg-indigo-600 transition"
                      title={`Create project with ${theme.name}`}
                    >
                      + Use
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredThemes.length === 0 && (
          <div className="text-center py-12 rounded-2xl bg-slate-900/30 border border-slate-800 text-slate-400">
            <p className="text-sm font-semibold">No themes found matching &ldquo;{searchQuery}&rdquo;</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-2 text-xs font-bold text-indigo-400 hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

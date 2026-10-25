'use client';

import React from 'react';
import * as fabric from 'fabric';
import { useStudioStore } from '@/store/useStudioStore';
import {
  Type,
  Image as ImageIcon,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Maximize,
  RotateCw,
  Move,
  Upload,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Trash2,
  Copy,
  Smartphone,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import {
  RICH_WORD_COLORS,
  extractWords,
  applyWordColorToFabricText,
  resetFabricTextWordStyles,
  getWordColorsFromFabricText,
} from '@/lib/canvas/textStyleHelper';

interface PropertiesPanelProps {
  activeObject: fabric.FabricObject | null;
  onUpdateObject: (props: Record<string, any>) => void;
  onReplaceScreenshot: () => void;
  onClearScreenshot?: () => void;
  onDeleteSelectedObject?: () => void;
  onDeleteCurrentScreen?: () => void;
  onDuplicateCurrentScreen?: () => void;
  onCenterObject: (direction: 'horizontal' | 'vertical' | 'both') => void;
  onFitObject: () => void;
  onResetObject: () => void;
}

const FONT_FAMILIES = [
  'Inter',
  'Roboto',
  'Outfit',
  'Poppins',
  'Montserrat',
  'System-UI',
];

export function PropertiesPanel({
  activeObject,
  onUpdateObject,
  onReplaceScreenshot,
  onClearScreenshot,
  onDeleteSelectedObject,
  onDeleteCurrentScreen,
  onDuplicateCurrentScreen,
  onCenterObject,
  onFitObject,
  onResetObject,
}: PropertiesPanelProps) {
  const { headingText, subtitleText, badgeText, setHeadingText, setSubtitleText, setBadgeText, project, pages, activePageId } = useStudioStore();
  const [selectedWordIdx, setSelectedWordIdx] = React.useState<number | null>(null);
  const activePage = pages.find((p) => p.id === activePageId);
  const activePageIndex = pages.findIndex((p) => p.id === activePageId);

  const isText =
    activeObject instanceof fabric.Textbox ||
    activeObject instanceof fabric.FabricText ||
    (activeObject as any)?.dataTag === 'heading' ||
    (activeObject as any)?.dataTag === 'subtitle';

  const isScreenshotOrMockup =
    (activeObject as any)?.dataTag === 'screenshot' ||
    activeObject instanceof fabric.FabricImage ||
    activeObject instanceof fabric.Group;

  return (
    <aside className="w-80 h-full bg-[#0d101a] border-l border-slate-800/80 flex flex-col z-20 select-none overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {isText
              ? 'Text Inspector'
              : isScreenshotOrMockup
              ? 'Screenshot & Frame'
              : 'Canvas Properties'}
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase">
          {(activeObject as any)?.dataTag || 'Canvas'}
        </span>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* TEXT OBJECT INSPECTOR */}
        {isText && activeObject && (
          <div className="space-y-4">
            {/* Text Content */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Content
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = (activeObject as any).text || '';
                      const upper = cur.toUpperCase();
                      onUpdateObject({ text: upper });
                      if ((activeObject as any).dataTag === 'heading') setHeadingText(upper);
                      else if ((activeObject as any).dataTag === 'subtitle') setSubtitleText(upper);
                    }}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 hover:text-white"
                  >
                    AA
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = (activeObject as any).text || '';
                      const title = cur
                        .split(' ')
                        .map((w: string) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
                        .join(' ');
                      onUpdateObject({ text: title });
                      if ((activeObject as any).dataTag === 'heading') setHeadingText(title);
                      else if ((activeObject as any).dataTag === 'subtitle') setSubtitleText(title);
                    }}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 hover:text-white"
                  >
                    Aa
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const cur = (activeObject as any).text || '';
                      const lower = cur.toLowerCase();
                      onUpdateObject({ text: lower });
                      if ((activeObject as any).dataTag === 'heading') setHeadingText(lower);
                      else if ((activeObject as any).dataTag === 'subtitle') setSubtitleText(lower);
                    }}
                    className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 hover:text-white"
                  >
                    aa
                  </button>
                </div>
              </div>
              <textarea
                rows={3}
                value={(activeObject as any).text || ''}
                onChange={(e) => {
                  onUpdateObject({ text: e.target.value });
                  if ((activeObject as any).dataTag === 'heading') {
                    setHeadingText(e.target.value);
                  } else if ((activeObject as any).dataTag === 'subtitle') {
                    setSubtitleText(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:border-indigo-500 outline-none resize-none transition"
              />
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Font Family
              </label>
              <select
                value={(activeObject as any).fontFamily || 'Inter'}
                onChange={(e) => onUpdateObject({ fontFamily: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500"
              >
                {FONT_FAMILIES.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Size & Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Font Size
                </label>
                <input
                  type="number"
                  min={12}
                  max={200}
                  value={Math.round((activeObject as any).fontSize || 40)}
                  onChange={(e) => onUpdateObject({ fontSize: parseInt(e.target.value) || 20 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Weight
                </label>
                <select
                  value={String((activeObject as any).fontWeight || 'bold')}
                  onChange={(e) => onUpdateObject({ fontWeight: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none"
                >
                  <option value="400">Regular (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semi-Bold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="800">Extra-Bold (800)</option>
                </select>
              </div>
            </div>

            {/* Color & Text Alignment */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Alignment & Color
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-700 rounded-xl flex-1">
                  {(['left', 'center', 'right'] as const).map((align) => (
                    <button
                      key={align}
                      type="button"
                      onClick={() => onUpdateObject({ textAlign: align })}
                      className={`flex-1 flex items-center justify-center py-1.5 rounded-lg text-xs transition ${
                        (activeObject as any).textAlign === align
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {align === 'left' && <AlignLeft className="w-3.5 h-3.5" />}
                      {align === 'center' && <AlignCenter className="w-3.5 h-3.5" />}
                      {align === 'right' && <AlignRight className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl">
                  <input
                    type="color"
                    value={(activeObject as any).fill || '#ffffff'}
                    onChange={(e) => onUpdateObject({ fill: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-[11px] font-mono text-slate-400 uppercase">
                    {(activeObject as any).fill || '#fff'}
                  </span>
                </div>
              </div>

              {/* Quick Rich Color Swatches */}
              <div className="flex items-center gap-1.5 pt-2">
                {['#ffffff', '#fbbf24', '#34d399', '#22d3ee', '#f43f5e', '#a855f7', '#fb923c', '#94a3b8'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onUpdateObject({ fill: c })}
                    className="w-6 h-6 rounded-md border border-white/20 hover:scale-110 transition shadow-xs"
                    style={{ backgroundColor: c }}
                    title={`Apply ${c}`}
                  />
                ))}
              </div>
            </div>

            {/* Per-Word Rich Colorizer */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Per-Word Rich Color
                  </span>
                </div>
                <span className="text-[10px] font-mono text-indigo-400">
                  {extractWords((activeObject as any).text || '').length} words
                </span>
              </div>

              <p className="text-[11px] text-slate-400">
                Click any word below, then pick a rich glow/neon/gold color for that word:
              </p>

              {/* Word Chips */}
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 min-h-[42px]">
                {extractWords((activeObject as any).text || '').map((word, idx) => {
                  const isSelected = selectedWordIdx === idx;
                  const wordColors = getWordColorsFromFabricText(
                    activeObject as any,
                    (activeObject as any).fill || '#ffffff'
                  );
                  const wordCol = wordColors[idx] || (activeObject as any).fill || '#ffffff';
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedWordIdx(isSelected ? null : idx)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'ring-2 ring-indigo-400 bg-indigo-950/90 text-white shadow-md'
                          : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800'
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: wordCol }}
                      />
                      <span style={{ color: wordCol }}>{word}</span>
                    </button>
                  );
                })}
              </div>

              {/* Color Selection Palette for Selected Word */}
              {selectedWordIdx !== null ? (
                <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span className="font-semibold text-indigo-300">
                      Coloring: &ldquo;{extractWords((activeObject as any).text || '')[selectedWordIdx]}&rdquo;
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        resetFabricTextWordStyles(
                          activeObject as any,
                          (activeObject as any).fill || '#ffffff'
                        );
                        onUpdateObject({ styles: (activeObject as any).styles });
                      }}
                      className="text-[10px] text-rose-400 hover:text-rose-300 underline font-medium"
                    >
                      Reset All Words
                    </button>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    {RICH_WORD_COLORS.map((rc) => (
                      <button
                        key={rc.name}
                        type="button"
                        onClick={() => {
                          applyWordColorToFabricText(
                            activeObject as any,
                            selectedWordIdx,
                            rc.color
                          );
                          onUpdateObject({ styles: (activeObject as any).styles });
                        }}
                        className="flex flex-col items-center p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition group text-center"
                        title={`${rc.name} (${rc.color})`}
                      >
                        <span
                          className="w-5 h-5 rounded-md shadow-xs group-hover:scale-110 transition border border-white/20"
                          style={{ backgroundColor: rc.color }}
                        />
                        <span className="text-[9px] font-medium text-slate-400 group-hover:text-white truncate max-w-full mt-1">
                          {rc.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 italic text-center py-1">
                  👆 Tap any word above to pick a separate color for it
                </div>
              )}
            </div>

            {/* Delete Text Object */}
            {onDeleteSelectedObject && (
              <button
                type="button"
                onClick={onDeleteSelectedObject}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/60 text-rose-300 hover:text-white text-xs font-semibold transition mt-2"
                title="Delete this text element"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete Text Box</span>
              </button>
            )}
          </div>
        )}

        {/* SCREENSHOT & MOCKUP OBJECT INSPECTOR */}
        {isScreenshotOrMockup && activeObject && (
          <div className="space-y-4">
            {/* Screenshot Management Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={onReplaceScreenshot}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition"
              >
                <Upload className="w-4 h-4" />
                <span>Replace Screenshot</span>
              </button>

              {onClearScreenshot && (
                <button
                  type="button"
                  onClick={onClearScreenshot}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium transition"
                  title="Remove uploaded image and return to native device theme illustration"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Clear Image (Revert to Mockup)</span>
                </button>
              )}
            </div>

            {/* Quick Alignment Tools */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Alignment & Layout
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onCenterObject('horizontal')}
                  className="py-2 px-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-[11px] font-medium flex items-center justify-center gap-1.5 transition"
                >
                  <AlignCenter className="w-3.5 h-3.5 text-indigo-400" />
                  Center H
                </button>
                <button
                  type="button"
                  onClick={() => onCenterObject('vertical')}
                  className="py-2 px-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-[11px] font-medium flex items-center justify-center gap-1.5 transition"
                >
                  <Move className="w-3.5 h-3.5 text-indigo-400" />
                  Center V
                </button>
                <button
                  type="button"
                  onClick={onFitObject}
                  className="py-2 px-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-[11px] font-medium flex items-center justify-center gap-1.5 transition"
                >
                  <Maximize className="w-3.5 h-3.5 text-indigo-400" />
                  Fit
                </button>
              </div>
            </div>

            {/* Position X & Y */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  X Position
                </label>
                <input
                  type="number"
                  value={Math.round(activeObject.left || 0)}
                  onChange={(e) => onUpdateObject({ left: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Y Position
                </label>
                <input
                  type="number"
                  value={Math.round(activeObject.top || 0)}
                  onChange={(e) => onUpdateObject({ top: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono outline-none"
                />
              </div>
            </div>

            {/* Rotation & Opacity */}
            <div className="space-y-3 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold uppercase tracking-wider text-slate-400">Rotation</span>
                  <span className="font-mono text-indigo-400">{Math.round(activeObject.angle || 0)}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={Math.round(activeObject.angle || 0)}
                  onChange={(e) => onUpdateObject({ angle: parseInt(e.target.value) || 0 })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold uppercase tracking-wider text-slate-400">Opacity</span>
                  <span className="font-mono text-indigo-400">
                    {Math.round((activeObject.opacity || 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={activeObject.opacity || 1}
                  onChange={(e) => onUpdateObject({ opacity: parseFloat(e.target.value) || 1 })}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Reset & Delete buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={onResetObject}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Transformations
              </button>

              {onDeleteSelectedObject && (
                <button
                  type="button"
                  onClick={onDeleteSelectedObject}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/60 text-rose-300 hover:text-white text-xs font-semibold transition"
                  title="Remove this object from canvas"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Delete Selected Image</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* DEFAULT CANVAS INSPECTOR (when nothing selected) */}
        {!activeObject && (
          <div className="space-y-4">
            {/* Live Screen Preview Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/90 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Screen Preview
                </span>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Screen {activePageIndex + 1} of {pages.length}
                </span>
              </div>

              {/* Visual Thumbnail Card */}
              <div className="relative w-full h-40 rounded-xl bg-black/60 border border-white/10 overflow-hidden flex items-center justify-center shadow-inner">
                {activePage?.thumbnailDataUrl ? (
                  <img
                    src={activePage.thumbnailDataUrl}
                    alt={activePage.name}
                    className="max-h-full max-w-full object-contain drop-shadow-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-600 gap-1.5">
                    <Smartphone className="w-8 h-8 text-slate-600" />
                    <span className="text-[10px] font-mono text-slate-500">Live Render Ready</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-white/10 flex items-center justify-between text-[10px]">
                  <span className="text-slate-200 truncate max-w-[140px] font-medium">
                    {activePage?.name || 'Screen'}
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" />
                    Live
                  </span>
                </div>
              </div>

              {/* Quick Replace / Upload Screenshot from Canvas Inspector */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={onReplaceScreenshot}
                  className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{activePage?.screenshotAssetId ? 'Replace SS' : 'Upload SS'}</span>
                </button>

                {activePage?.screenshotAssetId && onClearScreenshot ? (
                  <button
                    type="button"
                    onClick={onClearScreenshot}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium transition"
                    title="Remove custom screenshot and revert to clean vector mockup"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Clear Image</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onFitObject}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-medium transition"
                  >
                    <Maximize className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Fit Canvas</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Text Editing */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                Quick Text Editing
              </span>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Feature Badge
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => {
                      setBadgeText(e.target.value);
                      onUpdateObject({ type: 'sync_badge', text: e.target.value });
                    }}
                    placeholder="e.g. ★ 4.9 (120K REVIEWS)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-indigo-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    Heading
                  </label>
                  <input
                    type="text"
                    value={headingText}
                    onChange={(e) => {
                      setHeadingText(e.target.value);
                      onUpdateObject({ type: 'sync_heading', text: e.target.value });
                    }}
                    placeholder="Enter main headline"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-indigo-500 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Current Screen Management */}
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Screen Actions
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {pages.length} Slides Total
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {onDuplicateCurrentScreen && (
                  <button
                    type="button"
                    onClick={onDuplicateCurrentScreen}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium transition"
                  >
                    <Copy className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Duplicate</span>
                  </button>
                )}

                {pages.length > 1 && onDeleteCurrentScreen && (
                  <button
                    type="button"
                    onClick={onDeleteCurrentScreen}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 hover:bg-rose-900/60 text-rose-300 hover:text-white text-xs font-semibold transition"
                    title="Delete this screen"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>

            {/* Canvas Dimensions Specs */}
            <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/70 text-xs space-y-1.5 font-mono text-slate-400">
              <div className="flex justify-between">
                <span>Play Store Size:</span>
                <span className="text-white font-semibold">{project?.width} × {project?.height} px</span>
              </div>
              <div className="flex justify-between">
                <span>Aspect Ratio:</span>
                <span className="text-indigo-400">
                  {project ? (project.width / project.height).toFixed(2) : ''} ({project?.width === 1080 ? '9:16 Phone' : 'Tablet'})
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

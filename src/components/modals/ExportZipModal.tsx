'use client';

import React, { useState } from 'react';
import { Project, ProjectPage, ExportOptions } from '@/types';
import { exportAllPagesAsZip, exportPlayStoreBundle } from '@/lib/export';
import { Archive, X, Check, Loader2, Sparkles, FolderArchive, Layers, Smartphone } from 'lucide-react';

interface ExportZipModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  pages: ProjectPage[];
  activeThemeId?: string;
}

export function ExportZipModal({
  isOpen,
  onClose,
  project,
  pages,
  activeThemeId = 'dark_premium',
}: ExportZipModalProps) {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [resolution, setResolution] = useState<1 | 2 | 3>(1);
  const [quality, setQuality] = useState<number>(0.92);
  const [bundleMode, setBundleMode] = useState<'standard' | 'playstore_bundle'>('playstore_bundle');
  const [isExporting, setIsExporting] = useState(false);
  const [progressText, setProgressText] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  if (!isOpen || !project) return null;

  const baseW = project.width;
  const baseH = project.height;

  const handleExportZip = async () => {
    setIsExporting(true);
    setProgressPercent(5);
    setProgressText('Preparing screens...');

    try {
      const options: ExportOptions = {
        format,
        resolution,
        quality,
      };

      if (bundleMode === 'playstore_bundle') {
        // Multi-Size Play Store Bundle: Phone + 7" Tablet + 10" Tablet
        await exportPlayStoreBundle(
          project,
          pages,
          options,
          activeThemeId,
          (step, percent) => {
            setProgressText(step);
            setProgressPercent(percent);
          }
        );
      } else {
        // Standard ZIP export
        await exportAllPagesAsZip(
          project,
          pages,
          options,
          activeThemeId,
          (current, total) => {
            setProgressText(`Rendering screen ${current} of ${total}...`);
            setProgressPercent(Math.round((current / total) * 100));
          }
        );
      }

      onClose();
    } catch (err) {
      console.error('ZIP Export failed:', err);
      alert('Failed to export ZIP. Please try again.');
    } finally {
      setIsExporting(false);
      setProgressText(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#111625] border border-slate-700/60 shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Export Screenshots ZIP</h2>
              <p className="text-xs text-slate-400">
                Package all {pages.length} screens into ready-to-upload ZIP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Export Mode: Play Store Bundle vs Standard */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Package Type
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setBundleMode('playstore_bundle')}
                className={`p-3 rounded-xl border text-left transition ${
                  bundleMode === 'playstore_bundle'
                    ? 'bg-indigo-950/50 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    Play Store Bundle
                  </span>
                  {bundleMode === 'playstore_bundle' && (
                    <Check className="w-3.5 h-3.5 text-indigo-400 stroke-[3]" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Auto-creates 📱 Phone (1080×1920), 📲 7&quot; Tablet (1200×1920), and 📲 10&quot; Tablet (1536×2048) folders
                </p>
              </button>

              <button
                type="button"
                onClick={() => setBundleMode('standard')}
                className={`p-3 rounded-xl border text-left transition ${
                  bundleMode === 'standard'
                    ? 'bg-indigo-950/50 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                    Current Size Only
                  </span>
                  {bundleMode === 'standard' && (
                    <Check className="w-3.5 h-3.5 text-indigo-400 stroke-[3]" />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight font-mono">
                  {project.width} × {project.height} px
                </p>
              </button>
            </div>
          </div>

          {/* Format selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              File Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  disabled={isExporting}
                  onClick={() => setFormat(fmt)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition border ${
                    format === fmt
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {fmt === 'jpeg' ? 'JPG' : fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution Multiplier */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Resolution Scale
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([1, 2, 3] as const).map((res) => (
                <button
                  key={res}
                  type="button"
                  disabled={isExporting}
                  onClick={() => setResolution(res)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium transition border flex items-center justify-center gap-1 ${
                    resolution === res
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="font-bold">{res}x</span>
                  <span className="text-[10px] opacity-75">
                    {res === 1 ? 'Standard' : res === 2 ? 'High-Res' : 'Ultra-Res'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quality slider */}
          {format !== 'png' && (
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold uppercase tracking-wider text-slate-400">Quality</span>
                <span className="font-mono text-indigo-400">{Math.round(quality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.05"
                disabled={isExporting}
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          )}

          {/* Progress / Status display */}
          {isExporting && progressText ? (
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/40 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-indigo-300 text-xs font-semibold">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                {progressText}
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span className="truncate">
                {bundleMode === 'playstore_bundle'
                  ? `Bundling ${pages.length * 3} files across 3 Play Store device sizes`
                  : `Bundling ${pages.length} screenshot files`}
              </span>
              <span className="text-[11px] text-indigo-400 font-mono shrink-0">
                .{format === 'jpeg' ? 'jpg' : format} in .zip
              </span>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isExporting}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportZip}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Packaging ZIP...
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                {bundleMode === 'playstore_bundle'
                  ? 'Export Play Store Bundle'
                  : 'Export ZIP'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

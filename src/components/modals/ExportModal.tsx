'use client';

import React, { useState } from 'react';
import * as fabric from 'fabric';
import { Project, ProjectPage, ExportOptions } from '@/types';
import { exportCanvasImage, sanitizeFilename } from '@/lib/export';
import { Download, X, Image as ImageIcon, Sparkles } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvas: fabric.Canvas | null;
  project: Project | null;
  activePage: ProjectPage | null;
}

export function ExportModal({
  isOpen,
  onClose,
  canvas,
  project,
  activePage,
}: ExportModalProps) {
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [resolution, setResolution] = useState<1 | 2 | 3>(1);
  const [quality, setQuality] = useState<number>(0.92);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !canvas || !project) return null;

  const baseW = project.width;
  const baseH = project.height;
  const finalW = baseW * resolution;
  const finalH = baseH * resolution;

  const pageName = activePage?.name || 'screenshot';
  const cleanName = `${sanitizeFilename(pageName)}`;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const options: ExportOptions = {
        format,
        resolution,
        quality,
      };
      await exportCanvasImage(canvas, options, cleanName);
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export image. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-[#111625] border border-slate-700/60 shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Export Screenshot</h2>
              <p className="text-xs text-slate-400">High-resolution local image export</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
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
                  onClick={() => setResolution(res)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-medium transition border flex flex-col items-center justify-center ${
                    resolution === res
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="font-bold text-sm">{res}x</span>
                  <span className="text-[10px] opacity-75">
                    {baseW * res} × {baseH * res}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quality slider for JPG / WebP */}
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
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          )}

          {/* Target filename preview */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <ImageIcon className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="truncate font-mono">
                {cleanName}.{format === 'jpeg' ? 'jpg' : format}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 shrink-0 font-mono">
              {finalW} × {finalH}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting...' : 'Export Image'}
          </button>
        </div>
      </div>
    </div>
  );
}

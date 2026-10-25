'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStudioStore } from '@/store/useStudioStore';
import { exportProjectBackup } from '@/lib/db';
import { downloadBlob, sanitizeFilename } from '@/lib/export';
import { PLAYSTORE_SIZES } from '@/lib/presets';
import { PlayStoreDevicePreset } from '@/types';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Loader2,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Upload,
  Download,
  FolderArchive,
  Save,
  Check,
  Smartphone,
  Tablet,
  Zap,
  Eye,
  EyeOff,
  RefreshCw,
  Link2,
} from 'lucide-react';

interface EditorNavbarProps {
  onUploadClick: () => void;
  onApplyThemeToAll: () => void;
  onExportClick: () => void;
  onExportZipClick: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomFit?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
}

export function EditorNavbar({
  onUploadClick,
  onApplyThemeToAll,
  onExportClick,
  onExportZipClick,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onZoomFit,
  onZoomIn,
  onZoomOut,
}: EditorNavbarProps) {
  const router = useRouter();
  const {
    project,
    pages,
    activePageId,
    saveStatus,
    zoomLevel,
    isAutoSyncAll,
    activeDevicePreset,
    isPreviewMode,
    setIsAutoSyncAll,
    setActiveDevicePreset,
    setIsPreviewMode,
    resetDeviceVariantToPhoneSync,
    updateProjectTitle,
  } = useStudioStore();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(project?.name || '');
  const [isExportingBackup, setIsExportingBackup] = useState(false);

  const currentPage = pages.find((p) => p.id === activePageId);
  const isTab7Customized = !!currentPage?.variants?.tablet_7?.isCustomized;
  const isTab10Customized = !!currentPage?.variants?.tablet_10?.isCustomized;

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleInput.trim()) {
      updateProjectTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const handleBackup = async () => {
    if (!project) return;
    setIsExportingBackup(true);
    try {
      const blob = await exportProjectBackup(project.id);
      downloadBlob(blob, `${sanitizeFilename(project.name)}.sstudio`);
    } catch {
      alert('Failed to export backup.');
    } finally {
      setIsExportingBackup(false);
    }
  };

  const handleResetCurrentVariantToSync = async () => {
    if (!activePageId) return;
    if (activeDevicePreset === 'tablet_7' || activeDevicePreset === 'tablet_10') {
      if (confirm('Kya aap is tablet design ko reset karke Phone wale design ke saath dubara sync karna chahte hain?')) {
        await resetDeviceVariantToPhoneSync(activePageId, activeDevicePreset);
      }
    }
  };

  return (
    <header className="h-14 bg-[#0d101a] border-b border-slate-800/80 px-4 flex items-center justify-between z-30 select-none gap-2">
      {/* Left: Back & Project Title & Device Form Factor Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition shrink-0"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="h-4 w-px bg-slate-800 shrink-0" />

        {isEditingTitle ? (
          <form onSubmit={handleTitleSubmit} className="flex items-center gap-1.5 shrink-0">
            <input
              type="text"
              autoFocus
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              className="px-2.5 py-1 text-sm font-semibold rounded-lg bg-slate-800 border border-indigo-500 text-white outline-none"
            />
            <button
              type="submit"
              className="p-1 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 transition"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <div
            onClick={() => {
              setTitleInput(project?.name || '');
              setIsEditingTitle(true);
            }}
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition max-w-[120px] sm:max-w-xs truncate">
              {project?.name || 'Untitled Project'}
            </span>
          </div>
        )}

        <div className="hidden xl:block h-4 w-px bg-slate-800 shrink-0" />

        {/* Multi-Device Form Factor Switcher (Phone, 7" Tab, 10" Tab) */}
        <div className="flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-slate-800/90 shadow-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveDevicePreset('phone')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              activeDevicePreset === 'phone'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
            title="Google Play Store Phone (1080 × 1920 px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Phone</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDevicePreset('tablet_7')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition relative ${
              activeDevicePreset === 'tablet_7'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
            title="Google Play Store 7-inch Tablet (1200 × 1920 px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>7" Tab</span>
            {isTab7Customized && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Customized independently" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveDevicePreset('tablet_10')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition relative ${
              activeDevicePreset === 'tablet_10'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
            }`}
            title="Google Play Store 10-inch Tablet (1536 × 2048 px)"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>10" Tab</span>
            {isTab10Customized && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Customized independently" />
            )}
          </button>
        </div>

        {/* Sync Status Badge & Decoupling Controls */}
        {activeDevicePreset === 'phone' ? (
          <span className="hidden 2xl:flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-950/40 text-indigo-300 border border-indigo-500/20">
            <Smartphone className="w-3 h-3 text-indigo-400" />
            Master Phone
          </span>
        ) : (
          <div className="hidden lg:flex items-center gap-1.5">
            {((activeDevicePreset === 'tablet_7' && isTab7Customized) ||
              (activeDevicePreset === 'tablet_10' && isTab10Customized)) ? (
              <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-500/30 rounded-lg px-2 py-0.5 text-[11px] text-amber-300 font-medium">
                <span>Customized (Independent)</span>
                <button
                  type="button"
                  onClick={handleResetCurrentVariantToSync}
                  className="ml-1 p-0.5 hover:text-white rounded hover:bg-amber-900/50 transition"
                  title="Reset and re-sync with Phone version"
                >
                  <RefreshCw className="w-3 h-3 text-amber-400" />
                </button>
              </div>
            ) : (
              <span className="flex items-center gap-1 bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-2 py-0.5 text-[11px] text-emerald-300 font-medium">
                <Link2 className="w-3 h-3 text-emerald-400" />
                Auto-Synced with Phone
              </span>
            )}
          </div>
        )}

        {/* Save Status Badge */}
        <div className="hidden xl:flex items-center gap-1.5 text-[11px] font-medium text-slate-400 pl-1">
          {saveStatus === 'saving' ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
              <span className="text-amber-400">Saving...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span className="text-slate-400">Saved</span>
            </>
          )}
        </div>
      </div>

      {/* Center: Undo / Redo & Zoom Controls */}
      <div className="hidden md:flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-xl p-1">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-3 w-px bg-slate-800 mx-1" />

        <button
          type="button"
          onClick={onZoomOut}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onZoomFit}
          className="px-2 py-1 rounded-lg text-xs font-mono text-slate-300 hover:bg-slate-800 transition flex items-center gap-1"
          title="Fit to Screen"
        >
          <span>{Math.round(zoomLevel * 100)}%</span>
          <Maximize2 className="w-3 h-3 text-slate-500" />
        </button>
        <button
          type="button"
          onClick={onZoomIn}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Toggle Real Exported JPG Preview Mode */}
        <button
          type="button"
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition shadow-xs ${
            isPreviewMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 ring-1 ring-amber-500/30'
              : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:text-white hover:bg-slate-800'
          }`}
          title="Toggle Real Exported Image View (Hides all editor boxes, exactly how exported JPG looks)"
        >
          {isPreviewMode ? (
            <>
              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">Exit Preview</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>Preview JPG</span>
            </>
          )}
        </button>

        {/* Upload Screenshots button */}
        <button
          type="button"
          onClick={onUploadClick}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          title="Upload Screenshots to current project"
        >
          <Upload className="w-3.5 h-3.5 text-indigo-400" />
          <span>Upload</span>
        </button>

        {/* Sync & Apply Theme to All Screens Button */}
        <button
          type="button"
          onClick={onApplyThemeToAll}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-200 bg-indigo-950/60 hover:bg-indigo-900/70 border border-indigo-600/60 shadow-sm transition"
          title="Apply current theme & palette to all screenshots"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Sync All ({pages.length})</span>
        </button>

        {/* Export single image */}
        <button
          type="button"
          onClick={onExportClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition"
          title="Export single screenshot (Ctrl+E)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        {/* Export All as ZIP */}
        <button
          type="button"
          onClick={onExportZipClick}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/30 transition"
          title="Export all screenshots packaged as ZIP (including multi-device bundle)"
        >
          <FolderArchive className="w-3.5 h-3.5" />
          <span>Export ZIP</span>
        </button>

        {/* Backup button */}
        <button
          type="button"
          disabled={isExportingBackup}
          onClick={handleBackup}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Export local backup (.sstudio)"
        >
          <Save className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

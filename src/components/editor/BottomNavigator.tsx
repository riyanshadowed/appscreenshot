'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useStudioStore } from '@/store/useStudioStore';
import { ProjectPage } from '@/types';
import { saveAsset } from '@/lib/db';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';
import { RenameModal } from '@/components/modals/RenameModal';
import {
  Plus,
  Copy,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Upload,
  Smartphone,
  MoreVertical,
  X,
} from 'lucide-react';

interface BottomNavigatorProps {
  onPageSelect: (pageId: string) => void;
  onAddPage: () => void;
  onBatchUpload: (files: File[]) => void;
}

export function BottomNavigator({
  onPageSelect,
  onAddPage,
  onBatchUpload,
}: BottomNavigatorProps) {
  const {
    pages,
    activePageId,
    project,
    duplicatePageById,
    deletePageById,
    reorderPagesByIds,
    createPageWithScreenshot,
  } = useStudioStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProjectPage | null>(null);
  const [renameTarget, setRenameTarget] = useState<ProjectPage | null>(null);
  const [menuPage, setMenuPage] = useState<ProjectPage | null>(null);
  const [menuCoords, setMenuCoords] = useState<{ x: number; y: number } | null>(null);
  const [menuIndex, setMenuIndex] = useState<number>(0);

  // Close menu on outside click or scroll
  useEffect(() => {
    const handleGlobalClick = () => {
      setMenuPage(null);
      setMenuCoords(null);
    };
    window.addEventListener('click', handleGlobalClick);
    window.addEventListener('scroll', handleGlobalClick, true);
    return () => {
      window.removeEventListener('click', handleGlobalClick);
      window.removeEventListener('scroll', handleGlobalClick, true);
    };
  }, []);

  const handleDuplicate = async (e: React.MouseEvent, pageId: string) => {
    e.stopPropagation();
    setMenuPage(null);
    setMenuCoords(null);
    await duplicatePageById(pageId);
  };

  const handleMove = async (e: React.MouseEvent, index: number, direction: 'left' | 'right') => {
    e.stopPropagation();
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= pages.length) return;

    const newPageIds = [...pages.map((p) => p.id)];
    const temp = newPageIds[index];
    newPageIds[index] = newPageIds[newIndex];
    newPageIds[newIndex] = temp;

    await reorderPagesByIds(newPageIds);
    setMenuPage(null);
    setMenuCoords(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = Array.from(e.target.files).filter((f) =>
        ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(f.type)
      );
      if (validFiles.length > 0) {
        onBatchUpload(validFiles);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = Array.from(e.dataTransfer.files).filter((f) =>
        ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(f.type)
      );
      if (validFiles.length > 0) {
        onBatchUpload(validFiles);
      }
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="relative h-28 bg-[#0a0d17] border-t border-slate-800/80 px-4 flex items-center justify-between gap-4 z-30 select-none"
    >
      {/* Hidden file input for batch upload */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Pages List Strip */}
      <div className="flex items-center gap-3 overflow-x-auto py-2 flex-1 scrollbar-thin">
        {pages.map((page, index) => {
          const isActive = page.id === activePageId;
          const isMenuOpen = menuPage?.id === page.id;

          return (
            <div
              key={page.id}
              onClick={() => onPageSelect(page.id)}
              className={`relative group shrink-0 flex flex-col items-center cursor-pointer transition-all ${
                isActive ? 'scale-105' : 'hover:scale-100 opacity-80 hover:opacity-100'
              }`}
            >
              {/* Thumbnail Container */}
              <div
                className={`relative w-28 h-20 rounded-xl border flex items-center justify-center transition-all shadow-md ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/50'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
              >
                {/* Image preview with inner overflow hidden */}
                <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center">
                  {page.thumbnailDataUrl ? (
                    <img
                      src={page.thumbnailDataUrl}
                      alt={page.name}
                      className="object-contain max-h-full max-w-full"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-500 text-[10px]">
                      <Smartphone className="w-5 h-5 text-slate-600 mb-0.5" />
                      <span className="font-mono">{String(index + 1).padStart(2, '0')}</span>
                    </div>
                  )}
                </div>

                {/* Page Index badge */}
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-[10px] font-mono text-white border border-white/10 pointer-events-none">
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Top Right Action Buttons: Direct Delete & 3-Dot Menu */}
                <div
                  className="absolute top-1.5 right-1.5 flex items-center gap-1 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Direct Red Delete Trash Button (shown if more than 1 screen) */}
                  {pages.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(page);
                      }}
                      className="p-1 rounded-md bg-rose-600 hover:bg-rose-500 text-white shadow-md transition"
                      title="Delete this screen"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}

                  {/* 3-Dot Menu Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (menuPage?.id === page.id) {
                        setMenuPage(null);
                        setMenuCoords(null);
                      } else {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        const menuWidth = 210;
                        let x = rect.right - menuWidth;
                        if (x < 10) x = 10;
                        if (x + menuWidth > window.innerWidth - 10) {
                          x = window.innerWidth - menuWidth - 10;
                        }
                        const y = window.innerHeight - rect.top + 8;
                        setMenuCoords({ x, y });
                        setMenuPage(page);
                        setMenuIndex(index);
                      }
                    }}
                    className={`p-1 rounded-md text-white backdrop-blur-sm shadow-md transition ${
                      isMenuOpen
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                        : 'bg-black/80 hover:bg-black text-slate-200'
                    }`}
                    title="Screen options (Delete, Rename, Duplicate, Move)"
                  >
                    <MoreVertical className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Page Title */}
              <span className="text-[11px] font-medium text-slate-400 group-hover:text-slate-200 mt-1 max-w-[110px] truncate">
                {page.name}
              </span>
            </div>
          );
        })}

        {/* Add Page Button */}
        <button
          type="button"
          onClick={onAddPage}
          className="shrink-0 w-24 h-20 rounded-xl border border-dashed border-slate-700 hover:border-indigo-500/80 bg-slate-900/40 hover:bg-indigo-950/20 text-slate-400 hover:text-indigo-300 flex flex-col items-center justify-center gap-1 transition"
          title="Add New Screen"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span className="text-[10px] font-semibold uppercase tracking-wider">Add Screen</span>
        </button>
      </div>

      {/* Floating 3-Dot Popover Menu (Directly above clicked card, fixed coordinate, NEVER CLIPPED) */}
      {menuPage && menuCoords && (
        <div
          style={{
            position: 'fixed',
            left: `${menuCoords.x}px`,
            bottom: `${menuCoords.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-52 rounded-2xl bg-[#141929] border border-slate-700 shadow-2xl p-2 text-xs text-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-800 text-[11px] font-bold text-slate-400 mb-1">
            <span className="truncate max-w-[130px]">{menuPage.name}</span>
            <button
              type="button"
              onClick={() => {
                setMenuPage(null);
                setMenuCoords(null);
              }}
              className="text-slate-500 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-1">
            {/* Delete Screen Option (prominent red at top for instant removal) */}
            {pages.length > 1 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDeleteTarget(menuPage);
                  setMenuPage(null);
                  setMenuCoords(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 border border-rose-800/40 text-left transition font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete Screen</span>
              </button>
            ) : (
              <div className="px-3 py-1.5 text-[10px] text-slate-500 italic bg-slate-900/40 rounded-lg">
                Must have at least 1 screen
              </div>
            )}

            <button
              type="button"
              onClick={(e) => handleDuplicate(e, menuPage.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-left transition font-medium text-slate-300 hover:text-white"
            >
              <Copy className="w-3.5 h-3.5 text-indigo-400" />
              <span>Duplicate Screen</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setRenameTarget(menuPage);
                setMenuPage(null);
                setMenuCoords(null);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-800 text-left transition font-medium text-slate-300 hover:text-white"
            >
              <Edit2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Rename Screen</span>
            </button>

            {/* Move Left / Right */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/60 rounded-xl text-slate-400">
              <span className="text-[11px]">Reorder:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={menuIndex === 0}
                  onClick={(e) => handleMove(e, menuIndex, 'left')}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 disabled:hover:bg-slate-800 transition"
                  title="Move Left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={menuIndex === pages.length - 1}
                  onClick={(e) => handleMove(e, menuIndex, 'right')}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 disabled:hover:bg-slate-800 transition"
                  title="Move Right"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Multiple Screenshot Upload Button */}
      <div className="shrink-0 pl-4 border-l border-slate-800/80 hidden sm:flex items-center">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition"
          title="Drag and drop or select multiple screenshots to create pages automatically"
        >
          <Upload className="w-4 h-4 text-indigo-400" />
          <div className="text-left">
            <div className="leading-tight">Batch Upload</div>
            <div className="text-[10px] text-slate-500">Auto-create pages</div>
          </div>
        </button>
      </div>

      {/* Delete Page Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Delete Screenshot Page?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This screen will be permanently removed.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deletePageById(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />

      {/* Rename Page Modal */}
      <RenameModal
        isOpen={!!renameTarget}
        title="Rename Screen"
        initialValue={renameTarget?.name || ''}
        onClose={() => setRenameTarget(null)}
        onSave={async (newName) => {
          if (renameTarget) {
            useStudioStore.setState((state) => ({
              pages: state.pages.map((p) =>
                p.id === renameTarget.id ? { ...p, name: newName } : p
              ),
            }));
            const { updatePage } = await import('@/lib/db');
            await updatePage(renameTarget.id, { name: newName });
          }
        }}
      />
    </div>
  );
}

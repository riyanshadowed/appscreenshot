'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getAllProjects,
  getPages,
  duplicateProject,
  deleteProject,
  updateProject,
  exportProjectBackup,
  importProjectBackup,
  getStorageEstimate,
} from '@/lib/db';
import { downloadBlob, sanitizeFilename } from '@/lib/export';
import { Project, ProjectPage } from '@/types';
import dynamic from 'next/dynamic';
import { NewProjectModal } from '@/components/modals/NewProjectModal';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';
import { RenameModal } from '@/components/modals/RenameModal';

const ThemeShowcase = dynamic(
  () => import('@/components/home/ThemeShowcase').then((mod) => mod.ThemeShowcase),
  {
    ssr: false,
    loading: () => (
      <div className="mt-14 pt-12 border-t border-slate-800/80 animate-pulse h-96 rounded-3xl bg-slate-900/40 border border-slate-800" />
    ),
  }
);
import {
  Sparkles,
  Plus,
  Upload,
  MoreVertical,
  Trash2,
  Copy,
  Download,
  Edit2,
  HardDrive,
  AlertTriangle,
  Smartphone,
  ExternalLink,
  Layers,
  Clock,
  Layout,
  CheckCircle2,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectPagesMap, setProjectPagesMap] = useState<Record<string, ProjectPage[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [storageInfo, setStorageInfo] = useState({ usageMB: 0, quotaMB: 0, percent: 0, isLow: false });
  
  // Modals state
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [renameTarget, setRenameTarget] = useState<Project | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const list = await getAllProjects();
      setProjects(list);

      // Load pages for each project to show accurate page count and thumbnails
      const map: Record<string, ProjectPage[]> = {};
      for (const p of list) {
        const pages = await getPages(p.id);
        map[p.id] = pages;
      }
      setProjectPagesMap(map);

      const storage = await getStorageEstimate();
      setStorageInfo(storage);
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleGlobalClick = () => setOpenDropdownId(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const handleDuplicate = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    try {
      await duplicateProject(project.id);
      await loadData();
    } catch (err) {
      console.error('Failed to duplicate project:', err);
      alert('Could not duplicate project.');
    }
  };

  const handleExportBackup = async (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setOpenDropdownId(null);
    try {
      const blob = await exportProjectBackup(project.id);
      const filename = `${sanitizeFilename(project.name)}.sstudio`;
      downloadBlob(blob, filename);
    } catch (err) {
      console.error('Backup export failed:', err);
      alert('Failed to export project backup.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProject(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Could not delete project.');
    }
  };

  const handleRenameConfirm = async (newName: string) => {
    if (!renameTarget) return;
    try {
      await updateProject(renameTarget.id, { name: newName });
      setRenameTarget(null);
      await loadData();
    } catch (err) {
      console.error('Failed to rename project:', err);
      alert('Could not rename project.');
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const imported = await importProjectBackup(file);
      await loadData();
      router.push(`/editor/${imported.id}`);
    } catch (err: any) {
      console.error('Import failed:', err);
      alert(err.message || 'Invalid .sstudio backup file.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#080a11] text-slate-100 flex flex-col" suppressHydrationWarning>
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-[#0d101a]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Screenshot Studio
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Local-First
                </span>
              </h1>
              <p className="text-xs text-slate-400">Play Store & App Store Screenshot Designer</p>
            </div>
          </div>

          {/* Action buttons & Storage indicator */}
          <div className="flex items-center gap-3">
            {/* Storage estimate pill */}
            <div
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                storageInfo.isLow
                  ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
              title="Browser storage usage on this computer"
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>{storageInfo.usageMB} MB local</span>
              {storageInfo.isLow && (
                <span className="text-rose-400 text-[10px] font-semibold">Low space</span>
              )}
            </div>

            {/* Import Project Backup */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".sstudio,application/zip"
              className="hidden"
              onChange={handleImportFile}
            />
            <button
              type="button"
              disabled={isImporting}
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isImporting ? 'Importing...' : 'Import Backup'}</span>
            </button>

            {/* + New Project */}
            <button
              type="button"
              onClick={() => setIsNewProjectOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Project</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" suppressHydrationWarning>
        {/* Storage Warning if low */}
        {storageInfo.isLow && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-950/30 border border-amber-600/40 text-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold block text-sm">Storage is running low</span>
              Your browser storage has used {storageInfo.usageMB} MB. Consider exporting project backups (.sstudio) or deleting unused projects to free space.
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Recent Projects</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Your projects and screenshots stay 100% private and stored in your browser
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-400 border border-slate-700">
            {projects.length} {projects.length === 1 ? 'Project' : 'Projects'}
          </span>
        </div>

        {/* Projects Grid or Zero State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-slate-900/60 border border-slate-800" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/30 border border-slate-800/80 max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600/20 to-violet-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Smartphone className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No projects created yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
              Create your first Google Play Store screenshot collection. Pick from 12+ ready-made premium themes, drop your app screenshots, and export in seconds.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsNewProjectOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Create Play Store Project
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition"
              >
                <Upload className="w-4 h-4" />
                Import .sstudio Backup
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
              const pages = projectPagesMap[project.id] || [];
              const firstThumbnail = pages[0]?.thumbnailDataUrl;

              return (
                <div
                  key={project.id}
                  onClick={() => router.push(`/editor/${project.id}`)}
                  className="group relative cursor-pointer rounded-2xl bg-[#0f1320] border border-slate-800 hover:border-indigo-500/50 shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col"
                >
                  {/* Thumbnail Preview Area */}
                  <div className="relative aspect-[16/10] w-full bg-[#0a0d16] flex items-center justify-center border-b border-slate-800/80 rounded-t-2xl">
                    <div className="w-full h-full overflow-hidden rounded-t-2xl flex items-center justify-center">
                      {firstThumbnail ? (
                        <img
                          src={firstThumbnail}
                          alt={project.name}
                          className="object-contain max-h-full max-w-full p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        /* Placeholder artwork preview */
                        <div className="flex flex-col items-center justify-center text-slate-600 group-hover:text-indigo-400 transition">
                          <Smartphone className="w-12 h-12 stroke-[1.2]" />
                          <span className="text-[11px] font-mono mt-1 text-slate-500">
                            {project.width} × {project.height}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-slate-300 pointer-events-none">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{pages.length} {pages.length === 1 ? 'screen' : 'screens'}</span>
                    </div>

                    {/* More Menu Dropdown trigger */}
                    <div
                      className="absolute top-3 right-3 z-30"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdownId(openDropdownId === project.id ? null : project.id);
                      }}
                    >
                      <button
                        type="button"
                        className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-slate-300 hover:text-white backdrop-blur-md border border-white/10 transition shadow-md"
                        title="Project options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      {openDropdownId === project.id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 mt-1 w-44 rounded-xl bg-[#141929] border border-slate-700 shadow-2xl py-1 text-xs text-slate-300 z-50 animate-in fade-in zoom-in-95 duration-100"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(null);
                              setRenameTarget(project);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-800 text-left transition"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                            Rename
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDuplicate(e, project)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-800 text-left transition"
                          >
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                            Duplicate
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleExportBackup(e, project)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-800 text-left transition"
                          >
                            <Download className="w-3.5 h-3.5 text-slate-400" />
                            Export Backup (.sstudio)
                          </button>
                          <div className="my-1 border-t border-slate-800" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdownId(null);
                              setDeleteTarget(project);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-rose-950/50 text-rose-400 text-left transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Project
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-indigo-300 transition truncate">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-mono">
                        <span>{project.width} × {project.height}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-sans text-slate-400">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(project.updatedAt)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                      <span>Open Editor</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* All Themes Gallery & Interactive Live Top Preview */}
        <ThemeShowcase />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0a0d16] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Screenshot Studio — Google Play Store Screenshot Designer</span>
          <span className="text-[11px] text-slate-500">
            Local-first & private. No cloud, no tracking, no data upload.
          </span>
        </div>
      </footer>

      {/* Modals */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        onCreated={() => loadData()}
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        title="Delete Project?"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? All screenshots, pages, and canvas designs in this project will be removed from your browser.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />

      <RenameModal
        isOpen={!!renameTarget}
        title="Rename Project"
        initialValue={renameTarget?.name || ''}
        onClose={() => setRenameTarget(null)}
        onSave={handleRenameConfirm}
      />
    </div>
  );
}

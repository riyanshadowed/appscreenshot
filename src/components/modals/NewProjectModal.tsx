'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PRESETS, DEFAULT_PRESET } from '@/lib/presets';
import { createProject, saveAsset, createPage } from '@/lib/db';
import { PresetCategory, Preset } from '@/types';
import { 
  Smartphone, 
  Tablet, 
  Share2, 
  Sliders, 
  X, 
  Upload, 
  Check, 
  Sparkles,
  Layers
} from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (projectId: string) => void;
}

export function NewProjectModal({ isOpen, onClose, onCreated }: NewProjectModalProps) {
  const router = useRouter();
  const [projectName, setProjectName] = useState('My Play Store App');
  const [category, setCategory] = useState<PresetCategory>('phone');
  const [selectedPreset, setSelectedPreset] = useState<Preset>(DEFAULT_PRESET);
  const [customWidth, setCustomWidth] = useState(1080);
  const [customHeight, setCustomHeight] = useState(1920);
  const [files, setFiles] = useState<File[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const filteredPresets = PRESETS.filter((p) => p.category === category);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter((f) => 
        ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(f.type)
      );
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const dropped = Array.from(e.dataTransfer.files).filter((f) =>
        ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(f.type)
      );
      setFiles((prev) => [...prev, ...dropped]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const width = category === 'custom' ? customWidth : selectedPreset.width;
      const height = category === 'custom' ? customHeight : selectedPreset.height;

      const project = await createProject({
        name: projectName.trim() || 'Untitled Project',
        width,
        height,
      });

      // If user provided multiple screenshots during project creation, create pages for them
      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const asset = await saveAsset({
            projectId: project.id,
            name: file.name,
            blob: file,
            mimeType: file.type,
          });

          const pageTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          if (i === 0) {
            // First file associates with initial page
            // Handled when project opens
          } else {
            await createPage({
              projectId: project.id,
              name: `${String(i + 1).padStart(2, '0')} ${pageTitle}`,
              screenshotAssetId: asset.id,
              headingText: pageTitle.toUpperCase(),
              subtitleText: 'Experience seamless and powerful features',
            });
          }
        }
      }

      if (onCreated) {
        onCreated(project.id);
      }
      router.push(`/editor/${project.id}`);
    } catch (err) {
      console.error('Error creating project:', err);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#111625] border border-slate-700/60 shadow-2xl p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Create New Project</h2>
              <p className="text-xs text-slate-400">Set dimensions and optionally drop your app screenshots</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-5 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. FinTrack Play Store Screenshots"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-500 outline-none transition"
            />
          </div>

          {/* Screenshot Type / Category Tabs */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Preset Category
            </label>
            <div className="grid grid-cols-4 gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => setCategory('phone')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition ${
                  category === 'phone'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                Phone
              </button>
              <button
                type="button"
                onClick={() => setCategory('tablet')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition ${
                  category === 'tablet'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Tablet className="w-4 h-4" />
                Tablet
              </button>
              <button
                type="button"
                onClick={() => setCategory('social')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition ${
                  category === 'social'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Share2 className="w-4 h-4" />
                Social
              </button>
              <button
                type="button"
                onClick={() => setCategory('custom')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition ${
                  category === 'custom'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Sliders className="w-4 h-4" />
                Custom
              </button>
            </div>
          </div>

          {/* Preset Selection or Custom Dimensions */}
          {category !== 'custom' ? (
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Select Resolution
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredPresets.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset)}
                      className={`relative cursor-pointer p-3.5 rounded-xl border transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-sm text-white">{preset.name}</div>
                          <div className="text-xs text-indigo-400 font-mono mt-0.5">
                            {preset.width} × {preset.height} px ({preset.ratio})
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 line-clamp-1">{preset.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Width (px)</label>
                <input
                  type="number"
                  min={300}
                  max={4000}
                  value={customWidth}
                  onChange={(e) => setCustomWidth(Math.max(100, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Height (px)</label>
                <input
                  type="number"
                  min={300}
                  max={4000}
                  value={customHeight}
                  onChange={(e) => setCustomHeight(Math.max(100, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Initial Screenshots Drop Zone */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Upload App Screenshots (Optional)
              </label>
              {files.length > 0 && (
                <span className="text-xs font-medium text-indigo-400">
                  {files.length} {files.length === 1 ? 'file' : 'files'} selected
                </span>
              )}
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="relative border-2 border-dashed border-slate-700 hover:border-indigo-500/80 rounded-xl p-5 text-center transition bg-slate-900/40 group cursor-pointer"
            >
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleFilesSelected}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-indigo-950/60 text-slate-400 group-hover:text-indigo-400 flex items-center justify-center transition">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-medium text-slate-300">
                  <span className="text-indigo-400 underline decoration-indigo-500/50 underline-offset-2">Browse files</span> or drag & drop screenshots here
                </div>
                <p className="text-[11px] text-slate-500">Supports PNG, JPG, JPEG, WebP. Multiple files create multiple pages automatically!</p>
              </div>
            </div>

            {/* Selected files list */}
            {files.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                {files.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300"
                  >
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="max-w-[140px] truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="p-1 hover:text-rose-400 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isCreating}
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            {isCreating ? 'Creating Project...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}

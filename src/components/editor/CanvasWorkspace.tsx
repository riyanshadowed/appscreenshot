'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { useStudioStore } from '@/store/useStudioStore';
import { buildThemeCanvas } from '@/lib/canvas/themeRenderer';
import { getAsset, saveAsset } from '@/lib/db';
import { blobToDataURL } from '@/lib/export';
import { CanvasLayerItem } from '@/types';
import {
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Smartphone,
  Tablet,
  Upload,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Download,
  X,
  Sparkles,
} from 'lucide-react';

interface CanvasWorkspaceProps {
  onCanvasReady: (canvas: fabric.Canvas) => void;
  onSelectionChange: (obj: fabric.FabricObject | null) => void;
  onLayersChange: (layers: CanvasLayerItem[]) => void;
  onHistoryChange: (canUndo: boolean, canRedo: boolean) => void;
  onTriggerExport: () => void;
}

export function CanvasWorkspace({
  onCanvasReady,
  onSelectionChange,
  onLayersChange,
  onHistoryChange,
  onTriggerExport,
}: CanvasWorkspaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);

  const {
    project,
    activePageId,
    pages,
    activeThemeId,
    activeVariation,
    activeFrame,
    customPalette,
    headingText,
    subtitleText,
    badgeText,
    zoomLevel,
    activeDevicePreset,
    isPreviewMode,
    setIsPreviewMode,
    setZoomLevel,
    setSaveStatus,
    updateCurrentPageCanvas,
  } = useStudioStore();

  const [isLoadingCanvas, setIsLoadingCanvas] = useState(false);
  const [quickJpgPreviewUrl, setQuickJpgPreviewUrl] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Undo/Redo history stack
  const historyStackRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  const isHistoryActionRef = useRef<boolean>(false);

  // Extract layers from canvas objects
  const updateLayersList = useCallback((canvas: fabric.Canvas) => {
    const objs = canvas.getObjects();
    const items: CanvasLayerItem[] = objs.map((obj, i) => {
      const dataTag = (obj as any).dataTag || 'shape';
      const name = (obj as any).name || `${dataTag.toUpperCase()} ${i + 1}`;
      return {
        id: (obj as any).id || `layer_${i}`,
        name,
        type: obj.type || 'object',
        visible: obj.visible !== false,
        locked: !!obj.lockMovementX,
        dataTag,
      };
    });
    onLayersChange(items);
  }, [onLayersChange]);

  // Push state to history
  const pushHistoryState = useCallback((canvas: fabric.Canvas) => {
    if (isHistoryActionRef.current) return;

    try {
      const json = JSON.stringify(canvas.toJSON());
      const stack = historyStackRef.current;
      const currentIndex = historyIndexRef.current;

      const newStack = stack.slice(0, currentIndex + 1);
      newStack.push(json);

      if (newStack.length > 50) {
        newStack.shift();
      }

      historyStackRef.current = newStack;
      historyIndexRef.current = newStack.length - 1;

      onHistoryChange(historyIndexRef.current > 0, false);
    } catch {
      // ignore
    }
  }, [onHistoryChange]);

  // Debounced Autosave (750ms)
  const triggerAutosave = useCallback(
    (canvas: fabric.Canvas) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setSaveStatus('saving');

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const json = JSON.stringify(canvas.toJSON());
          
          const thumb = canvas.toDataURL({
            format: 'jpeg',
            multiplier: 0.15,
            quality: 0.7,
          });

          await updateCurrentPageCanvas(json, thumb);
          setSaveStatus('saved');
        } catch (e) {
          console.error('Autosave error:', e);
          setSaveStatus('error');
        }
      }, 750);
    },
    [setSaveStatus, updateCurrentPageCanvas]
  );

  // Apply zoom and sync dimensions
  const applyZoom = useCallback((scale: number) => {
    const canvas = fabricRef.current;
    if (!canvas || !project) return;

    canvas.setZoom(scale);
    canvas.setDimensions({
      width: Math.round(project.width * scale),
      height: Math.round(project.height * scale),
    });
    canvas.renderAll();
    setZoomLevel(scale);
  }, [project, setZoomLevel]);

  // Auto-fit zoom based on container size
  const fitZoom = useCallback(() => {
    if (!containerRef.current || !project || !fabricRef.current) return;
    const container = containerRef.current;
    const padding = 80;
    const availW = container.clientWidth - padding;
    const availH = container.clientHeight - padding;

    if (availW <= 0 || availH <= 0) return;

    const scale = Math.min(availW / project.width, availH / project.height);
    const calculated = Math.min(1.2, Math.max(0.12, Math.round(scale * 100) / 100));

    applyZoom(calculated);
  }, [project, applyZoom]);

  // Undo implementation
  const handleUndo = useCallback(async () => {
    const canvas = fabricRef.current;
    if (!canvas || historyIndexRef.current <= 0) return;

    isHistoryActionRef.current = true;
    historyIndexRef.current -= 1;
    const jsonStr = historyStackRef.current[historyIndexRef.current];

    if (jsonStr) {
      await canvas.loadFromJSON(jsonStr);
      fitZoom();
      updateLayersList(canvas);
      triggerAutosave(canvas);
    }

    isHistoryActionRef.current = false;
    onHistoryChange(historyIndexRef.current > 0, historyIndexRef.current < historyStackRef.current.length - 1);
  }, [onHistoryChange, triggerAutosave, updateLayersList, fitZoom]);

  // Redo implementation
  const handleRedo = useCallback(async () => {
    const canvas = fabricRef.current;
    if (!canvas || historyIndexRef.current >= historyStackRef.current.length - 1) return;

    isHistoryActionRef.current = true;
    historyIndexRef.current += 1;
    const jsonStr = historyStackRef.current[historyIndexRef.current];

    if (jsonStr) {
      await canvas.loadFromJSON(jsonStr);
      fitZoom();
      updateLayersList(canvas);
      triggerAutosave(canvas);
    }

    isHistoryActionRef.current = false;
    onHistoryChange(historyIndexRef.current > 0, historyIndexRef.current < historyStackRef.current.length - 1);
  }, [onHistoryChange, triggerAutosave, updateLayersList, fitZoom]);

  // Load / Rebuild Active Page Canvas
  const loadPageCanvas = useCallback(async () => {
    if (!project || !activePageId) return;
    const page = pages.find((p) => p.id === activePageId);
    if (!page) return;

    setIsLoadingCanvas(true);

    try {
      let canvas = fabricRef.current;
      if (!canvas && canvasElRef.current) {
        // Modern sleek Figma/Canva selection controls
        fabric.FabricObject.prototype.transparentCorners = false;
        fabric.FabricObject.prototype.cornerColor = '#ffffff';
        fabric.FabricObject.prototype.cornerStrokeColor = '#4f46e5';
        fabric.FabricObject.prototype.borderColor = '#6366f1';
        fabric.FabricObject.prototype.cornerSize = 9;
        fabric.FabricObject.prototype.cornerStyle = 'circle';
        fabric.FabricObject.prototype.borderScaleFactor = 1.5;
        fabric.FabricObject.prototype.padding = 6;

        canvas = new fabric.Canvas(canvasElRef.current, {
          width: project.width,
          height: project.height,
          backgroundColor: '#000000',
          preserveObjectStacking: true,
          selection: !isPreviewMode,
        });
        fabricRef.current = canvas;
        onCanvasReady(canvas);

        // Event listeners
        canvas.on('selection:created', (e) => {
          onSelectionChange(e.selected ? e.selected[0] : null);
        });
        canvas.on('selection:updated', (e) => {
          onSelectionChange(e.selected ? e.selected[0] : null);
        });
        canvas.on('selection:cleared', () => {
          onSelectionChange(null);
        });
        canvas.on('object:modified', () => {
          pushHistoryState(canvas!);
          triggerAutosave(canvas!);
          updateLayersList(canvas!);
        });
        canvas.on('text:changed', (e: any) => {
          const target = e.target;
          if (target) {
            const dataTag = (target as any).dataTag;
            const newText = (target as any).text || '';
            if (dataTag === 'heading') {
              useStudioStore.getState().setHeadingText(newText);
            } else if (dataTag === 'subtitle') {
              useStudioStore.getState().setSubtitleText(newText);
            }
          }
          pushHistoryState(canvas!);
          triggerAutosave(canvas!);
        });
        canvas.on('object:added', () => {
          updateLayersList(canvas!);
        });
        canvas.on('object:removed', () => {
          updateLayersList(canvas!);
        });
      }

      if (!canvas) {
        setIsLoadingCanvas(false);
        return;
      }

      const targetW = project.width;
      const targetH = project.height;

      // Sync canvas dimensions with current device preset
      canvas.setDimensions({
        width: targetW,
        height: targetH,
      });

      // Check if page has saved JSON for the active device preset
      let jsonToLoad: string | undefined;

      if (activeDevicePreset === 'phone') {
        jsonToLoad = page.variants?.phone?.canvasJSON || page.canvasJSON;
      } else {
        const variant = page.variants?.[activeDevicePreset];
        if (variant?.isCustomized && variant?.canvasJSON && variant.canvasJSON.length > 50) {
          jsonToLoad = variant.canvasJSON;
        }
      }

      if (jsonToLoad && jsonToLoad.length > 50) {
        try {
          await canvas.loadFromJSON(jsonToLoad);
        } catch (err) {
          console.error('Error loading page JSON, falling back to theme:', err);
        }
      } else {
        // Auto-generate for this device preset! By default, Tablet mirrors phone's screenshot, theme & texts
        let screenshotUrl: string | undefined;
        if (page.screenshotAssetId) {
          const asset = await getAsset(page.screenshotAssetId);
          if (asset && asset.blob) {
            screenshotUrl = await blobToDataURL(asset.blob);
          }
        }

        // Tablets get dedicated tablet frame by default; phone uses activeFrame
        const effectiveFrame = activeDevicePreset === 'phone' ? activeFrame : 'tablet';

        await buildThemeCanvas(canvas, {
          themeId: activeThemeId,
          variation: activeVariation,
          frameType: effectiveFrame,
          customPalette,
          headingText: page.headingText || headingText,
          subtitleText: page.subtitleText || subtitleText,
          badgeText: page.badgeText || badgeText,
          screenshotUrl,
          canvasWidth: targetW,
          canvasHeight: targetH,
        });

        triggerAutosave(canvas);
      }

      fitZoom();
      updateLayersList(canvas);

      historyStackRef.current = [JSON.stringify(canvas.toJSON())];
      historyIndexRef.current = 0;
      onHistoryChange(false, false);
    } catch (err) {
      console.error('Failed to render canvas:', err);
    } finally {
      setIsLoadingCanvas(false);
    }
  }, [
    project,
    activePageId,
    pages,
    activeDevicePreset,
    activeThemeId,
    activeVariation,
    activeFrame,
    customPalette,
    headingText,
    subtitleText,
    isPreviewMode,
    onCanvasReady,
    onSelectionChange,
    triggerAutosave,
    pushHistoryState,
    updateLayersList,
    fitZoom,
    onHistoryChange,
  ]);

  // Initial load when active page, project or device preset changes
  useEffect(() => {
    if (project && activePageId && pages.length > 0) {
      loadPageCanvas();
    }
  }, [project?.id, activePageId, activeDevicePreset, project?.width, project?.height]);

  // Handle Clean Exported JPG Preview Mode toggle
  useEffect(() => {
    const canvas = fabricRef.current;
    if (!canvas) return;

    if (isPreviewMode) {
      canvas.discardActiveObject();
      canvas.selection = false;
      canvas.getObjects().forEach((obj) => {
        obj.selectable = false;
        obj.evented = false;
      });
      onSelectionChange(null);
    } else {
      canvas.selection = true;
      canvas.getObjects().forEach((obj) => {
        const dataTag = (obj as any).dataTag;
        if (dataTag !== 'ambient-glow' && dataTag !== 'background') {
          obj.selectable = true;
          obj.evented = true;
        }
      });
    }
    canvas.renderAll();
  }, [isPreviewMode, onSelectionChange]);

  // Sync zoom level changes from navbar buttons
  useEffect(() => {
    if (fabricRef.current && project && zoomLevel > 0) {
      fabricRef.current.setZoom(zoomLevel);
      fabricRef.current.setDimensions({
        width: Math.round(project.width * zoomLevel),
        height: Math.round(project.height * zoomLevel),
      });
      fabricRef.current.renderAll();
    }
  }, [zoomLevel, project]);

  // Handle Window Resize
  useEffect(() => {
    const handleResize = () => fitZoom();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fitZoom]);

  // Keyboard Shortcuts (PRD Section 58)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const canvas = fabricRef.current;

      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (cmdOrCtrl && e.key === 's') {
        e.preventDefault();
        if (canvas) triggerAutosave(canvas);
      } else if (cmdOrCtrl && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleRedo();
      } else if (cmdOrCtrl && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if (cmdOrCtrl && e.key === 'e') {
        e.preventDefault();
        onTriggerExport();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (canvas) {
          const active = canvas.getActiveObject();
          if (active && (active as any).dataTag !== 'background') {
            e.preventDefault();
            canvas.remove(active);
            canvas.discardActiveObject();
            canvas.renderAll();
            pushHistoryState(canvas);
            triggerAutosave(canvas);
          }
        }
      } else if (e.key === 'Escape') {
        if (canvas) {
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      } else if (cmdOrCtrl && e.key === 'd') {
        e.preventDefault();
        if (canvas) {
          const active = canvas.getActiveObject();
          if (active && (active as any).dataTag !== 'background') {
            active.clone().then((cloned: fabric.FabricObject) => {
              cloned.set({
                left: (active.left || 0) + 30,
                top: (active.top || 0) + 30,
              });
              canvas.add(cloned);
              canvas.setActiveObject(cloned);
              canvas.renderAll();
              pushHistoryState(canvas);
              triggerAutosave(canvas);
            });
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, triggerAutosave, pushHistoryState, onTriggerExport]);

  // Handle Drag & Drop directly over Canvas
  const handleDropOnCanvas = async (e: React.DragEvent) => {
    e.preventDefault();
    if (!project || !activePageId) return;

    const file = e.dataTransfer.files?.[0];
    if (file && ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      const dataUrl = await blobToDataURL(file);
      const asset = await saveAsset({
        projectId: project.id,
        name: file.name,
        blob: file,
        mimeType: file.type,
      });

      const { updatePage } = await import('@/lib/db');
      await updatePage(activePageId, { screenshotAssetId: asset.id });

      useStudioStore.setState((state) => ({
        pages: state.pages.map((p) =>
          p.id === activePageId ? { ...p, screenshotAssetId: asset.id } : p
        ),
      }));

      const canvas = fabricRef.current;
      if (canvas) {
        const page = useStudioStore.getState().pages.find((p) => p.id === activePageId);
        await buildThemeCanvas(canvas, {
          themeId: activeThemeId,
          variation: activeVariation,
          frameType: activeFrame,
          customPalette,
          headingText: page?.headingText || headingText,
          subtitleText: page?.subtitleText || subtitleText,
          screenshotUrl: dataUrl,
          canvasWidth: project.width,
          canvasHeight: project.height,
        });

        fitZoom();
        const json = JSON.stringify(canvas.toJSON());
        const thumb = canvas.toDataURL({ format: 'jpeg', multiplier: 0.15, quality: 0.7 });
        await updateCurrentPageCanvas(json, thumb);
      }
    }
  };

  const activePageIndex = pages.findIndex((p) => p.id === activePageId) + 1;

  const handleOpenJpgPreview = () => {
    const canvas = fabricRef.current;
    if (!canvas) return;
    canvas.discardActiveObject();
    canvas.renderAll();
    const dataUrl = canvas.toDataURL({
      format: 'jpeg',
      quality: 0.95,
      multiplier: 1,
    });
    setQuickJpgPreviewUrl(dataUrl);
  };

  return (
    <div
      ref={containerRef}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDropOnCanvas}
      className="flex-1 h-full w-full bg-[#06080e] overflow-auto relative flex items-center justify-center p-8 canvas-checkerboard select-none"
    >
      {/* Loading Overlay */}
      {isLoadingCanvas && (
        <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <span className="text-xs font-semibold">Loading screenshot canvas...</span>
        </div>
      )}

      {/* Preview Mode Floating Banner */}
      {isPreviewMode && (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/90 border border-indigo-500/50 shadow-2xl backdrop-blur-md text-xs text-indigo-200 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Real Exported JPG View (Pixel-Perfect)</span>
          <button
            type="button"
            onClick={() => setIsPreviewMode(false)}
            className="ml-1 text-[11px] underline text-indigo-400 hover:text-white"
          >
            Exit
          </button>
        </div>
      )}

      {/* Fabric Canvas Container */}
      <div
        className="relative shadow-2xl rounded-2xl overflow-hidden transition-all duration-150 flex items-center justify-center"
        style={{
          boxShadow: '0 25px 80px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        <canvas ref={canvasElRef} />
      </div>

      {/* Floating Canvas Quick Toolbar */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#0f1322]/90 backdrop-blur-md border border-slate-700/80 shadow-2xl text-xs text-slate-300">
        <button
          type="button"
          onClick={() => applyZoom(Math.max(0.15, zoomLevel - 0.1))}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={fitZoom}
          className="px-2 py-0.5 rounded-lg hover:bg-slate-800 text-[11px] font-mono text-indigo-300 hover:text-indigo-200 transition flex items-center gap-1"
          title="Fit to Screen"
        >
          <span>{Math.round(zoomLevel * 100)}%</span>
          <Maximize2 className="w-3 h-3 text-slate-400" />
        </button>
        <button
          type="button"
          onClick={() => applyZoom(Math.min(1.5, zoomLevel + 0.1))}
          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="h-3.5 w-px bg-slate-700 mx-1" />

        {/* Clean Exported JPG Preview Toggle Button */}
        <button
          type="button"
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium transition ${
            isPreviewMode
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'hover:bg-slate-800 text-slate-300 hover:text-white'
          }`}
          title="Toggle Clean Exported Image View"
        >
          {isPreviewMode ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3 text-indigo-400" />}
          <span>{isPreviewMode ? 'Clean View ON' : 'Clean View'}</span>
        </button>

        {/* Instant Fullscreen JPG Preview Modal Trigger */}
        <button
          type="button"
          onClick={handleOpenJpgPreview}
          className="flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-slate-800 text-[11px] font-medium text-slate-300 hover:text-white transition"
          title="Preview exact full-res exported JPG in lightbox"
        >
          <ImageIcon className="w-3 h-3 text-emerald-400" />
          <span>Inspect JPG</span>
        </button>

        <div className="h-3.5 w-px bg-slate-700 mx-1" />

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono px-1">
          {activeDevicePreset === 'phone' ? (
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <Tablet className="w-3.5 h-3.5 text-indigo-400" />
          )}
          <span>Screen {activePageIndex} of {pages.length}</span>
        </div>
      </div>

      {/* Instant Fullscreen High-Res JPG Preview Lightbox */}
      {quickJpgPreviewUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 select-none">
          {/* Header */}
          <div className="w-full max-w-4xl flex items-center justify-between pb-3 text-white">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Play Store Final Export Quality Preview
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                {activeDevicePreset === 'phone'
                  ? 'Phone 1080 × 1920'
                  : activeDevicePreset === 'tablet_7'
                  ? '7" Tablet 1200 × 1920'
                  : '10" Tablet 1536 × 2048'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={quickJpgPreviewUrl}
                download={`screenshot-preview-${activeDevicePreset}.jpg`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save JPG</span>
              </a>
              <button
                type="button"
                onClick={() => setQuickJpgPreviewUrl(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div className="flex-1 max-h-[82vh] overflow-auto flex items-center justify-center p-2 rounded-2xl bg-[#090b14] border border-slate-800 shadow-2xl">
            <img
              src={quickJpgPreviewUrl}
              alt="Final JPG Preview"
              className="max-h-[78vh] w-auto rounded-xl object-contain shadow-2xl"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

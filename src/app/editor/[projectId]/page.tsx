'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import * as fabric from 'fabric';
import { useStudioStore } from '@/store/useStudioStore';
import { EditorNavbar } from '@/components/editor/EditorNavbar';
import { LeftSidebar } from '@/components/editor/LeftSidebar';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { BottomNavigator } from '@/components/editor/BottomNavigator';
import { CanvasWorkspace } from '@/components/editor/CanvasWorkspace';
import { ExportModal } from '@/components/modals/ExportModal';
import { ExportZipModal } from '@/components/modals/ExportZipModal';
import { ConfirmDeleteModal } from '@/components/modals/ConfirmDeleteModal';
import { blobToDataURL } from '@/lib/export';
import { buildThemeCanvas } from '@/lib/canvas/themeRenderer';
import { applyWordColorToFabricText, resetFabricTextWordStyles } from '@/lib/canvas/textStyleHelper';
import { THEME_DEFINITIONS } from '@/lib/themes/definitions';
import { saveAsset, getAsset, getPages, updatePage } from '@/lib/db';
import { CanvasLayerItem, ThemeVariation, DeviceFrameType, ProjectPage, ThemePalette } from '@/types';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function EditorPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen bg-[#080a11] flex flex-col items-center justify-center text-white gap-3" suppressHydrationWarning>
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <span className="text-sm font-semibold tracking-wide">Loading Screenshot Studio...</span>
        </div>
      }
    >
      <EditorPageContent />
    </Suspense>
  );
}

function EditorPageContent() {
  const router = useRouter();
  const routeParams = useParams();
  const projectId = (routeParams?.projectId as string) || '';

  const {
    project,
    pages,
    activePageId,
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
    zoomLevel,
    loadProject,
    setActivePageId,
    setThemeId,
    setVariation,
    setFrame,
    setZoomLevel,
    createPageWithScreenshot,
    duplicatePageById,
    deletePageById,
    updateCurrentPageCanvas,
    setSaveStatus,
  } = useStudioStore();

  const [isLoading, setIsLoading] = useState(true);
  const [activeCanvas, setActiveCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.FabricObject | null>(null);
  const [layers, setLayers] = useState<CanvasLayerItem[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Modals state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isExportZipOpen, setIsExportZipOpen] = useState(false);
  const [deleteScreenTarget, setDeleteScreenTarget] = useState<ProjectPage | null>(null);
  const [isApplyingToAll, setIsApplyingToAll] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const replaceScreenshotInputRef = useRef<HTMLInputElement>(null);
  const batchUploadInputRef = useRef<HTMLInputElement>(null);

  // Show temporary toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load project on mount
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setIsLoading(true);
      const success = await loadProject(projectId);
      if (!success && isMounted) {
        alert('Project not found.');
        router.push('/');
      }
      if (isMounted) setIsLoading(false);
    };
    init();
    return () => {
      isMounted = false;
    };
  }, [projectId, loadProject, router]);

  // Handle Apply Theme to Active Canvas
  const handleApplyTheme = async (themeId: string) => {
    setThemeId(themeId);
    if (!activeCanvas || !project || !activePageId) return;

    const theme = THEME_DEFINITIONS.find((t) => t.id === themeId);
    const targetPalette = theme?.defaultPalette || customPalette;

    const page = pages.find((p) => p.id === activePageId);
    let screenshotUrl: string | undefined;

    if (page?.screenshotAssetId) {
      const asset = await getAsset(page.screenshotAssetId);
      if (asset?.blob) screenshotUrl = await blobToDataURL(asset.blob);
    }

    await buildThemeCanvas(activeCanvas, {
      themeId,
      variation: activeVariation,
      frameType: activeFrame,
      customPalette: targetPalette,
      headingText: page?.headingText || headingText,
      subtitleText: page?.subtitleText || subtitleText,
      screenshotUrl,
      canvasWidth: project.width,
      canvasHeight: project.height,
    });

    // Keep viewport zoom intact
    if (zoomLevel > 0) {
      activeCanvas.setZoom(zoomLevel);
      activeCanvas.setDimensions({
        width: Math.round(project.width * zoomLevel),
        height: Math.round(project.height * zoomLevel),
      });
      activeCanvas.renderAll();
    }

    // Save
    const json = JSON.stringify(activeCanvas.toJSON());
    const thumb = activeCanvas.toDataURL({ format: 'jpeg', multiplier: 0.15, quality: 0.7 });
    await updateCurrentPageCanvas(json, thumb);

    if (useStudioStore.getState().isAutoSyncAll && pages.length > 1) {
      await handleApplyThemeToAll(themeId, targetPalette);
    }
  };

  // Handle Apply Variation
  const handleApplyVariation = async (variation: ThemeVariation) => {
    setVariation(variation);
    if (!activeCanvas || !project || !activePageId) return;

    const page = pages.find((p) => p.id === activePageId);
    let screenshotUrl: string | undefined;

    if (page?.screenshotAssetId) {
      const asset = await getAsset(page.screenshotAssetId);
      if (asset?.blob) screenshotUrl = await blobToDataURL(asset.blob);
    }

    await buildThemeCanvas(activeCanvas, {
      themeId: activeThemeId,
      variation,
      frameType: activeFrame,
      customPalette,
      headingText: page?.headingText || headingText,
      subtitleText: page?.subtitleText || subtitleText,
      screenshotUrl,
      canvasWidth: project.width,
      canvasHeight: project.height,
    });

    if (zoomLevel > 0) {
      activeCanvas.setZoom(zoomLevel);
      activeCanvas.setDimensions({
        width: Math.round(project.width * zoomLevel),
        height: Math.round(project.height * zoomLevel),
      });
      activeCanvas.renderAll();
    }

    const json = JSON.stringify(activeCanvas.toJSON());
    const thumb = activeCanvas.toDataURL({ format: 'jpeg', multiplier: 0.15, quality: 0.7 });
    await updateCurrentPageCanvas(json, thumb);

    if (useStudioStore.getState().isAutoSyncAll && pages.length > 1) {
      await handleApplyThemeToAll();
    }
  };

  // Handle Apply Device Frame
  const handleApplyFrame = async (frame: DeviceFrameType) => {
    setFrame(frame);
    if (!activeCanvas || !project || !activePageId) return;

    const page = pages.find((p) => p.id === activePageId);
    let screenshotUrl: string | undefined;

    if (page?.screenshotAssetId) {
      const asset = await getAsset(page.screenshotAssetId);
      if (asset?.blob) screenshotUrl = await blobToDataURL(asset.blob);
    }

    await buildThemeCanvas(activeCanvas, {
      themeId: activeThemeId,
      variation: activeVariation,
      frameType: frame,
      customPalette,
      headingText: page?.headingText || headingText,
      subtitleText: page?.subtitleText || subtitleText,
      screenshotUrl,
      canvasWidth: project.width,
      canvasHeight: project.height,
    });

    if (zoomLevel > 0) {
      activeCanvas.setZoom(zoomLevel);
      activeCanvas.setDimensions({
        width: Math.round(project.width * zoomLevel),
        height: Math.round(project.height * zoomLevel),
      });
      activeCanvas.renderAll();
    }

    const json = JSON.stringify(activeCanvas.toJSON());
    const thumb = activeCanvas.toDataURL({ format: 'jpeg', multiplier: 0.15, quality: 0.7 });
    await updateCurrentPageCanvas(json, thumb);

    if (useStudioStore.getState().isAutoSyncAll && pages.length > 1) {
      await handleApplyThemeToAll();
    }
  };

  // Handle Palette Custom Color Updates
  const handleUpdatePalette = async (paletteUpdates: Partial<ThemePalette>) => {
    setCustomPalette(paletteUpdates);
    if (!activeCanvas || !project || !activePageId) return;

    const newPalette = { ...customPalette, ...paletteUpdates };

    const page = pages.find((p) => p.id === activePageId);
    let screenshotUrl: string | undefined;

    if (page?.screenshotAssetId) {
      const asset = await getAsset(page.screenshotAssetId);
      if (asset?.blob) screenshotUrl = await blobToDataURL(asset.blob);
    }

    await buildThemeCanvas(activeCanvas, {
      themeId: activeThemeId,
      variation: activeVariation,
      frameType: activeFrame,
      customPalette: newPalette,
      headingText: page?.headingText || headingText,
      subtitleText: page?.subtitleText || subtitleText,
      screenshotUrl,
      canvasWidth: project.width,
      canvasHeight: project.height,
    });

    if (zoomLevel > 0) {
      activeCanvas.setZoom(zoomLevel);
      activeCanvas.setDimensions({
        width: Math.round(project.width * zoomLevel),
        height: Math.round(project.height * zoomLevel),
      });
      activeCanvas.renderAll();
    }

    queueCanvasUpdate(activeCanvas);
  };

  // APPLY THEME TO ALL PAGES (PRD Section 14)
  const handleApplyThemeToAll = async (themeIdOverride?: string, paletteOverride?: ThemePalette) => {
    if (!project || pages.length === 0) return;
    setIsApplyingToAll(true);

    try {
      const offscreenEl = document.createElement('canvas');
      offscreenEl.width = project.width;
      offscreenEl.height = project.height;

      const offscreenCanvas = new fabric.Canvas(offscreenEl, {
        width: project.width,
        height: project.height,
      });

      const store = useStudioStore.getState();
      const currentThemeId = themeIdOverride || store.activeThemeId;
      const currentPalette = paletteOverride || store.customPalette;
      const currentVariation = store.activeVariation;
      const currentFrame = store.activeFrame;

      for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        let screenshotUrl: string | undefined;

        if (p.screenshotAssetId) {
          const asset = await getAsset(p.screenshotAssetId);
          if (asset?.blob) screenshotUrl = await blobToDataURL(asset.blob);
        }

        await buildThemeCanvas(offscreenCanvas, {
          themeId: currentThemeId,
          variation: currentVariation,
          frameType: currentFrame,
          customPalette: currentPalette,
          headingText: p.headingText || headingText,
          subtitleText: p.subtitleText || subtitleText,
          screenshotUrl,
          canvasWidth: project.width,
          canvasHeight: project.height,
        });

        const json = JSON.stringify(offscreenCanvas.toJSON());
        const thumb = offscreenCanvas.toDataURL({ format: 'jpeg', multiplier: 0.15, quality: 0.7 });

        await updatePage(p.id, {
          canvasJSON: json,
          thumbnailDataUrl: thumb,
        });

        // Also update active canvas if this is the active page
        if (p.id === activePageId && activeCanvas) {
          await activeCanvas.loadFromJSON(json);
          activeCanvas.renderAll();
        }
      }

      offscreenCanvas.dispose();

      // Refresh pages in store
      const refreshed = await getPages(project.id);
      useStudioStore.setState({ pages: refreshed });

      showToast(`Applied theme to all ${pages.length} screens!`);
    } catch (err) {
      console.error('Error applying theme to all:', err);
      showToast('Failed to sync theme across screens');
    } finally {
      setIsApplyingToAll(false);
    }
  };

  // REPLACE SCREENSHOT (PRD Section 54)
  const handleReplaceScreenshotFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project || !activePageId || !activeCanvas) return;

    try {
      const dataUrl = await blobToDataURL(file);
      const asset = await saveAsset({
        projectId: project.id,
        name: file.name,
        blob: file,
        mimeType: file.type,
      });

      await updatePage(activePageId, { screenshotAssetId: asset.id });

      // Update in store
      useStudioStore.setState((state) => ({
        pages: state.pages.map((p) =>
          p.id === activePageId ? { ...p, screenshotAssetId: asset.id } : p
        ),
      }));

      // Rebuild canvas
      const page = pages.find((p) => p.id === activePageId);

      await buildThemeCanvas(activeCanvas, {
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

      if (zoomLevel > 0) {
        activeCanvas.setZoom(zoomLevel);
        activeCanvas.setDimensions({
          width: Math.round(project.width * zoomLevel),
          height: Math.round(project.height * zoomLevel),
        });
        activeCanvas.renderAll();
      }

      const json = JSON.stringify(activeCanvas.toJSON());
      const thumb = activeCanvas.toDataURL({ format: 'jpeg', multiplier: 0.15, quality: 0.7 });
      await updateCurrentPageCanvas(json, thumb);

      showToast('Screenshot loaded into phone frame!');
    } catch (err) {
      console.error('Replace screenshot error:', err);
      alert('Failed to replace screenshot.');
    } finally {
      if (replaceScreenshotInputRef.current) replaceScreenshotInputRef.current.value = '';
    }
  };

  // BATCH UPLOAD SCREENSHOTS (PRD Section 11-13)
  const handleBatchUpload = async (files: File[]) => {
    if (!project) return;
    setIsLoading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const asset = await saveAsset({
          projectId: project.id,
          name: file.name,
          blob: file,
          mimeType: file.type,
        });

        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

        await createPageWithScreenshot({
          name: `${cleanName}`,
          screenshotAssetId: asset.id,
          headingText: cleanName.toUpperCase(),
          subtitleText: 'Fast, secure, and built for high performance',
        });
      }

      showToast(`Created ${files.length} new screenshot pages!`);
    } catch (err) {
      console.error('Batch upload error:', err);
      alert('Batch upload failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Layer Operations
  const handleSelectLayer = (id: string) => {
    if (!activeCanvas) return;
    const obj = activeCanvas.getObjects().find((o: any) => o.id === id);
    if (obj) {
      activeCanvas.setActiveObject(obj);
      activeCanvas.renderAll();
      setSelectedObject(obj);
    }
  };

  const handleToggleLayerVisibility = (id: string) => {
    if (!activeCanvas) return;
    const obj = activeCanvas.getObjects().find((o: any) => o.id === id);
    if (obj) {
      obj.visible = !obj.visible;
      activeCanvas.renderAll();
      setLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
      );
      queueCanvasUpdate(activeCanvas);
    }
  };

  const handleToggleLayerLock = (id: string) => {
    if (!activeCanvas) return;
    const obj = activeCanvas.getObjects().find((o: any) => o.id === id);
    if (obj) {
      const isLocked = !obj.lockMovementX;
      obj.set({
        lockMovementX: isLocked,
        lockMovementY: isLocked,
        lockRotation: isLocked,
        lockScalingX: isLocked,
        lockScalingY: isLocked,
      });
      activeCanvas.renderAll();
      setLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, locked: isLocked } : l))
      );
      queueCanvasUpdate(activeCanvas);
    }
  };

  const handleDeleteLayer = (id: string) => {
    if (!activeCanvas) return;
    const obj = activeCanvas.getObjects().find((o: any) => o.id === id);
    if (obj && (obj as any).dataTag !== 'background') {
      activeCanvas.remove(obj);
      activeCanvas.discardActiveObject();
      activeCanvas.renderAll();
      setSelectedObject(null);
      setLayers((prev) => prev.filter((l) => l.id !== id));
      queueCanvasUpdate(activeCanvas);
      showToast('Layer deleted');
    }
  };

  // Debounced real-time canvas save & filmstrip thumbnail sync
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queueCanvasUpdate = (canvas: fabric.Canvas) => {
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const json = JSON.stringify(canvas.toJSON());
        const thumb = canvas.toDataURL({ format: 'jpeg', multiplier: 0.15, quality: 0.7 });
        await updateCurrentPageCanvas(json, thumb);
      } catch (err) {
        console.error('Queue canvas update error:', err);
      }
    }, 350);
  };

  // Handle live text updates (heading, subtitle, badge)
  const handleUpdateTextContent = (type: 'heading' | 'subtitle' | 'badge', text: string) => {
    if (!activeCanvas) return;

    if (type === 'heading') {
      setHeadingText(text);
      const headingObj = activeCanvas.getObjects().find((o: any) => o.dataTag === 'heading');
      if (headingObj) {
        (headingObj as any).set({ text });
        (headingObj as any).initDimensions?.();
        activeCanvas.renderAll();
        queueCanvasUpdate(activeCanvas);
      }
    } else if (type === 'subtitle') {
      setSubtitleText(text);
      const subtitleObj = activeCanvas.getObjects().find((o: any) => o.dataTag === 'subtitle');
      if (subtitleObj) {
        if (!text || text.trim() === '') {
          activeCanvas.remove(subtitleObj);
        } else {
          (subtitleObj as any).set({ text });
          (subtitleObj as any).initDimensions?.();
        }
        activeCanvas.renderAll();
        queueCanvasUpdate(activeCanvas);
      } else if (text && text.trim().length > 0) {
        const W = project?.width || 1080;
        const H = project?.height || 1920;
        let subtitleY = H * 0.175;
        let subtitleLeft = W / 2;
        let subtitleWidth = W * 0.82;
        let subtitleAlign: 'left' | 'center' | 'right' = 'center';
        let subtitleOriginX = 'center';

        if (activeVariation === 'screenshot_heading') subtitleY = H * 0.86;
        else if (activeVariation === 'centered_screenshot') subtitleY = H * 0.90;
        else if (activeVariation === 'hero_screenshot') subtitleY = H * 0.135;
        else if (activeVariation === 'bottom_peek_bleed') subtitleY = H * 0.195;
        else if (activeVariation === 'minimal_editorial_left') {
          subtitleY = H * 0.19;
          subtitleLeft = W * 0.08;
          subtitleWidth = W * 0.84;
          subtitleAlign = 'left';
          subtitleOriginX = 'left';
        } else if (activeVariation === 'compact_double_glow') subtitleY = H * 0.19;

        const subtitleFontSize = Math.round(W * 0.034);
        const newSubtitle = new fabric.Textbox(text.trim(), {
          left: subtitleLeft,
          top: subtitleY,
          originX: subtitleOriginX as any,
          originY: 'top',
          width: subtitleWidth,
          fontSize: subtitleFontSize,
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: '500',
          fill: customPalette.subtitle || '#94a3b8',
          textAlign: subtitleAlign,
          lineHeight: 1.35,
          cursorColor: customPalette.accent || '#6366f1',
          cursorWidth: 3,
          cursorDuration: 550,
          editingBorderColor: '#6366f1',
          selectionColor: 'rgba(99, 102, 241, 0.35)',
          objectCaching: false,
          splitByGrapheme: false,
          shadow: new fabric.Shadow({
            color: 'rgba(0, 0, 0, 0.35)',
            blur: 10,
            offsetX: 0,
            offsetY: 2,
          }),
        });
        (newSubtitle as any).dataTag = 'subtitle';
        (newSubtitle as any).name = 'Subtitle';
        activeCanvas.add(newSubtitle);
        activeCanvas.renderAll();
        queueCanvasUpdate(activeCanvas);
      }
    } else if (type === 'badge') {
      setBadgeText(text);
      const badgeGroup = activeCanvas.getObjects().find((o: any) => o.dataTag === 'badge');
      if (badgeGroup && (badgeGroup as any)._objects) {
        const badgeFabricText = (badgeGroup as any)._objects.find(
          (o: any) => o instanceof fabric.FabricText || o instanceof fabric.Textbox || (o as any).dataTag === 'badge-text'
        );
        const badgeBg = (badgeGroup as any)._objects.find(
          (o: any) => o instanceof fabric.Rect || (o as any).dataTag === 'badge-bg'
        );
        if (badgeFabricText && badgeBg) {
          badgeFabricText.set({ text });
          const padX = Math.round((project?.width || 1080) * 0.032);
          const newW = (badgeFabricText.width || 120) + padX * 2;
          badgeBg.set({ width: newW, rx: badgeBg.height / 2, ry: badgeBg.height / 2 });
          (badgeGroup as any).set({ width: newW });
          activeCanvas.centerObjectH(badgeGroup);
          activeCanvas.renderAll();
          queueCanvasUpdate(activeCanvas);
        }
      }
    }
  };

  // Handle per-word rich color updates
  const handleUpdateWordColor = (
    type: 'heading' | 'subtitle' | 'badge',
    wordIndex: number,
    color: string
  ) => {
    if (!activeCanvas) return;
    let targetObj: any = null;

    if (type === 'heading') {
      targetObj = activeCanvas.getObjects().find((o: any) => o.dataTag === 'heading');
    } else if (type === 'subtitle') {
      targetObj = activeCanvas.getObjects().find((o: any) => o.dataTag === 'subtitle');
    } else if (type === 'badge') {
      const badgeGroup = activeCanvas.getObjects().find((o: any) => o.dataTag === 'badge');
      if (badgeGroup && (badgeGroup as any)._objects) {
        targetObj = (badgeGroup as any)._objects.find(
          (o: any) => o instanceof fabric.FabricText || o instanceof fabric.Textbox || (o as any).dataTag === 'badge-text'
        );
      }
    }

    if (targetObj) {
      applyWordColorToFabricText(targetObj, wordIndex, color);
      activeCanvas.renderAll();
      queueCanvasUpdate(activeCanvas);
    }
  };

  const handleResetWordStyles = (
    type: 'heading' | 'subtitle' | 'badge',
    uniformColor?: string
  ) => {
    if (!activeCanvas) return;
    let targetObj: any = null;

    if (type === 'heading') {
      targetObj = activeCanvas.getObjects().find((o: any) => o.dataTag === 'heading');
    } else if (type === 'subtitle') {
      targetObj = activeCanvas.getObjects().find((o: any) => o.dataTag === 'subtitle');
    }

    if (targetObj) {
      resetFabricTextWordStyles(targetObj, uniformColor);
      activeCanvas.renderAll();
      queueCanvasUpdate(activeCanvas);
    }
  };

  // Update Active Object Properties
  const handleUpdateObject = (props: Record<string, any>) => {
    if (!activeCanvas) return;

    if (props.type === 'sync_heading') {
      const headingObj = activeCanvas.getObjects().find((o: any) => o.dataTag === 'heading');
      if (headingObj) {
        (headingObj as any).set({ text: props.text });
        (headingObj as any).initDimensions?.();
        activeCanvas.renderAll();
        queueCanvasUpdate(activeCanvas);
      }
      return;
    }

    if (props.type === 'sync_subtitle') {
      const subtitleObj = activeCanvas.getObjects().find((o: any) => o.dataTag === 'subtitle');
      if (subtitleObj) {
        (subtitleObj as any).set({ text: props.text });
        (subtitleObj as any).initDimensions?.();
        activeCanvas.renderAll();
        queueCanvasUpdate(activeCanvas);
      }
      return;
    }

    if (props.type === 'sync_badge') {
      handleUpdateTextContent('badge', props.text);
      return;
    }

    if (selectedObject) {
      selectedObject.set(props);
      if (props.text !== undefined) {
        (selectedObject as any).initDimensions?.();
      }
      activeCanvas.renderAll();
      queueCanvasUpdate(activeCanvas);
    }
  };

  // Alignments
  const handleCenterObject = (direction: 'horizontal' | 'vertical' | 'both') => {
    if (!activeCanvas || !selectedObject) return;
    if (direction === 'horizontal' || direction === 'both') {
      activeCanvas.centerObjectH(selectedObject);
    }
    if (direction === 'vertical' || direction === 'both') {
      activeCanvas.centerObjectV(selectedObject);
    }
    activeCanvas.renderAll();
    queueCanvasUpdate(activeCanvas);
  };

  const handleFitObject = () => {
    if (!activeCanvas || !selectedObject || !project) return;
    const targetW = project.width * 0.85;
    const scale = targetW / (selectedObject.width || 800);
    selectedObject.set({
      scaleX: scale,
      scaleY: scale,
      left: project.width / 2,
    });
    activeCanvas.centerObjectH(selectedObject);
    activeCanvas.renderAll();
    queueCanvasUpdate(activeCanvas);
  };

  const handleResetObject = () => {
    if (!activeCanvas || !selectedObject) return;
    selectedObject.set({
      angle: 0,
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
    });
    activeCanvas.renderAll();
    queueCanvasUpdate(activeCanvas);
  };

  // Clear Screenshot / Revert to mockup
  const handleClearScreenshot = async () => {
    if (!activeCanvas || !project || !activePageId) return;
    try {
      await updatePage(activePageId, { screenshotAssetId: undefined });
      useStudioStore.setState((state) => ({
        pages: state.pages.map((p) =>
          p.id === activePageId ? { ...p, screenshotAssetId: undefined } : p
        ),
      }));

      const page = pages.find((p) => p.id === activePageId);
      await buildThemeCanvas(activeCanvas, {
        themeId: activeThemeId,
        variation: activeVariation,
        frameType: activeFrame,
        customPalette,
        headingText: page?.headingText || headingText,
        subtitleText: page?.subtitleText || subtitleText,
        screenshotUrl: undefined,
        canvasWidth: project.width,
        canvasHeight: project.height,
      });

      if (zoomLevel > 0) {
        activeCanvas.setZoom(zoomLevel);
        activeCanvas.setDimensions({
          width: Math.round(project.width * zoomLevel),
          height: Math.round(project.height * zoomLevel),
        });
        activeCanvas.renderAll();
      }

      const json = JSON.stringify(activeCanvas.toJSON());
      const thumb = activeCanvas.toDataURL({ format: 'jpeg', multiplier: 0.15, quality: 0.7 });
      await updateCurrentPageCanvas(json, thumb);
      showToast('Cleared screenshot image');
    } catch (e) {
      console.error(e);
    }
  };

  // Delete Selected Object / Image
  const handleDeleteSelectedObject = () => {
    if (!activeCanvas || !selectedObject) return;
    if ((selectedObject as any).dataTag === 'background') return;

    const id = (selectedObject as any).id;
    activeCanvas.remove(selectedObject);
    activeCanvas.discardActiveObject();
    activeCanvas.renderAll();
    setSelectedObject(null);

    if (id) {
      setLayers((prev) => prev.filter((l) => l.id !== id));
    }

    const json = JSON.stringify(activeCanvas.toJSON());
    const thumb = activeCanvas.toDataURL({ format: 'jpeg', multiplier: 0.15, quality: 0.7 });
    updateCurrentPageCanvas(json, thumb);
    showToast('Deleted object from canvas');
  };

  // Duplicate Current Screen
  const handleDuplicateCurrentScreen = async () => {
    if (!activePageId) return;
    const dup = await duplicatePageById(activePageId);
    if (dup) {
      showToast('Screen duplicated!');
    }
  };

  const activePage = pages.find((p) => p.id === activePageId) || null;

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-[#080a11] flex flex-col items-center justify-center text-white gap-3" suppressHydrationWarning>
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-sm font-semibold tracking-wide">Loading Screenshot Studio...</span>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#080a11] flex flex-col overflow-hidden text-slate-100" suppressHydrationWarning>
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={replaceScreenshotInputRef}
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleReplaceScreenshotFile}
      />
      <input
        type="file"
        ref={batchUploadInputRef}
        multiple
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleBatchUpload(Array.from(e.target.files));
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <EditorNavbar
        onUploadClick={() => batchUploadInputRef.current?.click()}
        onApplyThemeToAll={handleApplyThemeToAll}
        onExportClick={() => setIsExportOpen(true)}
        onExportZipClick={() => setIsExportZipOpen(true)}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={() => {}}
        onRedo={() => {}}
        onZoomFit={() => setZoomLevel(0.4)}
        onZoomIn={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))}
        onZoomOut={() => setZoomLevel(Math.max(0.2, zoomLevel - 0.1))}
      />

      {/* Main Studio Workspace (Left Sidebar + Center Canvas + Right Inspector) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <LeftSidebar
          layers={layers}
          onSelectLayer={handleSelectLayer}
          onToggleLayerVisibility={handleToggleLayerVisibility}
          onToggleLayerLock={handleToggleLayerLock}
          onDeleteLayer={handleDeleteLayer}
          onApplyTheme={handleApplyTheme}
          onApplyVariation={handleApplyVariation}
          onApplyFrame={handleApplyFrame}
          onUpdatePalette={handleUpdatePalette}
          onApplyPaletteToAll={(palette) => handleApplyThemeToAll(undefined, palette)}
          onUpdateTextContent={handleUpdateTextContent}
          onUpdateWordColor={handleUpdateWordColor}
          onResetWordStyles={handleResetWordStyles}
          onUploadScreenshot={() => replaceScreenshotInputRef.current?.click()}
          onBatchUpload={() => batchUploadInputRef.current?.click()}
          onClearScreenshot={handleClearScreenshot}
        />

        {/* Center Canvas */}
        <CanvasWorkspace
          onCanvasReady={(c) => setActiveCanvas(c)}
          onSelectionChange={(obj) => setSelectedObject(obj)}
          onLayersChange={(newLayers) => setLayers(newLayers)}
          onHistoryChange={(undo, redo) => {
            setCanUndo(undo);
            setCanRedo(redo);
          }}
          onTriggerExport={() => setIsExportOpen(true)}
        />

        {/* Right Properties Inspector */}
        <PropertiesPanel
          activeObject={selectedObject}
          onUpdateObject={handleUpdateObject}
          onReplaceScreenshot={() => replaceScreenshotInputRef.current?.click()}
          onClearScreenshot={handleClearScreenshot}
          onDeleteSelectedObject={handleDeleteSelectedObject}
          onDeleteCurrentScreen={() => {
            if (activePage && pages.length > 1) {
              setDeleteScreenTarget(activePage);
            }
          }}
          onDuplicateCurrentScreen={handleDuplicateCurrentScreen}
          onCenterObject={handleCenterObject}
          onFitObject={handleFitObject}
          onResetObject={handleResetObject}
        />
      </div>

      {/* Bottom Page Navigator */}
      <BottomNavigator
        onPageSelect={(id) => setActivePageId(id)}
        onAddPage={async () => {
          await createPageWithScreenshot({
            name: `${String(pages.length + 1).padStart(2, '0')} Screen`,
          });
        }}
        onBatchUpload={handleBatchUpload}
      />

      {/* Export Single Image Dialog */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        canvas={activeCanvas}
        project={project}
        activePage={activePage}
      />

      {/* Export ZIP Dialog */}
      <ExportZipModal
        isOpen={isExportZipOpen}
        onClose={() => setIsExportZipOpen(false)}
        project={project}
        pages={pages}
        activeThemeId={activeThemeId}
      />

      {/* Delete Screen Modal from Properties Panel */}
      <ConfirmDeleteModal
        isOpen={!!deleteScreenTarget}
        title="Delete Screenshot Screen?"
        message={`Are you sure you want to delete "${deleteScreenTarget?.name}"? This screen will be permanently removed.`}
        onClose={() => setDeleteScreenTarget(null)}
        onConfirm={async () => {
          if (deleteScreenTarget) {
            await deletePageById(deleteScreenTarget.id);
            setDeleteScreenTarget(null);
            showToast('Screen deleted');
          }
        }}
      />
    </div>
  );
}

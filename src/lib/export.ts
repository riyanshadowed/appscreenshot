import * as fabric from 'fabric';
import JSZip from 'jszip';
import { Project, ProjectPage, ExportOptions } from '@/types';
import { getAsset } from './db';
import { buildThemeCanvas } from './canvas/themeRenderer';
import { THEME_DEFINITIONS } from './themes/definitions';

// Sanitize string for clean filenames
export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'screenshot';
}

// Download blob directly in browser
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// Convert Blob/File to base64 Data URL (never expires, persists inside Fabric JSON)
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Export single canvas with multiplier & format
export async function exportCanvasImage(
  canvas: fabric.Canvas,
  options: ExportOptions,
  filename: string
): Promise<void> {
  const format = options.format === 'png' ? 'png' : options.format === 'jpeg' ? 'jpeg' : 'webp';
  
  const dataUrl = canvas.toDataURL({
    format,
    multiplier: options.resolution || 1,
    quality: options.quality || 0.92,
  });

  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const ext = format === 'jpeg' ? 'jpg' : format;
  downloadBlob(blob, `${filename}.${ext}`);
}

// Render a specific page to Blob with optional custom target dimensions
export async function renderPageToBlob(
  project: Project,
  page: ProjectPage,
  options: ExportOptions,
  activeThemeId = 'dark_premium',
  customSize?: { width: number; height: number }
): Promise<Blob> {
  const targetW = customSize?.width || project.width;
  const targetH = customSize?.height || project.height;

  const tempCanvasEl = document.createElement('canvas');
  tempCanvasEl.width = targetW;
  tempCanvasEl.height = targetH;

  const tempCanvas = new fabric.Canvas(tempCanvasEl, {
    width: targetW,
    height: targetH,
    enableRetinaScaling: false,
  });

  let screenshotUrl: string | undefined;
  if (page.screenshotAssetId) {
    const asset = await getAsset(page.screenshotAssetId);
    if (asset && asset.blob) {
      screenshotUrl = URL.createObjectURL(asset.blob);
    }
  }

  try {
    // Check if custom variant exists for the target dimensions
    if (
      customSize?.width === 1200 &&
      page.variants?.tablet_7?.isCustomized &&
      page.variants?.tablet_7?.canvasJSON
    ) {
      await tempCanvas.loadFromJSON(page.variants.tablet_7.canvasJSON);
      tempCanvas.renderAll();
    } else if (
      customSize?.width === 1536 &&
      page.variants?.tablet_10?.isCustomized &&
      page.variants?.tablet_10?.canvasJSON
    ) {
      await tempCanvas.loadFromJSON(page.variants.tablet_10.canvasJSON);
      tempCanvas.renderAll();
    } else if (page.canvasJSON && page.canvasJSON.length > 20 && !customSize) {
      await tempCanvas.loadFromJSON(page.canvasJSON);
      tempCanvas.renderAll();
    } else {
      const isTablet = customSize?.width && customSize.width > 1100;
      await buildThemeCanvas(tempCanvas, {
        themeId: page.themeId || activeThemeId,
        variation: page.variation || 'heading_screenshot',
        frameType: isTablet ? 'tablet' : (page.frameType || 'phone'),
        headingText: page.headingText || 'Manage Your Business',
        subtitleText: page.subtitleText !== undefined ? page.subtitleText : 'Everything you need in one powerful place',
        badgeText: page.badgeText,
        screenshotUrl,
        canvasWidth: targetW,
        canvasHeight: targetH,
      });
    }

    const format = options.format === 'png' ? 'png' : options.format === 'jpeg' ? 'jpeg' : 'webp';
    const dataUrl = tempCanvas.toDataURL({
      format,
      multiplier: options.resolution || 1,
      quality: options.quality || 0.92,
    });

    const response = await fetch(dataUrl);
    return await response.blob();
  } finally {
    if (screenshotUrl) {
      URL.revokeObjectURL(screenshotUrl);
    }
    tempCanvas.dispose();
  }
}

// Export All Pages as a local ZIP file
export async function exportAllPagesAsZip(
  project: Project,
  pages: ProjectPage[],
  options: ExportOptions,
  activeThemeId = 'dark_premium',
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const zip = new JSZip();
  const ext = options.format === 'jpeg' ? 'jpg' : options.format;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (onProgress) onProgress(i + 1, pages.length);

    const blob = await renderPageToBlob(project, page, options, activeThemeId);
    const indexStr = String(i + 1).padStart(2, '0');
    const sanitizedTitle = sanitizeFilename(page.name || `screen-${i + 1}`);
    const filename = `${indexStr}-${sanitizedTitle}.${ext}`;

    zip.file(filename, blob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const projectSlug = sanitizeFilename(project.name || 'play-store');
  downloadBlob(zipBlob, `${projectSlug}-screenshots.zip`);
}

// Export Complete Google Play Store Multi-Size Bundle (Phone + 7" Tablet + 10" Tablet)
export async function exportPlayStoreBundle(
  project: Project,
  pages: ProjectPage[],
  options: ExportOptions,
  activeThemeId = 'dark_premium',
  onProgress?: (step: string, percent: number) => void
): Promise<void> {
  const zip = new JSZip();
  const ext = options.format === 'jpeg' ? 'jpg' : options.format;

  const TARGET_SIZES = [
    { folder: '01_Phone_1080x1920', width: 1080, height: 1920, label: '📱 Phone' },
    { folder: '02_Tablet_7inch_1200x1920', width: 1200, height: 1920, label: '📲 7-inch Tablet' },
    { folder: '03_Tablet_10inch_1536x2048', width: 1536, height: 2048, label: '📲 10-inch Tablet' },
  ];

  const totalSteps = TARGET_SIZES.length * pages.length;
  let currentStep = 0;

  for (const size of TARGET_SIZES) {
    const subfolder = zip.folder(size.folder);

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      currentStep++;
      if (onProgress) {
        const percent = Math.round((currentStep / totalSteps) * 100);
        onProgress(`Rendering ${size.label} screen ${i + 1} of ${pages.length}...`, percent);
      }

      const blob = await renderPageToBlob(
        project,
        page,
        options,
        activeThemeId,
        { width: size.width, height: size.height }
      );

      const indexStr = String(i + 1).padStart(2, '0');
      const sanitizedTitle = sanitizeFilename(page.name || `screen-${i + 1}`);
      const filename = `${indexStr}-${sanitizedTitle}.${ext}`;

      subfolder?.file(filename, blob);
    }
  }

  if (onProgress) onProgress('Compressing complete Play Store bundle ZIP...', 95);
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const projectSlug = sanitizeFilename(project.name || 'play-store');
  downloadBlob(zipBlob, `${projectSlug}-GooglePlayStore-Bundle.zip`);
}

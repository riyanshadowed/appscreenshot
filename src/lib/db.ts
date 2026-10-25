import Dexie, { type Table } from 'dexie';
import JSZip from 'jszip';
import { Project, ProjectPage, Asset, AppSetting, ThemePalette, ThemeVariation, DeviceFrameType } from '@/types';

export class ScreenshotStudioDB extends Dexie {
  projects!: Table<Project, string>;
  pages!: Table<ProjectPage, string>;
  assets!: Table<Asset, string>;
  settings!: Table<AppSetting, string>;

  constructor() {
    super('ScreenshotStudioDB');
    this.version(1).stores({
      projects: 'id, name, createdAt, updatedAt',
      pages: 'id, projectId, order',
      assets: 'id, projectId, createdAt',
      settings: 'key',
    });
  }
}

// Client-safe DB instance
let dbInstance: ScreenshotStudioDB | null = null;

export function getDB(): ScreenshotStudioDB {
  if (typeof window === 'undefined') {
    // SSR fallback dummy or null
    return null as unknown as ScreenshotStudioDB;
  }
  if (!dbInstance) {
    dbInstance = new ScreenshotStudioDB();
  }
  return dbInstance;
}

// Utility to generate unique IDs
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Projects operations
export async function getAllProjects(): Promise<Project[]> {
  const db = getDB();
  if (!db) return [];
  return await db.projects.orderBy('updatedAt').reverse().toArray();
}

export async function getProject(id: string): Promise<Project | undefined> {
  const db = getDB();
  if (!db) return undefined;
  return await db.projects.get(id);
}

export async function createProject(params: {
  name?: string;
  width?: number;
  height?: number;
  activePageId?: string;
  themeId?: string;
  palette?: ThemePalette;
  variation?: ThemeVariation;
  frameType?: DeviceFrameType;
  headingText?: string;
  subtitleText?: string;
  badgeText?: string;
}): Promise<Project> {
  const db = getDB();
  if (!db) throw new Error('Database not initialized');

  const projectId = generateId('proj');
  const now = Date.now();
  const pageId = params.activePageId || generateId('page');

  const project: Project = {
    id: projectId,
    name: params.name || 'Untitled Project',
    width: params.width || 1080,
    height: params.height || 1920,
    createdAt: now,
    updatedAt: now,
    activePageId: pageId,
  };

  await db.transaction('rw', db.projects, db.pages, async () => {
    await db.projects.add(project);
    // Create initial page
    const initialPage: ProjectPage = {
      id: pageId,
      projectId: projectId,
      name: '01 Screen',
      canvasJSON: '',
      order: 0,
      themeId: params.themeId || 'dark_premium',
      customPalette: params.palette,
      variation: params.variation || 'heading_screenshot',
      frameType: params.frameType || 'phone',
      headingText: params.headingText || 'Manage Your Business',
      subtitleText: params.subtitleText !== undefined ? params.subtitleText : 'Everything you need in one powerful place',
      badgeText: params.badgeText,
    };
    await db.pages.add(initialPage);
  });

  return project;
}

export async function updateProject(
  id: string,
  updates: Partial<Project>
): Promise<void> {
  const db = getDB();
  if (!db) return;
  await db.projects.update(id, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deleteProject(id: string): Promise<void> {
  const db = getDB();
  if (!db) return;
  await db.transaction('rw', db.projects, db.pages, db.assets, async () => {
    await db.projects.delete(id);
    await db.pages.where('projectId').equals(id).delete();
    await db.assets.where('projectId').equals(id).delete();
  });
}

export async function duplicateProject(id: string): Promise<Project> {
  const db = getDB();
  if (!db) throw new Error('Database not initialized');

  const original = await db.projects.get(id);
  if (!original) throw new Error('Original project not found');

  const originalPages = await db.pages.where('projectId').equals(id).sortBy('order');
  const originalAssets = await db.assets.where('projectId').equals(id).toArray();

  const newProjectId = generateId('proj');
  const now = Date.now();
  const assetIdMap = new Map<string, string>();

  return await db.transaction('rw', db.projects, db.pages, db.assets, async () => {
    // Duplicate assets
    for (const asset of originalAssets) {
      const newAssetId = generateId('asset');
      assetIdMap.set(asset.id, newAssetId);
      await db.assets.add({
        ...asset,
        id: newAssetId,
        projectId: newProjectId,
        createdAt: now,
      });
    }

    // Duplicate pages
    let newActivePageId = '';
    for (let i = 0; i < originalPages.length; i++) {
      const p = originalPages[i];
      const newPageId = generateId('page');
      if (i === 0 || p.id === original.activePageId) {
        newActivePageId = newPageId;
      }
      
      let canvasJSON = p.canvasJSON;
      // Remap asset references inside canvasJSON if any
      assetIdMap.forEach((newId, oldId) => {
        canvasJSON = canvasJSON.replaceAll(oldId, newId);
      });

      await db.pages.add({
        ...p,
        id: newPageId,
        projectId: newProjectId,
        canvasJSON,
        screenshotAssetId: p.screenshotAssetId ? assetIdMap.get(p.screenshotAssetId) : undefined,
      });
    }

    const newProject: Project = {
      ...original,
      id: newProjectId,
      name: `${original.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
      activePageId: newActivePageId || generateId('page'),
    };

    await db.projects.add(newProject);
    return newProject;
  });
}

// Pages operations
export async function getPages(projectId: string): Promise<ProjectPage[]> {
  const db = getDB();
  if (!db) return [];
  return await db.pages.where('projectId').equals(projectId).sortBy('order');
}

export async function getPage(id: string): Promise<ProjectPage | undefined> {
  const db = getDB();
  if (!db) return undefined;
  return await db.pages.get(id);
}

export async function createPage(params: {
  projectId: string;
  name?: string;
  canvasJSON?: string;
  screenshotAssetId?: string;
  thumbnailDataUrl?: string;
  headingText?: string;
  subtitleText?: string;
}): Promise<ProjectPage> {
  const db = getDB();
  if (!db) throw new Error('Database not initialized');

  const existingPages = await db.pages.where('projectId').equals(params.projectId).sortBy('order');
  const pageIndex = existingPages.length + 1;
  const pageId = generateId('page');

  const newPage: ProjectPage = {
    id: pageId,
    projectId: params.projectId,
    name: params.name || `${String(pageIndex).padStart(2, '0')} Screen`,
    canvasJSON: params.canvasJSON || '',
    order: existingPages.length,
    screenshotAssetId: params.screenshotAssetId,
    thumbnailDataUrl: params.thumbnailDataUrl,
    headingText: params.headingText || 'Smart & Intuitive Experience',
    subtitleText: params.subtitleText || 'Designed for high productivity and focus',
  };

  await db.pages.add(newPage);
  await db.projects.update(params.projectId, { updatedAt: Date.now() });

  return newPage;
}

export async function updatePage(id: string, updates: Partial<ProjectPage>): Promise<void> {
  const db = getDB();
  if (!db) return;
  await db.pages.update(id, updates);
  const page = await db.pages.get(id);
  if (page) {
    await db.projects.update(page.projectId, { updatedAt: Date.now() });
  }
}

export async function deletePage(id: string): Promise<void> {
  const db = getDB();
  if (!db) return;
  const page = await db.pages.get(id);
  if (!page) return;

  await db.transaction('rw', db.pages, db.projects, async () => {
    await db.pages.delete(id);
    const remaining = await db.pages.where('projectId').equals(page.projectId).sortBy('order');
    // Reorder remaining pages
    for (let i = 0; i < remaining.length; i++) {
      if (remaining[i].order !== i) {
        await db.pages.update(remaining[i].id, { order: i });
      }
    }
    // Update activePageId if needed
    const project = await db.projects.get(page.projectId);
    if (project && project.activePageId === id) {
      const nextActiveId = remaining[0]?.id || '';
      await db.projects.update(page.projectId, {
        activePageId: nextActiveId,
        updatedAt: Date.now(),
      });
    }
  });
}

export async function duplicatePage(pageId: string): Promise<ProjectPage> {
  const db = getDB();
  if (!db) throw new Error('Database not initialized');
  const original = await db.pages.get(pageId);
  if (!original) throw new Error('Page not found');

  const existingPages = await db.pages.where('projectId').equals(original.projectId).sortBy('order');
  const newPageId = generateId('page');
  const newOrder = original.order + 1;

  // Shift orders of subsequent pages
  await db.transaction('rw', db.pages, db.projects, async () => {
    for (const p of existingPages) {
      if (p.order >= newOrder) {
        await db.pages.update(p.id, { order: p.order + 1 });
      }
    }

    const newPage: ProjectPage = {
      ...original,
      id: newPageId,
      name: `${original.name} (Copy)`,
      order: newOrder,
    };

    await db.pages.add(newPage);
    await db.projects.update(original.projectId, {
      activePageId: newPageId,
      updatedAt: Date.now(),
    });
  });

  const created = await db.pages.get(newPageId);
  return created!;
}

export async function reorderPages(projectId: string, pageIds: string[]): Promise<void> {
  const db = getDB();
  if (!db) return;
  await db.transaction('rw', db.pages, async () => {
    for (let i = 0; i < pageIds.length; i++) {
      await db.pages.update(pageIds[i], { order: i });
    }
  });
}

// Assets operations
export async function saveAsset(params: {
  projectId: string;
  name: string;
  blob: Blob;
  mimeType?: string;
  width?: number;
  height?: number;
}): Promise<Asset> {
  const db = getDB();
  if (!db) throw new Error('Database not initialized');

  const assetId = generateId('asset');
  const asset: Asset = {
    id: assetId,
    projectId: params.projectId,
    name: params.name,
    mimeType: params.mimeType || params.blob.type || 'image/png',
    blob: params.blob,
    width: params.width || 0,
    height: params.height || 0,
    size: params.blob.size,
    createdAt: Date.now(),
  };

  await db.assets.add(asset);
  return asset;
}

export async function getAsset(id: string): Promise<Asset | undefined> {
  const db = getDB();
  if (!db) return undefined;
  return await db.assets.get(id);
}

export async function deleteAsset(id: string): Promise<void> {
  const db = getDB();
  if (!db) return;
  await db.assets.delete(id);
}

// Storage calculation
export async function getStorageEstimate(): Promise<{
  usageMB: number;
  quotaMB: number;
  percent: number;
  isLow: boolean;
}> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 1;
      const usageMB = Math.round((usage / (1024 * 1024)) * 10) / 10;
      const quotaMB = Math.round((quota / (1024 * 1024)) * 10) / 10;
      const percent = Math.min(100, Math.round((usage / quota) * 100));
      const isLow = percent > 85;
      return { usageMB, quotaMB, percent, isLow };
    } catch {
      // ignore
    }
  }
  return { usageMB: 0, quotaMB: 0, percent: 0, isLow: false };
}

// Backup Export (.sstudio ZIP)
export async function exportProjectBackup(projectId: string): Promise<Blob> {
  const db = getDB();
  if (!db) throw new Error('Database not initialized');

  const project = await db.projects.get(projectId);
  if (!project) throw new Error('Project not found');

  const pages = await db.pages.where('projectId').equals(projectId).sortBy('order');
  const assets = await db.assets.where('projectId').equals(projectId).toArray();

  const zip = new JSZip();

  // Project and pages JSON
  zip.file('project.json', JSON.stringify(project, null, 2));
  zip.file('pages.json', JSON.stringify(pages, null, 2));

  // Assets folder
  const assetsFolder = zip.folder('assets');
  if (assetsFolder) {
    for (const asset of assets) {
      const meta = {
        id: asset.id,
        name: asset.name,
        mimeType: asset.mimeType,
        width: asset.width,
        height: asset.height,
        size: asset.size,
        createdAt: asset.createdAt,
      };
      assetsFolder.file(`${asset.id}.meta.json`, JSON.stringify(meta));
      assetsFolder.file(`${asset.id}.data`, asset.blob);
    }
  }

  return await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

// Backup Import (.sstudio ZIP)
export async function importProjectBackup(file: File | Blob): Promise<Project> {
  const db = getDB();
  if (!db) throw new Error('Database not initialized');

  const zip = await JSZip.loadAsync(file);

  const projectFile = zip.file('project.json');
  const pagesFile = zip.file('pages.json');

  if (!projectFile || !pagesFile) {
    throw new Error('Invalid .sstudio file: missing project.json or pages.json');
  }

  let projectData: Project;
  let pagesData: ProjectPage[];

  try {
    projectData = JSON.parse(await projectFile.async('string'));
    pagesData = JSON.parse(await pagesFile.async('string'));
  } catch {
    throw new Error('Invalid project backup: corrupted JSON metadata');
  }

  if (!projectData.name || !projectData.width || !projectData.height) {
    throw new Error('Invalid project backup: missing essential project fields');
  }

  // Generate new IDs to prevent collision if re-importing
  const newProjectId = generateId('proj');
  const pageIdMap = new Map<string, string>();
  const assetIdMap = new Map<string, string>();
  const now = Date.now();

  const importedAssets: Asset[] = [];

  // Read assets from ZIP
  const assetFiles = Object.keys(zip.files).filter((path) => path.startsWith('assets/') && path.endsWith('.meta.json'));
  for (const metaPath of assetFiles) {
    const originalAssetId = metaPath.replace('assets/', '').replace('.meta.json', '');
    const dataPath = `assets/${originalAssetId}.data`;
    const metaFile = zip.file(metaPath);
    const dataFile = zip.file(dataPath);

    if (metaFile && dataFile) {
      try {
        const meta = JSON.parse(await metaFile.async('string'));
        const blobData = await dataFile.async('blob');
        const newAssetId = generateId('asset');
        assetIdMap.set(originalAssetId, newAssetId);

        importedAssets.push({
          id: newAssetId,
          projectId: newProjectId,
          name: meta.name || 'imported_asset.png',
          mimeType: meta.mimeType || 'image/png',
          blob: blobData,
          width: meta.width || 0,
          height: meta.height || 0,
          size: blobData.size,
          createdAt: now,
        });
      } catch {
        // Skip corrupted individual asset but continue project import
      }
    }
  }

  // Map and prepare pages
  const importedPages: ProjectPage[] = [];
  let newActivePageId = '';

  for (let i = 0; i < pagesData.length; i++) {
    const p = pagesData[i];
    const newPageId = generateId('page');
    pageIdMap.set(p.id, newPageId);

    if (i === 0 || p.id === projectData.activePageId) {
      newActivePageId = newPageId;
    }

    let canvasJSON = p.canvasJSON || '';
    // Remap asset IDs
    assetIdMap.forEach((newId, oldId) => {
      canvasJSON = canvasJSON.replaceAll(oldId, newId);
    });

    importedPages.push({
      ...p,
      id: newPageId,
      projectId: newProjectId,
      canvasJSON,
      screenshotAssetId: p.screenshotAssetId ? assetIdMap.get(p.screenshotAssetId) : undefined,
    });
  }

  const finalProject: Project = {
    id: newProjectId,
    name: `${projectData.name} (Restored)`,
    width: projectData.width,
    height: projectData.height,
    createdAt: now,
    updatedAt: now,
    activePageId: newActivePageId || (importedPages[0]?.id ?? generateId('page')),
  };

  // Commit transaction to IndexedDB
  await db.transaction('rw', db.projects, db.pages, db.assets, async () => {
    await db.projects.add(finalProject);
    for (const p of importedPages) {
      await db.pages.add(p);
    }
    for (const a of importedAssets) {
      await db.assets.add(a);
    }
  });

  return finalProject;
}

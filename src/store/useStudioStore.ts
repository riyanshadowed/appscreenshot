import { create } from 'zustand';
import { Project, ProjectPage, ThemeVariation, DeviceFrameType, ThemePalette, PlayStoreDevicePreset } from '@/types';
import {
  getProject,
  getPages,
  updateProject,
  updatePage,
  createPage as dbCreatePage,
  deletePage as dbDeletePage,
  duplicatePage as dbDuplicatePage,
  reorderPages as dbReorderPages,
  getStorageEstimate,
} from '@/lib/db';
import { THEME_DEFINITIONS } from '@/lib/themes/definitions';
import { PLAYSTORE_SIZES } from '@/lib/presets';

interface StudioState {
  project: Project | null;
  pages: ProjectPage[];
  activePageId: string | null;
  activeThemeId: string;
  activeVariation: ThemeVariation;
  activeFrame: DeviceFrameType;
  customPalette: ThemePalette;
  headingText: string;
  subtitleText: string;
  badgeText: string;
  saveStatus: 'saved' | 'saving' | 'unsaved' | 'error';
  zoomLevel: number;
  storageInfo: { usageMB: number; quotaMB: number; percent: number; isLow: boolean };
  activeTab: 'themes' | 'content' | 'variations' | 'frames' | 'layers' | 'colors' | 'upload';
  isAutoSyncAll: boolean;
  activeDevicePreset: PlayStoreDevicePreset;
  isPreviewMode: boolean;

  // Store actions
  loadProject: (projectId: string) => Promise<boolean>;
  setActivePageId: (pageId: string) => void;
  updateProjectTitle: (title: string) => Promise<void>;
  updateProjectDimensions: (width: number, height: number) => Promise<void>;
  setActiveDevicePreset: (preset: PlayStoreDevicePreset) => Promise<void>;
  setIsPreviewMode: (enabled: boolean) => void;
  resetDeviceVariantToPhoneSync: (pageId: string, device: 'tablet_7' | 'tablet_10') => Promise<void>;
  setIsAutoSyncAll: (enabled: boolean) => void;
  createPageWithScreenshot: (params: { name?: string; screenshotAssetId?: string; headingText?: string; subtitleText?: string; badgeText?: string }) => Promise<ProjectPage>;
  deletePageById: (pageId: string) => Promise<void>;
  duplicatePageById: (pageId: string) => Promise<ProjectPage | null>;
  reorderPagesByIds: (pageIds: string[]) => Promise<void>;
  setThemeId: (themeId: string) => void;
  setVariation: (variation: ThemeVariation) => void;
  setFrame: (frame: DeviceFrameType) => void;
  setCustomPalette: (palette: Partial<ThemePalette>) => void;
  setHeadingText: (text: string) => void;
  setSubtitleText: (text: string) => void;
  setBadgeText: (text: string) => void;
  setSaveStatus: (status: 'saved' | 'saving' | 'unsaved' | 'error') => void;
  setZoomLevel: (zoom: number) => void;
  setActiveTab: (tab: 'themes' | 'content' | 'variations' | 'frames' | 'layers' | 'colors' | 'upload') => void;
  refreshStorage: () => Promise<void>;
  updateCurrentPageCanvas: (canvasJSON: string, thumbnailDataUrl?: string) => Promise<void>;
}

export const useStudioStore = create<StudioState>((set, get) => ({
  project: null,
  pages: [],
  activePageId: null,
  activeThemeId: 'dark_premium',
  activeVariation: 'heading_screenshot',
  activeFrame: 'phone',
  customPalette: THEME_DEFINITIONS[0].defaultPalette,
  headingText: 'Transform Your Workflow',
  subtitleText: 'Everything you need in one powerful place',
  badgeText: '★ 4.9 (120K REVIEWS)',
  saveStatus: 'saved',
  zoomLevel: 1,
  storageInfo: { usageMB: 0, quotaMB: 0, percent: 0, isLow: false },
  activeTab: 'themes',
  isAutoSyncAll: true,
  activeDevicePreset: 'phone',
  isPreviewMode: false,

  setIsPreviewMode: (enabled: boolean) => {
    set({ isPreviewMode: enabled });
  },

  setActiveDevicePreset: async (preset: PlayStoreDevicePreset) => {
    const proj = get().project;
    if (!proj) return;
    const size = PLAYSTORE_SIZES.find((s) => s.id === preset) || PLAYSTORE_SIZES[0];
    set({
      activeDevicePreset: preset,
      project: { ...proj, width: size.width, height: size.height },
    });
    await updateProject(proj.id, { width: size.width, height: size.height });
  },

  resetDeviceVariantToPhoneSync: async (pageId: string, device: 'tablet_7' | 'tablet_10') => {
    const page = get().pages.find((p) => p.id === pageId);
    if (!page) return;

    const newVariants = {
      ...(page.variants || {}),
      [device]: {
        isCustomized: false,
        canvasJSON: undefined,
        thumbnailDataUrl: undefined,
      },
    };

    await updatePage(pageId, { variants: newVariants });
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === pageId ? { ...p, variants: newVariants } : p
      ),
    }));
  },

  setIsAutoSyncAll: (enabled: boolean) => {
    set({ isAutoSyncAll: enabled });
  },

  updateProjectDimensions: async (width: number, height: number) => {
    const proj = get().project;
    if (!proj) return;
    set({ project: { ...proj, width, height } });
    await updateProject(proj.id, { width, height });
  },

  loadProject: async (projectId: string) => {
    try {
      const proj = await getProject(projectId);
      if (!proj) return false;

      const pagesList = await getPages(projectId);
      const activeId = proj.activePageId || pagesList[0]?.id || null;
      const activePage = pagesList.find((p) => p.id === activeId) || pagesList[0];

      const themeId = activePage?.themeId || 'dark_premium';
      const themeDef = THEME_DEFINITIONS.find((t) => t.id === themeId);
      const palette = activePage?.customPalette || themeDef?.defaultPalette || THEME_DEFINITIONS[0].defaultPalette;

      set({
        project: proj,
        pages: pagesList,
        activePageId: activePage?.id || null,
        activeThemeId: themeId,
        activeVariation: activePage?.variation || themeDef?.defaultVariation || 'heading_screenshot',
        activeFrame: activePage?.frameType || themeDef?.defaultFrame || 'phone',
        customPalette: palette,
        headingText: activePage?.headingText || 'Transform Your Workflow',
        subtitleText: activePage?.subtitleText !== undefined ? activePage.subtitleText : 'Everything you need in one powerful place',
        badgeText: activePage?.badgeText || themeDef?.accentBadgeText || '★ 4.9 (120K REVIEWS)',
      });

      await get().refreshStorage();
      return true;
    } catch (e) {
      console.error('Error loading project into store:', e);
      return false;
    }
  },

  setActivePageId: (pageId: string) => {
    const page = get().pages.find((p) => p.id === pageId);
    if (!page) return;

    const themeId = page.themeId || get().activeThemeId;
    const themeDef = THEME_DEFINITIONS.find((t) => t.id === themeId);
    const palette = page.customPalette || themeDef?.defaultPalette || get().customPalette;

    set({
      activePageId: pageId,
      activeThemeId: themeId,
      activeVariation: page.variation || get().activeVariation,
      activeFrame: page.frameType || get().activeFrame,
      customPalette: palette,
      headingText: page.headingText || 'Transform Your Workflow',
      subtitleText: page.subtitleText !== undefined ? page.subtitleText : 'Everything you need in one powerful place',
      badgeText: page.badgeText || '★ 4.9 (120K REVIEWS)',
    });

    const proj = get().project;
    if (proj) {
      updateProject(proj.id, { activePageId: pageId });
    }
  },

  updateProjectTitle: async (title: string) => {
    const proj = get().project;
    if (!proj) return;
    const trimmed = title.trim() || 'Untitled Project';
    set({ project: { ...proj, name: trimmed } });
    await updateProject(proj.id, { name: trimmed });
  },

  createPageWithScreenshot: async (params) => {
    const proj = get().project;
    if (!proj) throw new Error('No active project');

    const newPage = await dbCreatePage({
      projectId: proj.id,
      name: params.name,
      screenshotAssetId: params.screenshotAssetId,
      headingText: params.headingText || get().headingText,
      subtitleText: params.subtitleText || get().subtitleText,
    });

    const updatedPages = await getPages(proj.id);
    set({
      pages: updatedPages,
      activePageId: newPage.id,
    });

    return newPage;
  },

  deletePageById: async (pageId: string) => {
    const proj = get().project;
    if (!proj) return;
    const currentPages = get().pages;
    if (currentPages.length <= 1) return;

    const currentActiveId = get().activePageId;
    await dbDeletePage(pageId);
    const updatedPages = await getPages(proj.id);
    
    // If active page was deleted, switch to the first available page
    let nextActiveId = currentActiveId;
    if (currentActiveId === pageId) {
      nextActiveId = updatedPages[0]?.id || null;
    }

    set({
      pages: updatedPages,
      activePageId: nextActiveId,
    });
  },

  duplicatePageById: async (pageId: string) => {
    const proj = get().project;
    if (!proj) return null;

    const dup = await dbDuplicatePage(pageId);
    const updatedPages = await getPages(proj.id);

    set({
      pages: updatedPages,
      activePageId: dup.id,
    });

    return dup;
  },

  reorderPagesByIds: async (pageIds: string[]) => {
    const proj = get().project;
    if (!proj) return;

    await dbReorderPages(proj.id, pageIds);
    const updatedPages = await getPages(proj.id);
    set({ pages: updatedPages });
  },

  setThemeId: (themeId: string) => {
    const def = THEME_DEFINITIONS.find((t) => t.id === themeId);
    if (!def) return;
    set({
      activeThemeId: themeId,
      customPalette: { ...def.defaultPalette },
    });
  },

  setVariation: (variation: ThemeVariation) => {
    set({ activeVariation: variation });
  },

  setFrame: (frame: DeviceFrameType) => {
    set({ activeFrame: frame });
  },

  setCustomPalette: (palette: Partial<ThemePalette>) => {
    set((state) => ({
      customPalette: {
        ...state.customPalette,
        ...palette,
      },
    }));
  },

  setHeadingText: (text: string) => {
    const { activePageId } = get();
    set((state) => ({
      headingText: text,
      pages: state.pages.map((p) => (p.id === activePageId ? { ...p, headingText: text } : p)),
    }));
    if (activePageId) {
      updatePage(activePageId, { headingText: text });
    }
  },

  setSubtitleText: (text: string) => {
    const { activePageId } = get();
    set((state) => ({
      subtitleText: text,
      pages: state.pages.map((p) => (p.id === activePageId ? { ...p, subtitleText: text } : p)),
    }));
    if (activePageId) {
      updatePage(activePageId, { subtitleText: text });
    }
  },

  setBadgeText: (text: string) => {
    const { activePageId } = get();
    set((state) => ({
      badgeText: text,
      pages: state.pages.map((p) => (p.id === activePageId ? { ...p, badgeText: text } : p)),
    }));
    if (activePageId) {
      updatePage(activePageId, { badgeText: text });
    }
  },

  setSaveStatus: (status) => {
    set({ saveStatus: status });
  },

  setZoomLevel: (zoom) => {
    set({ zoomLevel: zoom });
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  refreshStorage: async () => {
    const info = await getStorageEstimate();
    set({ storageInfo: info });
  },

  updateCurrentPageCanvas: async (canvasJSON: string, thumbnailDataUrl?: string) => {
    const { activePageId, project, activeDevicePreset, pages } = get();
    if (!activePageId || !project) return;

    const currentPage = pages.find((p) => p.id === activePageId);
    if (!currentPage) return;

    const existingVariants = currentPage.variants || {};
    const updatedVariants = { ...existingVariants };

    let pageUpdates: Partial<ProjectPage> = {};

    if (activeDevicePreset === 'phone') {
      // Phone is master: updates phone variant and root canvasJSON
      updatedVariants.phone = {
        canvasJSON,
        thumbnailDataUrl: thumbnailDataUrl || currentPage.thumbnailDataUrl,
        isCustomized: true,
      };
      pageUpdates = {
        canvasJSON,
        thumbnailDataUrl: thumbnailDataUrl || currentPage.thumbnailDataUrl,
        variants: updatedVariants,
      };
    } else {
      // Tablet variant: decoupled & independent!
      // Edits in tablet stay strictly in this tablet variant and never overwrite phone
      updatedVariants[activeDevicePreset] = {
        canvasJSON,
        thumbnailDataUrl: thumbnailDataUrl || currentPage.variants?.[activeDevicePreset]?.thumbnailDataUrl,
        isCustomized: true,
      };
      pageUpdates = {
        variants: updatedVariants,
      };
    }

    await updatePage(activePageId, pageUpdates);

    // Update in local state without full reload
    set((state) => ({
      pages: state.pages.map((p) =>
        p.id === activePageId
          ? {
              ...p,
              ...pageUpdates,
            }
          : p
      ),
    }));
  },
}));

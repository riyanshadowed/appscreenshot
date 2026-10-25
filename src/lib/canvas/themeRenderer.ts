import * as fabric from 'fabric';
import { ThemeDefinition, ThemeVariation, DeviceFrameType, ThemePalette } from '@/types';
import { THEME_DEFINITIONS } from '../themes/definitions';

export interface RenderThemeOptions {
  themeId: string;
  variation?: ThemeVariation;
  frameType?: DeviceFrameType;
  customPalette?: ThemePalette;
  headingText?: string;
  subtitleText?: string;
  badgeText?: string;
  screenshotUrl?: string;
  canvasWidth: number;
  canvasHeight: number;
}

// Draw a native vector app mockup screen directly onto the canvas (100% reliable, zero network/image failures)
function createVectorMockupApp(
  width: number,
  height: number,
  primaryColor: string,
  accentColor: string
): fabric.Group {
  const bg = new fabric.Rect({
    width,
    height,
    rx: 32,
    ry: 32,
    fill: '#0f172a',
    originX: 'center',
    originY: 'top',
  });

  // Header bar
  const headerBar = new fabric.Rect({
    width: width * 0.88,
    height: height * 0.05,
    rx: 14,
    ry: 14,
    fill: '#1e293b',
    originX: 'center',
    originY: 'top',
    top: height * 0.035,
  });

  const headerAvatar = new fabric.Circle({
    radius: height * 0.016,
    fill: primaryColor,
    originX: 'center',
    originY: 'center',
    left: -width * 0.36,
    top: height * 0.06,
  });

  const headerTitle = new fabric.Rect({
    width: width * 0.35,
    height: height * 0.014,
    rx: 4,
    ry: 4,
    fill: '#f8fafc',
    originX: 'left',
    originY: 'center',
    left: -width * 0.28,
    top: height * 0.06,
  });

  // Hero Card
  const heroCard = new fabric.Rect({
    width: width * 0.88,
    height: height * 0.22,
    rx: 24,
    ry: 24,
    fill: primaryColor,
    originX: 'center',
    originY: 'top',
    top: height * 0.11,
  });

  const heroLabel = new fabric.Rect({
    width: width * 0.35,
    height: height * 0.016,
    rx: 5,
    ry: 5,
    fill: 'rgba(255, 255, 255, 0.9)',
    originX: 'left',
    originY: 'top',
    left: -width * 0.38,
    top: height * 0.14,
  });

  const heroAmount = new fabric.Rect({
    width: width * 0.55,
    height: height * 0.032,
    rx: 6,
    ry: 6,
    fill: '#ffffff',
    originX: 'left',
    originY: 'top',
    left: -width * 0.38,
    top: height * 0.17,
  });

  const heroBtn = new fabric.Rect({
    width: width * 0.3,
    height: height * 0.04,
    rx: 12,
    ry: 12,
    fill: '#ffffff',
    originX: 'left',
    originY: 'top',
    left: -width * 0.38,
    top: height * 0.26,
  });

  // Analytics Card with Chart Bars
  const chartCard = new fabric.Rect({
    width: width * 0.88,
    height: height * 0.22,
    rx: 20,
    ry: 20,
    fill: '#1e293b',
    originX: 'center',
    originY: 'top',
    top: height * 0.36,
  });

  const chartTitle = new fabric.Rect({
    width: width * 0.4,
    height: height * 0.016,
    rx: 4,
    ry: 4,
    fill: '#f1f5f9',
    originX: 'left',
    originY: 'top',
    left: -width * 0.38,
    top: height * 0.385,
  });

  // Chart Bars
  const bars: fabric.Rect[] = [];
  const barHeights = [0.06, 0.09, 0.13, 0.11, 0.15, 0.08, 0.14];
  const barW = width * 0.08;
  const startX = -width * 0.36;
  const spacing = width * 0.115;
  const chartBaseY = height * 0.55;

  for (let i = 0; i < barHeights.length; i++) {
    const bh = height * barHeights[i];
    bars.push(
      new fabric.Rect({
        width: barW,
        height: bh,
        rx: 6,
        ry: 6,
        fill: i === 4 ? accentColor : primaryColor,
        opacity: i === 4 ? 1 : 0.6 + i * 0.05,
        originX: 'left',
        originY: 'bottom',
        left: startX + i * spacing,
        top: chartBaseY,
      })
    );
  }

  // List Item Card 1
  const listItem1 = new fabric.Rect({
    width: width * 0.88,
    height: height * 0.085,
    rx: 18,
    ry: 18,
    fill: '#1e293b',
    originX: 'center',
    originY: 'top',
    top: height * 0.61,
  });

  const listIcon1 = new fabric.Circle({
    radius: height * 0.02,
    fill: primaryColor,
    originX: 'center',
    originY: 'center',
    left: -width * 0.33,
    top: height * 0.652,
  });

  const listText1 = new fabric.Rect({
    width: width * 0.45,
    height: height * 0.016,
    rx: 4,
    ry: 4,
    fill: '#f8fafc',
    originX: 'left',
    originY: 'center',
    left: -width * 0.23,
    top: height * 0.652,
  });

  // List Item Card 2
  const listItem2 = new fabric.Rect({
    width: width * 0.88,
    height: height * 0.085,
    rx: 18,
    ry: 18,
    fill: '#1e293b',
    originX: 'center',
    originY: 'top',
    top: height * 0.72,
  });

  const listIcon2 = new fabric.Circle({
    radius: height * 0.02,
    fill: accentColor,
    originX: 'center',
    originY: 'center',
    left: -width * 0.33,
    top: height * 0.762,
  });

  const listText2 = new fabric.Rect({
    width: width * 0.4,
    height: height * 0.016,
    rx: 4,
    ry: 4,
    fill: '#f8fafc',
    originX: 'left',
    originY: 'center',
    left: -width * 0.23,
    top: height * 0.762,
  });

  // Bottom Navigation Bar
  const bottomNav = new fabric.Rect({
    width: width * 0.88,
    height: height * 0.065,
    rx: 20,
    ry: 20,
    fill: '#161e2e',
    originX: 'center',
    originY: 'bottom',
    top: height * 0.96,
  });

  const navDot1 = new fabric.Circle({
    radius: height * 0.012,
    fill: primaryColor,
    originX: 'center',
    originY: 'center',
    left: -width * 0.28,
    top: height * 0.928,
  });

  const navDot2 = new fabric.Circle({
    radius: height * 0.012,
    fill: '#64748b',
    originX: 'center',
    originY: 'center',
    left: 0,
    top: height * 0.928,
  });

  const navDot3 = new fabric.Circle({
    radius: height * 0.012,
    fill: '#64748b',
    originX: 'center',
    originY: 'center',
    left: width * 0.28,
    top: height * 0.928,
  });

  return new fabric.Group(
    [
      bg,
      headerBar,
      headerAvatar,
      headerTitle,
      heroCard,
      heroLabel,
      heroAmount,
      heroBtn,
      chartCard,
      chartTitle,
      ...bars,
      listItem1,
      listIcon1,
      listText1,
      listItem2,
      listIcon2,
      listText2,
      bottomNav,
      navDot1,
      navDot2,
      navDot3,
    ],
    {
      width,
      height,
      originX: 'center',
      originY: 'top',
    }
  );
}

// Build complete theme canvas
export async function buildThemeCanvas(
  canvas: fabric.Canvas,
  options: RenderThemeOptions
): Promise<void> {
  const theme = THEME_DEFINITIONS.find((t) => t.id === options.themeId) || THEME_DEFINITIONS[0];
  const variation = options.variation || theme.defaultVariation;
  const frameType = options.frameType || theme.defaultFrame;
  const palette = options.customPalette || theme.defaultPalette;
  const W = options.canvasWidth;
  const H = options.canvasHeight;

  // Clear existing objects but preserve zoom transform
  canvas.clear();

  // 1. Create Background
  let bgFill: string | fabric.Gradient<'linear'> = palette.background;
  if (palette.backgroundGradient) {
    const deg = palette.backgroundGradient.angle ?? 180;
    // Standard CSS-compatible gradient coordinates (180deg = top-to-bottom, 90deg = left-to-right, 135deg = top-left to bottom-right)
    const rad = (deg - 90) * (Math.PI / 180);
    const cx = W / 2;
    const cy = H / 2;
    const x1 = Math.round(cx - Math.cos(rad) * (W / 2));
    const y1 = Math.round(cy - Math.sin(rad) * (H / 2));
    const x2 = Math.round(cx + Math.cos(rad) * (W / 2));
    const y2 = Math.round(cy + Math.sin(rad) * (H / 2));

    bgFill = new fabric.Gradient({
      type: 'linear',
      gradientUnits: 'pixels',
      coords: { x1, y1, x2, y2 },
      colorStops: palette.backgroundGradient.stops.map((s) => ({
        offset: s.offset,
        color: s.color,
      })),
    });
  }

  const bgRect = new fabric.Rect({
    left: 0,
    top: 0,
    width: W,
    height: H,
    fill: bgFill,
    selectable: false,
    evented: false,
    hoverCursor: 'default',
  });
  (bgRect as any).dataTag = 'background';
  (bgRect as any).name = 'Background';
  canvas.add(bgRect);

  // 2. Add Ambient Glow Orbs / Shapes (non-evented background atmosphere)
  const glowCircle1 = new fabric.Circle({
    left: W * 0.05,
    top: H * 0.12,
    radius: W * 0.48,
    fill: palette.primary,
    opacity: 0.18,
    selectable: false,
    evented: false,
  });
  (glowCircle1 as any).dataTag = 'accent';
  (glowCircle1 as any).name = 'Ambient Glow 1';
  canvas.add(glowCircle1);

  const glowCircle2 = new fabric.Circle({
    left: W * 0.52,
    top: H * 0.55,
    radius: W * 0.38,
    fill: palette.accent || palette.primary,
    opacity: 0.15,
    selectable: false,
    evented: false,
  });
  (glowCircle2 as any).dataTag = 'accent';
  (glowCircle2 as any).name = 'Ambient Glow 2';
  canvas.add(glowCircle2);

  const glowCircle3 = new fabric.Circle({
    left: W * 0.5,
    top: -H * 0.08,
    radius: W * 0.45,
    originX: 'center',
    originY: 'top',
    fill: palette.accent || palette.primary,
    opacity: 0.12,
    selectable: false,
    evented: false,
  });
  (glowCircle3 as any).dataTag = 'accent';
  (glowCircle3 as any).name = 'Ambient Glow 3';
  canvas.add(glowCircle3);

  // 3. Layout Dimensions Calculation
  let headingY = H * 0.085;
  let subtitleY = H * 0.175;
  let badgeY = H * 0.04;
  let screenshotY = H * 0.26;
  let screenshotTargetW = W * 0.82;
  let screenshotTargetH = H * 0.69;

  let frameLeft = W / 2;
  let frameAngle = 0;
  let headingAlign: 'left' | 'center' | 'right' = 'center';
  let headingOriginX = 'center';
  let headingLeft = W / 2;
  let headingWidth = W * 0.88;
  let badgeOriginX = 'center';
  let badgeLeft = W / 2;
  let subtitleAlign: 'left' | 'center' | 'right' = 'center';
  let subtitleOriginX = 'center';
  let subtitleLeft = W / 2;
  let subtitleWidth = W * 0.82;
  let shadowBlur = 55;
  let shadowOffsetY = 28;
  let shadowOffsetX = 0;

  if (variation === 'screenshot_heading') {
    screenshotY = H * 0.04;
    screenshotTargetH = H * 0.65;
    badgeY = H * 0.72;
    headingY = H * 0.76;
    subtitleY = H * 0.86;
  } else if (variation === 'centered_screenshot') {
    badgeY = H * 0.035;
    headingY = H * 0.08;
    screenshotY = H * 0.19;
    screenshotTargetH = H * 0.68;
    subtitleY = H * 0.90;
  } else if (variation === 'hero_screenshot') {
    badgeY = H * 0.03;
    headingY = H * 0.07;
    subtitleY = H * 0.135;
    screenshotY = H * 0.19;
    screenshotTargetW = W * 0.88;
    screenshotTargetH = H * 0.78;
  } else if (variation === 'tilted_isometric_left') {
    frameAngle = -11;
    frameLeft = W * 0.52;
    screenshotY = H * 0.27;
    screenshotTargetW = W * 0.84;
    screenshotTargetH = H * 0.70;
    shadowBlur = 68;
    shadowOffsetY = 38;
    shadowOffsetX = 20;
  } else if (variation === 'tilted_isometric_right') {
    frameAngle = 11;
    frameLeft = W * 0.48;
    screenshotY = H * 0.27;
    screenshotTargetW = W * 0.84;
    screenshotTargetH = H * 0.70;
    shadowBlur = 68;
    shadowOffsetY = 38;
    shadowOffsetX = -20;
  } else if (variation === 'bottom_peek_bleed') {
    badgeY = H * 0.04;
    headingY = H * 0.095;
    subtitleY = H * 0.195;
    screenshotY = H * 0.31;
    screenshotTargetW = W * 0.96;
    screenshotTargetH = H * 0.88;
  } else if (variation === 'minimal_editorial_left') {
    badgeY = H * 0.045;
    badgeOriginX = 'left';
    badgeLeft = W * 0.08;
    headingY = H * 0.095;
    headingAlign = 'left';
    headingOriginX = 'left';
    headingLeft = W * 0.08;
    headingWidth = W * 0.84;
    subtitleY = H * 0.19;
    subtitleAlign = 'left';
    subtitleOriginX = 'left';
    subtitleLeft = W * 0.08;
    subtitleWidth = W * 0.84;
    screenshotY = H * 0.28;
    frameLeft = W * 0.54;
    screenshotTargetW = W * 0.84;
  } else if (variation === 'floating_perspective') {
    frameAngle = -5;
    frameLeft = W * 0.51;
    screenshotY = H * 0.25;
    screenshotTargetW = W * 0.85;
    screenshotTargetH = H * 0.71;
    shadowBlur = 75;
    shadowOffsetY = 42;
    shadowOffsetX = 12;
  } else if (variation === 'compact_double_glow') {
    badgeY = H * 0.05;
    headingY = H * 0.10;
    subtitleY = H * 0.19;
    screenshotY = H * 0.28;
    screenshotTargetW = W * 0.76;
    screenshotTargetH = H * 0.65;
    shadowBlur = 50;
    shadowOffsetY = 24;
  }

  // Spotlight glow aura for compact double glow layout
  if (variation === 'compact_double_glow') {
    const spotlightGlow = new fabric.Circle({
      left: frameLeft,
      top: screenshotY + screenshotTargetH * 0.45,
      radius: W * 0.42,
      originX: 'center',
      originY: 'center',
      fill: palette.accent || palette.primary,
      opacity: 0.28,
      selectable: false,
      evented: false,
    });
    (spotlightGlow as any).dataTag = 'accent';
    (spotlightGlow as any).name = 'Spotlight Aura';
    canvas.add(spotlightGlow);
  }

  // 4. Accent Feature Badge Pill
  const badgeText = options.badgeText || theme.accentBadgeText || '★ 4.9 (120K REVIEWS)';
  const badgeFabricText = new fabric.FabricText(badgeText, {
    fontSize: Math.round(W * 0.024),
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '700',
    fill: palette.text,
    originX: 'center',
    originY: 'center',
  });
  (badgeFabricText as any).dataTag = 'badge-text';

  const badgePaddingX = Math.round(W * 0.032);
  const badgePaddingY = Math.round(W * 0.015);
  const badgeWidth = (badgeFabricText.width || 140) + badgePaddingX * 2;
  const badgeHeight = (badgeFabricText.height || 26) + badgePaddingY * 2;

  const badgeBg = new fabric.Rect({
    width: badgeWidth,
    height: badgeHeight,
    rx: badgeHeight / 2,
    ry: badgeHeight / 2,
    fill: palette.secondary || 'rgba(255,255,255,0.12)',
    stroke: palette.accent || 'rgba(255,255,255,0.3)',
    strokeWidth: 2,
    originX: 'center',
    originY: 'center',
  });
  (badgeBg as any).dataTag = 'badge-bg';

  const badgeGroup = new fabric.Group([badgeBg, badgeFabricText], {
    left: badgeLeft,
    top: badgeY,
    originX: badgeOriginX as any,
    originY: 'center',
    selectable: true,
  });
  (badgeGroup as any).dataTag = 'badge';
  (badgeGroup as any).name = 'Feature Badge';
  canvas.add(badgeGroup);

  // 5. Heading Textbox
  const isLight =
    typeof palette.background === 'string' &&
    palette.background.startsWith('#') &&
    (() => {
      const c = palette.background.replace('#', '');
      if (c.length < 6) return false;
      const r = parseInt(c.substring(0, 2), 16) || 0;
      const g = parseInt(c.substring(2, 4), 16) || 0;
      const b = parseInt(c.substring(4, 6), 16) || 0;
      return (r * 299 + g * 587 + b * 114) / 1000 > 185;
    })();

  const headingShadow = new fabric.Shadow({
    color: isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.45)',
    blur: isLight ? 8 : 16,
    offsetX: 0,
    offsetY: isLight ? 2 : 4,
  });

  const headingContent = options.headingText || 'Manage Your Business';
  const headingFontSize = Math.round(W * 0.068);
  const heading = new fabric.Textbox(headingContent, {
    left: headingLeft,
    top: headingY,
    originX: headingOriginX as any,
    originY: 'top',
    width: headingWidth,
    fontSize: headingFontSize,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: '800',
    fill: palette.text,
    textAlign: headingAlign,
    lineHeight: 1.15,
    cursorColor: palette.accent || '#6366f1',
    cursorWidth: 3,
    cursorDuration: 550,
    editingBorderColor: '#6366f1',
    selectionColor: 'rgba(99, 102, 241, 0.35)',
    objectCaching: false,
    splitByGrapheme: false,
    shadow: headingShadow,
  });
  (heading as any).dataTag = 'heading';
  (heading as any).name = 'Heading';
  canvas.add(heading);

  // 6. Subtitle Textbox (only added if not empty)
  const subtitleContent =
    options.subtitleText !== undefined
      ? options.subtitleText.trim()
      : 'Everything you need in one powerful place';

  if (subtitleContent.length > 0) {
    const subtitleFontSize = Math.round(W * 0.034);
    const subtitle = new fabric.Textbox(subtitleContent, {
      left: subtitleLeft,
      top: subtitleY,
      originX: subtitleOriginX as any,
      originY: 'top',
      width: subtitleWidth,
      fontSize: subtitleFontSize,
      fontFamily: 'Inter, system-ui, sans-serif',
      fontWeight: '500',
      fill: palette.subtitle,
      textAlign: subtitleAlign,
      lineHeight: 1.35,
      cursorColor: palette.accent || '#6366f1',
      cursorWidth: 3,
      cursorDuration: 550,
      editingBorderColor: '#6366f1',
      selectionColor: 'rgba(99, 102, 241, 0.35)',
      objectCaching: false,
      splitByGrapheme: false,
      shadow: new fabric.Shadow({
        color: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.35)',
        blur: isLight ? 6 : 10,
        offsetX: 0,
        offsetY: isLight ? 1 : 2,
      }),
    });
    (subtitle as any).dataTag = 'subtitle';
    (subtitle as any).name = 'Subtitle';
    canvas.add(subtitle);
  }

  // 7. Screenshot Display (User Upload or Native Vector Mockup)
  const frameTop = screenshotY;

  if (options.screenshotUrl) {
    try {
      const htmlImg = new Image();
      if (options.screenshotUrl.startsWith('http')) {
        htmlImg.crossOrigin = 'anonymous';
      }

      await new Promise<void>((resolve, reject) => {
        htmlImg.onload = () => resolve();
        htmlImg.onerror = () => reject(new Error('Image decode failed'));
        htmlImg.src = options.screenshotUrl!;
      });

      const fabricImg = new fabric.FabricImage(htmlImg);
      const origW = fabricImg.width || 800;
      const origH = fabricImg.height || 1500;

      if (frameType === 'phone') {
        // High-end realistic smartphone frame adapting cleanly to screenshot ratio (16:9 to 20:9)
        const imgRatio = origH / origW;
        const targetRatio = Math.max(1.68, Math.min(2.22, imgRatio));

        let phoneW = Math.round(screenshotTargetW * 0.88);
        let phoneH = Math.round(phoneW * targetRatio);

        if (phoneH > screenshotTargetH) {
          phoneH = Math.round(screenshotTargetH);
          phoneW = Math.round(phoneH / targetRatio);
        }

        const bezel = Math.max(14, Math.round(phoneW * 0.035));
        const cornerRadius = Math.round(phoneW * 0.096);
        const screenW = phoneW - bezel * 2;
        const screenH = phoneH - bezel * 2;
        const screenRadius = Math.round(cornerRadius * 0.76);

        // Scale screenshot so it fits perfectly inside phone screen placeholder ("pura aaye")
        const scaleW = screenW / origW;
        const scaleH = screenH / origH;
        const scale = Math.abs(scaleW - scaleH) / Math.max(scaleW, scaleH) < 0.05
          ? Math.max(scaleW, scaleH)
          : Math.min(scaleW, scaleH);

        const chassis = new fabric.Rect({
          width: phoneW,
          height: phoneH,
          rx: cornerRadius,
          ry: cornerRadius,
          fill: palette.frameColor || '#0a0d16',
          stroke: '#334155',
          strokeWidth: 3,
          originX: 'center',
          originY: 'top',
          left: 0,
          top: 0,
          shadow: new fabric.Shadow({
            color: 'rgba(0, 0, 0, 0.7)',
            blur: 55,
            offsetX: 0,
            offsetY: 28,
          }),
        });

        // OLED screen background
        const screenBg = new fabric.Rect({
          width: screenW,
          height: screenH,
          rx: screenRadius,
          ry: screenRadius,
          fill: '#000000',
          originX: 'center',
          originY: 'top',
          left: 0,
          top: bezel,
        });

        fabricImg.set({
          scaleX: scale,
          scaleY: scale,
          originX: 'center',
          originY: 'center',
          left: 0,
          top: bezel + screenH / 2,
        });

        const clipRect = new fabric.Rect({
          width: screenW / scale,
          height: screenH / scale,
          rx: screenRadius / scale,
          ry: screenRadius / scale,
          originX: 'center',
          originY: 'center',
        });
        fabricImg.clipPath = clipRect;

        // Dynamic Island pill
        const pillW = phoneW * 0.28;
        const pillH = phoneH * 0.025;
        const dynamicIsland = new fabric.Rect({
          width: pillW,
          height: pillH,
          rx: pillH / 2,
          ry: pillH / 2,
          fill: '#000000',
          stroke: '#1e293b',
          strokeWidth: 1.5,
          originX: 'center',
          originY: 'top',
          left: 0,
          top: bezel + pillH * 0.35,
        });

        const cameraDot = new fabric.Circle({
          radius: pillH * 0.18,
          fill: '#0369a1',
          opacity: 0.7,
          originX: 'center',
          originY: 'center',
          left: pillW * 0.25,
          top: bezel + pillH * 0.35 + pillH / 2,
        });

        const speakerW = phoneW * 0.16;
        const speakerH = 3.5;
        const speaker = new fabric.Rect({
          width: speakerW,
          height: speakerH,
          rx: 2,
          ry: 2,
          fill: '#334155',
          originX: 'center',
          originY: 'top',
          left: 0,
          top: bezel * 0.35,
        });

        // Subtle side buttons
        const volBtn = new fabric.Rect({
          width: 4,
          height: phoneH * 0.1,
          rx: 2,
          ry: 2,
          fill: '#334155',
          originX: 'right',
          originY: 'top',
          left: -phoneW / 2 + 1,
          top: phoneH * 0.18,
        });

        const powerBtn = new fabric.Rect({
          width: 4,
          height: phoneH * 0.08,
          rx: 2,
          ry: 2,
          fill: '#334155',
          originX: 'left',
          originY: 'top',
          left: phoneW / 2 - 1,
          top: phoneH * 0.22,
        });

        // Subtle glass sheen
        const glassGlow = new fabric.Rect({
          width: screenW,
          height: screenH * 0.35,
          rx: screenRadius,
          ry: screenRadius,
          fill: 'rgba(255, 255, 255, 0.025)',
          originX: 'center',
          originY: 'top',
          left: 0,
          top: bezel,
        });

        const phoneGroup = new fabric.Group(
          [chassis, volBtn, powerBtn, screenBg, fabricImg, glassGlow, dynamicIsland, cameraDot, speaker],
          {
            left: frameLeft,
            top: frameTop,
            originX: 'center',
            originY: 'top',
            angle: frameAngle,
            selectable: true,
          }
        );
        (phoneGroup as any).dataTag = 'screenshot';
        (phoneGroup as any).name = 'Phone Mockup';
        canvas.add(phoneGroup);
      } else if (frameType === 'tablet') {
        const imgRatio = origH / origW;
        const targetTabletRatio = Math.max(1.25, Math.min(1.68, imgRatio));
        let tabletW = Math.round(screenshotTargetW * 0.92);
        let tabletH = Math.round(tabletW * targetTabletRatio);
        if (tabletH > screenshotTargetH) {
          tabletH = Math.round(screenshotTargetH);
          tabletW = Math.round(tabletH / targetTabletRatio);
        }

        const bezel = Math.max(16, Math.round(tabletW * 0.038));
        const cornerRadius = Math.round(tabletW * 0.06);
        const screenW = tabletW - bezel * 2;
        const screenH = tabletH - bezel * 2;
        const screenRadius = Math.round(cornerRadius * 0.65);

        const scaleW = screenW / origW;
        const scaleH = screenH / origH;
        const scale = Math.abs(scaleW - scaleH) / Math.max(scaleW, scaleH) < 0.05
          ? Math.max(scaleW, scaleH)
          : Math.min(scaleW, scaleH);

        const chassis = new fabric.Rect({
          width: tabletW,
          height: tabletH,
          rx: cornerRadius,
          ry: cornerRadius,
          fill: palette.frameColor || '#0a0d16',
          stroke: '#475569',
          strokeWidth: 3,
          originX: 'center',
          originY: 'top',
          left: 0,
          top: 0,
          shadow: new fabric.Shadow({
            color: 'rgba(0, 0, 0, 0.65)',
            blur: 50,
            offsetX: 0,
            offsetY: 24,
          }),
        });

        const screenBg = new fabric.Rect({
          width: screenW,
          height: screenH,
          rx: screenRadius,
          ry: screenRadius,
          fill: '#000000',
          originX: 'center',
          originY: 'top',
          left: 0,
          top: bezel,
        });

        fabricImg.set({
          scaleX: scale,
          scaleY: scale,
          originX: 'center',
          originY: 'center',
          left: 0,
          top: bezel + screenH / 2,
        });

        const screenClip = new fabric.Rect({
          width: screenW / scale,
          height: screenH / scale,
          rx: screenRadius / scale,
          ry: screenRadius / scale,
          originX: 'center',
          originY: 'center',
        });
        fabricImg.clipPath = screenClip;

        const cameraDot = new fabric.Circle({
          radius: bezel * 0.18,
          fill: '#020617',
          stroke: '#334155',
          strokeWidth: 1,
          originX: 'center',
          originY: 'center',
          left: 0,
          top: bezel / 2,
        });

        const tabletGroup = new fabric.Group([chassis, screenBg, fabricImg, cameraDot], {
          left: frameLeft,
          top: frameTop,
          originX: 'center',
          originY: 'top',
          angle: frameAngle,
          selectable: true,
        });
        (tabletGroup as any).dataTag = 'screenshot';
        (tabletGroup as any).name = 'Tablet Mockup';
        canvas.add(tabletGroup);
      } else {
        // Frameless Floating Card
        const cardW = Math.round(screenshotTargetW * 0.88);
        const scaleW = cardW / origW;
        const cardH = Math.min(Math.round(origH * scaleW), screenshotTargetH);
        const scale = cardH / origH;
        const actualW = origW * scale;
        const actualH = origH * scale;

        fabricImg.set({
          scaleX: scale,
          scaleY: scale,
          originX: 'center',
          originY: 'top',
          left: frameLeft,
          top: frameTop,
          angle: frameAngle,
          shadow: new fabric.Shadow({
            color: 'rgba(0, 0, 0, 0.65)',
            blur: shadowBlur,
            offsetX: shadowOffsetX,
            offsetY: shadowOffsetY,
          }),
        });

        const clipRect = new fabric.Rect({
          width: actualW / scale,
          height: actualH / scale,
          rx: (actualW * 0.065) / scale,
          ry: (actualW * 0.065) / scale,
          originX: 'center',
          originY: 'top',
          left: frameLeft,
          top: frameTop,
          angle: frameAngle,
        });
        fabricImg.clipPath = clipRect;

        (fabricImg as any).dataTag = 'screenshot';
        (fabricImg as any).name = 'Screenshot';
        canvas.add(fabricImg);
      }
    } catch (err) {
      console.warn('Screenshot load fallback:', err);
    }
  }

  // If no user screenshot or decode failed, render high-fidelity native vector mockup app
  if (!options.screenshotUrl || !canvas.getObjects().some((o: any) => o.dataTag === 'screenshot')) {
    if (frameType === 'phone') {
      let phoneW = Math.round(screenshotTargetW * 0.88);
      let phoneH = Math.round(phoneW * 2.08);

      if (phoneH > screenshotTargetH) {
        phoneH = Math.round(screenshotTargetH);
        phoneW = Math.round(phoneH / 2.08);
      }

      const bezel = Math.max(14, Math.round(phoneW * 0.035));
      const cornerRadius = Math.round(phoneW * 0.096);
      const screenW = phoneW - bezel * 2;
      const screenH = phoneH - bezel * 2;
      const screenRadius = Math.round(cornerRadius * 0.76);

      const vectorApp = createVectorMockupApp(screenW, screenH, palette.primary, palette.accent || '#38bdf8');

      const chassis = new fabric.Rect({
        width: phoneW,
        height: phoneH,
        rx: cornerRadius,
        ry: cornerRadius,
        fill: palette.frameColor || '#0a0d16',
        stroke: '#334155',
        strokeWidth: 3,
        originX: 'center',
        originY: 'top',
        left: 0,
        top: 0,
        shadow: new fabric.Shadow({
          color: 'rgba(0, 0, 0, 0.7)',
          blur: shadowBlur,
          offsetX: shadowOffsetX,
          offsetY: shadowOffsetY,
        }),
      });

      const screenBg = new fabric.Rect({
        width: screenW,
        height: screenH,
        rx: screenRadius,
        ry: screenRadius,
        fill: '#000000',
        originX: 'center',
        originY: 'top',
        left: 0,
        top: bezel,
      });

      vectorApp.set({
        originX: 'center',
        originY: 'top',
        left: 0,
        top: bezel,
      });

      const pillW = phoneW * 0.28;
      const pillH = phoneH * 0.025;
      const dynamicIsland = new fabric.Rect({
        width: pillW,
        height: pillH,
        rx: pillH / 2,
        ry: pillH / 2,
        fill: '#000000',
        stroke: '#1e293b',
        strokeWidth: 1.5,
        originX: 'center',
        originY: 'top',
        left: 0,
        top: bezel + pillH * 0.35,
      });

      const cameraDot = new fabric.Circle({
        radius: pillH * 0.18,
        fill: '#0369a1',
        opacity: 0.7,
        originX: 'center',
        originY: 'center',
        left: pillW * 0.25,
        top: bezel + pillH * 0.35 + pillH / 2,
      });

      const speakerW = phoneW * 0.16;
      const speakerH = 3.5;
      const speaker = new fabric.Rect({
        width: speakerW,
        height: speakerH,
        rx: 2,
        ry: 2,
        fill: '#334155',
        originX: 'center',
        originY: 'top',
        left: 0,
        top: bezel * 0.35,
      });

      const volBtn = new fabric.Rect({
        width: 4,
        height: phoneH * 0.1,
        rx: 2,
        ry: 2,
        fill: '#334155',
        originX: 'right',
        originY: 'top',
        left: -phoneW / 2 + 1,
        top: phoneH * 0.18,
      });

      const powerBtn = new fabric.Rect({
        width: 4,
        height: phoneH * 0.08,
        rx: 2,
        ry: 2,
        fill: '#334155',
        originX: 'left',
        originY: 'top',
        left: phoneW / 2 - 1,
        top: phoneH * 0.22,
      });

      const glassGlow = new fabric.Rect({
        width: screenW,
        height: screenH * 0.35,
        rx: screenRadius,
        ry: screenRadius,
        fill: 'rgba(255, 255, 255, 0.025)',
        originX: 'center',
        originY: 'top',
        left: 0,
        top: bezel,
      });

      const phoneGroup = new fabric.Group(
        [chassis, volBtn, powerBtn, screenBg, vectorApp, glassGlow, dynamicIsland, cameraDot, speaker],
        {
          left: frameLeft,
          top: frameTop,
          originX: 'center',
          originY: 'top',
          angle: frameAngle,
          selectable: true,
        }
      );
      (phoneGroup as any).dataTag = 'screenshot';
      (phoneGroup as any).name = 'Phone Mockup';
      canvas.add(phoneGroup);
    } else {
      const mockupW = screenshotTargetW * 0.88;
      const mockupH = screenshotTargetH * 0.95;
      const vectorApp = createVectorMockupApp(mockupW, mockupH, palette.primary, palette.accent || '#38bdf8');
      vectorApp.set({
        left: frameLeft,
        top: frameTop,
        angle: frameAngle,
        selectable: true,
        shadow: new fabric.Shadow({
          color: 'rgba(0, 0, 0, 0.65)',
          blur: shadowBlur,
          offsetX: shadowOffsetX,
          offsetY: shadowOffsetY,
        }),
      });
      (vectorApp as any).dataTag = 'screenshot';
      (vectorApp as any).name = 'App Mockup';
      canvas.add(vectorApp);
    }
  }

  canvas.renderAll();
}

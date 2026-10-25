import * as fabric from 'fabric';

export interface RichColorOption {
  name: string;
  color: string;
  category: 'neutral' | 'gold' | 'neon' | 'glow';
}

export const RICH_WORD_COLORS: RichColorOption[] = [
  { name: 'Pure White', color: '#ffffff', category: 'neutral' },
  { name: '24K Royal Gold', color: '#fbbf24', category: 'gold' },
  { name: 'Cyber Neon Cyan', color: '#00f5ff', category: 'neon' },
  { name: 'Neon Magenta Pink', color: '#ff007f', category: 'neon' },
  { name: 'Cyber Emerald Mint', color: '#34d399', category: 'glow' },
  { name: 'Cosmic Violet', color: '#c084fc', category: 'glow' },
  { name: 'Solar Flame Orange', color: '#fb923c', category: 'neon' },
  { name: 'Scuderia Crimson', color: '#ef4444', category: 'neon' },
  { name: 'Arctic Glacier Blue', color: '#38bdf8', category: 'glow' },
  { name: 'Acid Matrix Lime', color: '#a3e635', category: 'neon' },
  { name: 'Velvet Rose', color: '#f43f5e', category: 'neon' },
  { name: 'Radiant Amber', color: '#f59e0b', category: 'gold' },
  { name: 'Electric Turquoise', color: '#2dd4bf', category: 'glow' },
  { name: 'Electric Lavender', color: '#e9d5ff', category: 'glow' },
  { name: 'Titanium Silver', color: '#cbd5e1', category: 'neutral' },
  { name: 'Deep Carbon', color: '#1e293b', category: 'neutral' },
];

/**
 * Splits text into words and returns array of words
 */
export function extractWords(text: string): string[] {
  if (!text) return [];
  const words: string[] = [];
  const regex = /\S+/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    words.push(match[0]);
  }
  return words;
}

/**
 * Applies a specific color to a single word in a Fabric Textbox/FabricText
 */
export function applyWordColorToFabricText(
  textObj: fabric.Textbox | fabric.FabricText,
  wordIndex: number,
  color: string
) {
  const text = textObj.text || '';
  const lines = text.split('\n');
  const styles: any = textObj.styles ? JSON.parse(JSON.stringify(textObj.styles)) : {};

  let currentWordIdx = 0;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const lineText = lines[lineIdx];
    if (!styles[lineIdx]) styles[lineIdx] = {};

    const wordRegex = /\S+/g;
    let match: RegExpExecArray | null;

    while ((match = wordRegex.exec(lineText)) !== null) {
      if (currentWordIdx === wordIndex) {
        const start = match.index;
        const end = start + match[0].length;
        for (let c = start; c < end; c++) {
          styles[lineIdx][c] = {
            ...(styles[lineIdx][c] || {}),
            fill: color,
          };
        }
        break;
      }
      currentWordIdx++;
    }
    if (currentWordIdx > wordIndex) break;
  }

  textObj.set({ styles });
  (textObj as any).initDimensions?.();
}

/**
 * Resets all word styles to default uniform color
 */
export function resetFabricTextWordStyles(
  textObj: fabric.Textbox | fabric.FabricText,
  uniformColor?: string
) {
  textObj.set({ styles: {} });
  if (uniformColor) {
    textObj.set({ fill: uniformColor });
  }
  (textObj as any).initDimensions?.();
}

/**
 * Inspects styles of a Fabric Textbox and returns the color of each word index
 */
export function getWordColorsFromFabricText(
  textObj: fabric.Textbox | fabric.FabricText,
  fallbackColor = '#ffffff'
): Record<number, string> {
  const text = textObj.text || '';
  const lines = text.split('\n');
  const styles: any = textObj.styles || {};
  const wordColors: Record<number, string> = {};

  let currentWordIdx = 0;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const lineText = lines[lineIdx];
    const lineStyles = styles[lineIdx] || {};

    const wordRegex = /\S+/g;
    let match: RegExpExecArray | null;

    while ((match = wordRegex.exec(lineText)) !== null) {
      const start = match.index;
      const charStyle = lineStyles[start];
      const color = charStyle?.fill || (textObj.fill as string) || fallbackColor;
      wordColors[currentWordIdx] = color;
      currentWordIdx++;
    }
  }

  return wordColors;
}

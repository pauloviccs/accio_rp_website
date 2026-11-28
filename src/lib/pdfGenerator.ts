import jsPDF from 'jspdf';
import { CharacterApplication } from '../types';
import { HOUSES, WAND_HANDLES, OLLIVANDERS_CORE_LORE } from './constants';
import { formatTicketNumber } from './ticketFormat';
import { supabase } from './supabase';

// Dimensões A4 em milímetros e grade tipográfica (conforme .agent/skills/pdf-editorial-design.md)
const PAGE_W = 210;
const PAGE_H = 297;
const CENTER_X = PAGE_W / 2;
const MARGIN_X = 17;
const CONTENT_W = PAGE_W - MARGIN_X * 2; // 176 mm
const SAFE_BOTTOM_Y = 270;
const FOOTER_LINE_Y = 276.5;
const FOOTER_TEXT_Y = 281.2;

const SEAL_MINISTRY_URL = '/assets/seals/ministry-of-magic-seal.png';
const SEAL_HOGWARTS_URL = '/assets/seals/hogwarts-crest.png';

interface FontAsset {
  file: string;
  family: string;
  style: 'normal' | 'bold' | 'italic';
}

const FONT_ASSETS: FontAsset[] = [
  { file: 'Cinzel-400-normal.ttf', family: 'Cinzel', style: 'normal' },
  { file: 'Cinzel-700-normal.ttf', family: 'Cinzel', style: 'bold' },
  { file: 'EBGaramond-400-normal.ttf', family: 'EBGaramond', style: 'normal' },
  { file: 'EBGaramond-400-italic.ttf', family: 'EBGaramond', style: 'italic' },
  { file: 'EBGaramond-700-normal.ttf', family: 'EBGaramond', style: 'bold' },
  { file: 'SourceSans3-400-normal.ttf', family: 'SourceSans3', style: 'normal' },
  { file: 'SourceSans3-600-normal.ttf', family: 'SourceSans3', style: 'bold' },
  { file: 'JetBrainsMono-400-normal.ttf', family: 'JetBrainsMono', style: 'normal' },
  { file: 'JetBrainsMono-700-normal.ttf', family: 'JetBrainsMono', style: 'bold' },
];

export interface LoadedImageAsset {
  dataUrl: string;
  width: number;
  height: number;
}

export interface PdfBuildAssets {
  fonts: Record<string, string>;
  parchmentBg: string | null;
  watermarkCrest: LoadedImageAsset | null;
  hogwartsCrest: LoadedImageAsset | null;
  ministrySeal: LoadedImageAsset | null;
  houseEmblem: LoadedImageAsset | null;
  wandHandle: LoadedImageAsset | null;
  wandSketch: LoadedImageAsset | null;
}

const fontBase64Cache = new Map<string, string>();
let parchmentDataUrlCache: string | null = null;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

async function fetchFontBase64(file: string): Promise<string | null> {
  if (fontBase64Cache.has(file)) {
    return fontBase64Cache.get(file) || null;
  }
  try {
    const res = await fetch(`/fonts/${file}`);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const b64 = arrayBufferToBase64(buf);
    fontBase64Cache.set(file, b64);
    return b64;
  } catch {
    return null;
  }
}

async function loadImageViaCanvas(
  url: string,
  opacity: number = 1,
  maxSidePx: number = 900
): Promise<LoadedImageAsset | null> {
  if (!url || typeof document === 'undefined') return null;
  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    await new Promise<void>((resolve, reject) => {
      if (img.complete && img.naturalWidth > 0) {
        resolve();
        return;
      }
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Image load failed: ${url}`));
    });
    if (typeof img.decode === 'function') {
      await img.decode().catch(() => {});
    }
    const natW = img.naturalWidth || img.width;
    const natH = img.naturalHeight || img.height;
    if (!natW || !natH) return null;

    const scale = Math.min(1, maxSidePx / Math.max(natW, natH));
    const w = Math.max(1, Math.round(natW * scale));
    const h = Math.max(1, Math.round(natH * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
    ctx.drawImage(img, 0, 0, w, h);
    return {
      dataUrl: canvas.toDataURL('image/png'),
      width: w,
      height: h,
    };
  } catch {
    return null;
  }
}

function createParchmentBackgroundDataUrl(): string | null {
  if (parchmentDataUrlCache) return parchmentDataUrlCache;
  if (typeof document === 'undefined') return null;

  const w = 794;
  const h = 1123;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const grad = ctx.createRadialGradient(w * 0.5, h * 0.44, 60, w * 0.5, h * 0.5, h * 0.72);
  grad.addColorStop(0, '#FCF6E4');
  grad.addColorStop(0.68, '#F2E3BE');
  grad.addColorStop(1, '#DFC890');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Grão sutil determinístico de pergaminho antigo
  let seed = 4219;
  const nextRand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
  for (let i = 0; i < 4200; i += 1) {
    const x = nextRand() * w;
    const y = nextRand() * h;
    const r = 0.4 + nextRand() * 1.1;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(115, 62, 16, 0.028)' : 'rgba(255, 252, 240, 0.04)';
    ctx.fillRect(x, y, r, r);
  }

  parchmentDataUrlCache = canvas.toDataURL('image/jpeg', 0.85);
  return parchmentDataUrlCache;
}

function parseHexColor(hex: string, fallback: [number, number, number] = [59, 18, 7]): [number, number, number] {
  const clean = String(hex || '').trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return fallback;
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function fitInsideBox(img: LoadedImageAsset, maxW: number, maxH: number): { w: number; h: number } {
  const ratio = img.width / Math.max(1, img.height);
  let w = maxW;
  let h = w / ratio;
  if (h > maxH) {
    h = maxH;
    w = h * ratio;
  }
  return { w, h };
}

function formatBloodStatus(blood: string): string {
  if (blood === 'pure-blood') return 'Sangue-Puro';
  if (blood === 'half-blood') return 'Mestiço';
  if (blood === 'muggle-born') return 'Nascido-Trouxa';
  return blood || 'Não informado';
}

function formatDormitory(dorm?: string): string {
  if (dorm === 'witch') return 'Bruxa (Ala Feminina)';
  if (dorm === 'wizard') return 'Bruxo (Ala Masculina)';
  return 'A definir no Chapéu/Criador';
}

function formatHouseDisplay(app: CharacterApplication) {
  const activeKey =
    (app.sorted_house && HOUSES[app.sorted_house as keyof typeof HOUSES] ? app.sorted_house : null) ||
    app.preferred_house;
  const info = HOUSES[activeKey as keyof typeof HOUSES] || HOUSES.gryffindor;
  const isOfficialSorted = Boolean(app.sorted_house && HOUSES[app.sorted_house as keyof typeof HOUSES]);
  return { info, isOfficialSorted };
}

function drawCornerOrnament(pdf: jsPDF, cx: number, cy: number, dx: number, dy: number) {
  pdf.setDrawColor(138, 90, 27);
  pdf.setLineWidth(0.35);
  // Cantoneira em L
  pdf.line(cx, cy, cx + dx * 4.5, cy);
  pdf.line(cx, cy, cx, cy + dy * 4.5);
  // Estrela de 4 pontas minimalista
  const sx = cx + dx * 1.4;
  const sy = cy + dy * 1.4;
  pdf.setFillColor(138, 90, 27);
  pdf.circle(sx, sy, 0.55, 'F');
}

function drawPageShell(
  pdf: jsPDF,
  assets: PdfBuildAssets,
  options: { isContinuation?: boolean; characterName?: string; ticketNum?: string }
) {
  if (assets.parchmentBg) {
    pdf.addImage(assets.parchmentBg, 'JPEG', 0, 0, PAGE_W, PAGE_H, 'parchment-bg', 'FAST');
  } else {
    pdf.setFillColor(246, 236, 206);
    pdf.rect(0, 0, PAGE_W, PAGE_H, 'F');
  }

  // Marca d'água central com Brasão Canônico de Hogwarts
  if (assets.watermarkCrest) {
    const fitted = fitInsideBox(assets.watermarkCrest, 112, 134);
    pdf.addImage(
      assets.watermarkCrest.dataUrl,
      'PNG',
      CENTER_X - fitted.w / 2,
      PAGE_H / 2 - fitted.h / 2,
      fitted.w,
      fitted.h,
      'hogwarts-watermark',
      'FAST'
    );
  }

  // Moldura externa bordô escuro e filete duplo dourado
  pdf.setDrawColor(59, 18, 7);
  pdf.setLineWidth(3.0);
  pdf.rect(6.5, 6.5, PAGE_W - 13, PAGE_H - 13);

  pdf.setDrawColor(196, 151, 59);
  pdf.setLineWidth(0.45);
  pdf.rect(10.5, 10.5, PAGE_W - 21, PAGE_H - 21);

  pdf.setDrawColor(212, 190, 130);
  pdf.setLineWidth(0.22);
  pdf.rect(12.2, 12.2, PAGE_W - 24.4, PAGE_H - 24.4);

  // Cantoneiras ornamentais internas
  drawCornerOrnament(pdf, 13.5, 13.5, 1, 1);
  drawCornerOrnament(pdf, PAGE_W - 13.5, 13.5, -1, 1);
  drawCornerOrnament(pdf, 13.5, PAGE_H - 13.5, 1, -1);
  drawCornerOrnament(pdf, PAGE_W - 13.5, PAGE_H - 13.5, -1, -1);

  if (options.isContinuation) {
    pdf.setFont('Cinzel', 'bold');
    pdf.setFontSize(8.2);
    pdf.setTextColor(115, 62, 16);
    pdf.text('LIVRO DA ADMISSÃO  ·  CRÔNICA INTEGRAL DO ESTUDANTE', MARGIN_X, 19);

    pdf.setFont('JetBrainsMono', 'bold');
    pdf.setFontSize(7.6);
    pdf.setTextColor(82, 39, 14);
    pdf.text(`${options.characterName || 'Estudante'}  ·  ${options.ticketNum || '#ACCIO'}`, PAGE_W - MARGIN_X, 19, {
      align: 'right',
    });

    pdf.setDrawColor(196, 151, 59);
    pdf.setLineWidth(0.3);
    pdf.line(MARGIN_X, 21.5, PAGE_W - MARGIN_X, 21.5);
  }
}

function drawCheckBadge(pdf: jsPDF, rightX: number, centerY: number, label: string) {
  pdf.setFont('SourceSans3', 'bold');
  pdf.setFontSize(7.6);
  const textW = pdf.getTextWidth(label);
  const padL = 5.4;
  const padR = 2.6;
  const badgeW = textW + padL + padR;
  const badgeH = 5.2;
  const bx = rightX - badgeW;
  const by = centerY - badgeH / 2;

  pdf.setFillColor(232, 245, 234);
  pdf.setDrawColor(46, 107, 52);
  pdf.setLineWidth(0.25);
  pdf.roundedRect(bx, by, badgeW, badgeH, 1.2, 1.2, 'FD');

  // Check vetorial (evita dependência de glifo U+2713 em fontes TTF)
  pdf.setDrawColor(35, 92, 43);
  pdf.setLineWidth(0.45);
  pdf.line(bx + 1.8, centerY + 0.1, bx + 2.5, centerY + 0.9);
  pdf.line(bx + 2.5, centerY + 0.9, bx + 3.9, centerY - 0.9);

  pdf.setTextColor(35, 92, 43);
  pdf.text(label, bx + padL, centerY, { baseline: 'middle' });
}

interface WrappedParagraph {
  lines: string[];
}

function buildWrappedParagraphs(pdf: jsPDF, rawText: string, maxWidth: number): WrappedParagraph[] {
  const normalized = String(rawText || '').replace(/\r\n/g, '\n').trim();
  if (!normalized) {
    return [{ lines: ['(Crônica pessoal ainda não redigida pelo estudante.)'] }];
  }
  const blocks = normalized.split(/\n\s*\n+|\n/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block) => ({
    lines: pdf.splitTextToSize(block, maxWidth) as string[],
  }));
}

function drawChronicleLineWithParagraphGap(
  paragraphs: WrappedParagraph[]
): Array<{ text: string; isParaStart: boolean; isParaEnd: boolean; paraIndex: number; paraLength: number; lineInPara: number }> {
  const flat: Array<{ text: string; isParaStart: boolean; isParaEnd: boolean; paraIndex: number; paraLength: number; lineInPara: number }> = [];
  paragraphs.forEach((para, paraIndex) => {
    const len = para.lines.length;
    para.lines.forEach((line, idx) => {
      flat.push({
        text: line,
        isParaStart: idx === 0,
        isParaEnd: idx === len - 1,
        paraIndex,
        paraLength: len,
        lineInPara: idx,
      });
    });
  });
  return flat;
}

function findCleanPageEnd(
  lines: Array<{ isParaStart: boolean; isParaEnd: boolean; paraLength: number; lineInPara: number }>,
  startIdx: number,
  maxEndIdx: number
): number {
  if (maxEndIdx >= lines.length) return lines.length;
  let endIdx = maxEndIdx;
  const lastOnPage = lines[endIdx - 1];
  if (lastOnPage && !lastOnPage.isParaEnd) {
    const linesOnThisPageForPara = lastOnPage.lineInPara + 1;
    const remainingLinesForPara = lastOnPage.paraLength - linesOnThisPageForPara;
    // Anti-órfã: evitar deixar apenas 1–2 linhas do novo parágrafo no fim da página
    if (linesOnThisPageForPara < 3 && lastOnPage.paraLength >= 3 && endIdx - linesOnThisPageForPara > startIdx) {
      endIdx -= linesOnThisPageForPara;
    } else if (remainingLinesForPara > 0 && remainingLinesForPara < 3 && endIdx - startIdx >= 5) {
      // Anti-viúva: recuar 1–2 linhas para não isolar < 3 linhas na próxima página
      const pull = 3 - remainingLinesForPara;
      if (endIdx - pull > startIdx + 2) {
        endIdx -= pull;
      }
    }
  }
  return Math.max(startIdx + 1, endIdx);
}

/**
 * Constrói o documento jsPDF multi-página vetorial com medições exatas
 * para nunca cortar nem sobrepor nenhum texto ou elemento.
 */
export async function buildCharacterPdfDocument(
  app: CharacterApplication,
  assets: PdfBuildAssets
): Promise<jsPDF> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  // Registrar fontes TTF embarcadas (quando disponíveis)
  for (const font of FONT_ASSETS) {
    const b64 = assets.fonts[font.file];
    if (b64) {
      pdf.addFileToVFS(font.file, b64);
      pdf.addFont(font.file, font.family, font.style);
    }
  }

  const { info: houseInfo, isOfficialSorted } = formatHouseDisplay(app);
  const wandHandle =
    WAND_HANDLES.find((w) => w.name === app.wand_handle || w.id === app.wand_handle) || WAND_HANDLES[0];
  const ticketNum = formatTicketNumber(app);
  const coreDescription =
    OLLIVANDERS_CORE_LORE[app.wand_core] || 'Núcleo dotado de extraordinária ressonância mágica.';
  const fullName = `${app.first_name || ''} ${app.last_name || ''}`.trim() || 'Bruxo Sem Nome';
  const wordCount = Number(app.word_count) || 0;

  // ═══════════════════════════════════════════════════════════════
  // PÁGINA 1: FICHA OFICIAL DE MATRÍCULA & SELO MINISTERIAL
  // ═══════════════════════════════════════════════════════════════
  drawPageShell(pdf, assets, { isContinuation: false, characterName: fullName, ticketNum });

  let y = 16.5;

  // 1. Selo Oficial do Ministério da Magia (Topo)
  if (assets.ministrySeal) {
    const fitted = fitInsideBox(assets.ministrySeal, 22, 12.5);
    pdf.addImage(
      assets.ministrySeal.dataUrl,
      'PNG',
      CENTER_X - fitted.w / 2,
      y,
      fitted.w,
      fitted.h,
      'ministry-seal',
      'FAST'
    );
    y += fitted.h + 2.5;
  } else {
    y += 1.5;
  }

  // Cabeçalho Institucional Centralizado
  pdf.setFont('Cinzel', 'bold');
  pdf.setFontSize(7.6);
  pdf.setTextColor(115, 62, 16);
  pdf.text('MINISTÉRIO DA MAGIA  ·  DEPARTAMENTO DE EDUCAÇÃO MÁGICA', CENTER_X, y + 2.5, { align: 'center' });
  y += 6.2;

  pdf.setFont('Cinzel', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(59, 18, 7);
  const titleLines = pdf.splitTextToSize('ESCOLA DE MAGIA E BRUXARIA DE HOGWARTS', CONTENT_W - 8) as string[];
  pdf.text(titleLines, CENTER_X, y + 3.8, { align: 'center', lineHeightFactor: 1.15 });
  y += titleLines.length * 6.5 + 1.2;

  pdf.setFont('EBGaramond', 'italic');
  pdf.setFontSize(10.2);
  pdf.setTextColor(82, 39, 14);
  pdf.text('Registro Oficial de Matrícula & Livro da Admissão · Turma dos Anos 2000', CENTER_X, y + 2.2, {
    align: 'center',
  });
  y += 5.4;

  // Pílula Centralizada do Bilhete Oficial
  pdf.setFont('JetBrainsMono', 'bold');
  pdf.setFontSize(8.2);
  const pillText = `BILHETE OFICIAL DO EXPRESSO: ${ticketNum}`;
  const pillW = Math.max(76, pdf.getTextWidth(pillText) + 14);
  const pillH = 6.2;
  pdf.setFillColor(59, 18, 7);
  pdf.setDrawColor(196, 151, 59);
  pdf.setLineWidth(0.35);
  pdf.roundedRect(CENTER_X - pillW / 2, y, pillW, pillH, 1.4, 1.4, 'FD');
  pdf.setTextColor(255, 213, 128);
  pdf.text(pillText, CENTER_X, y + pillH / 2, { align: 'center', baseline: 'middle' });
  y += pillH + 3.5;

  // Divisor duplo dourado abaixo do cabeçalho
  pdf.setDrawColor(138, 90, 27);
  pdf.setLineWidth(0.45);
  pdf.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
  pdf.setDrawColor(196, 151, 59);
  pdf.setLineWidth(0.18);
  pdf.line(MARGIN_X, y + 1.0, PAGE_W - MARGIN_X, y + 1.0);
  y += 4.5;

  // 2. Bloco Principal 2 Colunas (Identidade | Casa) — Medição Simétrica
  const colGap = 5;
  const leftW = 101;
  const rightW = CONTENT_W - leftW - colGap; // 70 mm
  const leftX = MARGIN_X;
  const rightX = MARGIN_X + leftW + colGap;

  // Medir conteúdo da Coluna Esquerda (Identidade)
  const cardPad = 4.5;
  const leftInnerW = leftW - cardPad * 2;
  const halfInnerW = (leftInnerW - 4) / 2;

  pdf.setFont('EBGaramond', 'bold');
  pdf.setFontSize(13.5);
  const nameLines = pdf.splitTextToSize(fullName, leftInnerW) as string[];

  pdf.setFont('SourceSans3', 'bold');
  pdf.setFontSize(9.2);
  const birthLines = pdf.splitTextToSize(app.birth_date || 'Não informada', halfInnerW) as string[];
  const originLines = pdf.splitTextToSize(app.birth_place || 'Grã-Bretanha', halfInnerW) as string[];
  const dormLines = pdf.splitTextToSize(formatDormitory(app.dormitory), halfInnerW) as string[];
  const bloodLines = pdf.splitTextToSize(formatBloodStatus(app.blood_status), halfInnerW) as string[];
  const patronusLines = pdf.splitTextToSize(app.patronus || 'Em despertar interior', leftInnerW) as string[];

  pdf.setFont('JetBrainsMono', 'normal');
  pdf.setFontSize(7.8);
  const discordLabel = `@${app.discord_username || 'bruxo'} (${app.discord_id || 'N/D'})`;
  const discordLines = pdf.splitTextToSize(discordLabel, leftInnerW) as string[];

  const row1Lines = Math.max(birthLines.length, originLines.length);
  const row2Lines = Math.max(dormLines.length, bloodLines.length);

  const leftContentH =
    cardPad +
    6.5 + // título da seção
    3.5 + nameLines.length * 5.2 + 2.5 +
    3.5 + row1Lines * 4.2 + 2.2 +
    3.5 + row2Lines * 4.2 + 2.2 +
    3.5 + patronusLines.length * 4.2 + 2.2 +
    3.5 + discordLines.length * 3.8 +
    cardPad;

  // Medir conteúdo da Coluna Direita (Casa)
  const rightInnerW = rightW - cardPad * 2;
  pdf.setFont('EBGaramond', 'italic');
  pdf.setFontSize(9.0);
  const mottoLines = pdf.splitTextToSize(`"${houseInfo.motto}"`, rightInnerW - 2) as string[];
  pdf.setFont('SourceSans3', 'normal');
  pdf.setFontSize(8.0);
  const traitsText = houseInfo.traits.join('  •  ');
  const traitsLines = pdf.splitTextToSize(traitsText, rightInnerW - 6) as string[];
  const traitsBoxH = 5.5 + traitsLines.length * 3.8 + 2.5;

  const rightContentH =
    cardPad +
    6.5 + // título
    18.5 + // emblema + respiro
    6.2 + // nome da casa
    mottoLines.length * 3.9 + 3.5 +
    traitsBoxH +
    cardPad;

  const pairCardH = Math.max(leftContentH, rightContentH);

  // Desenhar fundo e borda simétricos das duas colunas
  for (const [bx, bw] of [[leftX, leftW], [rightX, rightW]] as const) {
    pdf.setFillColor(253, 249, 238);
    pdf.setDrawColor(196, 151, 59);
    pdf.setLineWidth(0.32);
    pdf.roundedRect(bx, y, bw, pairCardH, 1.5, 1.5, 'FD');
  }

  // Conteúdo Esquerdo: Identidade
  let ly = y + cardPad;
  const lx = leftX + cardPad;
  pdf.setFont('Cinzel', 'bold');
  pdf.setFontSize(8.4);
  pdf.setTextColor(115, 62, 16);
  pdf.text('IDENTIDADE DO ESTUDANTE', lx, ly + 3.2);
  pdf.setDrawColor(212, 190, 130);
  pdf.setLineWidth(0.22);
  pdf.line(lx, ly + 5.2, leftX + leftW - cardPad, ly + 5.2);
  ly += 7.5;

  const drawField = (
    fx: number,
    fy: number,
    label: string,
    lines: string[],
    fontFamily: string,
    fontStyle: 'normal' | 'bold' | 'italic',
    fontSize: number,
    lineStep: number,
    color: [number, number, number] = [43, 20, 8]
  ) => {
    pdf.setFont('SourceSans3', 'bold');
    pdf.setFontSize(6.9);
    pdf.setTextColor(115, 62, 16);
    pdf.text(label.toUpperCase(), fx, fy + 2.3);
    pdf.setFont(fontFamily, fontStyle);
    pdf.setFontSize(fontSize);
    pdf.setTextColor(...color);
    pdf.text(lines, fx, fy + 5.8, { lineHeightFactor: 1.2 });
    return fy + 3.5 + lines.length * lineStep;
  };

  ly = drawField(lx, ly, 'Nome Completo', nameLines, 'EBGaramond', 'bold', 13.5, 5.2);
  ly += 2.0;

  const col2X = lx + halfInnerW + 4;
  const r1a = drawField(lx, ly, 'Nascimento', birthLines, 'SourceSans3', 'bold', 9.0, 4.2);
  const r1b = drawField(col2X, ly, 'Local de Origem', originLines, 'SourceSans3', 'bold', 9.0, 4.2);
  ly = Math.max(r1a, r1b) + 2.0;

  const r2a = drawField(lx, ly, 'Dormitório', dormLines, 'SourceSans3', 'bold', 8.8, 4.2);
  const r2b = drawField(col2X, ly, 'Linhagem Sanguínea', bloodLines, 'SourceSans3', 'bold', 8.8, 4.2);
  ly = Math.max(r2a, r2b) + 2.0;

  ly = drawField(lx, ly, 'Patrono', patronusLines, 'SourceSans3', 'bold', 8.8, 4.2);
  ly += 2.0;
  drawField(lx, ly, 'Identificador Discord', discordLines, 'JetBrainsMono', 'normal', 7.6, 3.8, [74, 35, 13]);

  // Conteúdo Direito: Casa
  let ry = y + cardPad;
  const rxCenter = rightX + rightW / 2;
  pdf.setFont('Cinzel', 'bold');
  pdf.setFontSize(8.4);
  pdf.setTextColor(115, 62, 16);
  pdf.text(isOfficialSorted ? 'CASA OFICIAL (CHAPÉU)' : 'CASA PRETENDIDA', rxCenter, ry + 3.2, { align: 'center' });
  pdf.setDrawColor(212, 190, 130);
  pdf.setLineWidth(0.22);
  pdf.line(rightX + cardPad, ry + 5.2, rightX + rightW - cardPad, ry + 5.2);
  ry += 7.5;

  if (assets.houseEmblem) {
    const fitted = fitInsideBox(assets.houseEmblem, 17, 17);
    pdf.addImage(
      assets.houseEmblem.dataUrl,
      'PNG',
      rxCenter - fitted.w / 2,
      ry,
      fitted.w,
      fitted.h,
      'house-emblem',
      'FAST'
    );
    ry += fitted.h + 2.2;
  } else {
    ry += 16;
  }

  const houseRgb = parseHexColor(houseInfo.color, [115, 62, 16]);
  pdf.setFont('Cinzel', 'bold');
  pdf.setFontSize(13.5);
  pdf.setTextColor(...houseRgb);
  pdf.text(houseInfo.name, rxCenter, ry + 4.0, { align: 'center' });
  ry += 6.8;

  pdf.setFont('EBGaramond', 'italic');
  pdf.setFontSize(8.8);
  pdf.setTextColor(97, 54, 18);
  pdf.text(mottoLines, rxCenter, ry + 2.5, { align: 'center', lineHeightFactor: 1.2 });
  ry += mottoLines.length * 3.9 + 3.2;

  const pillVirtuesY = y + pairCardH - cardPad - traitsBoxH;
  pdf.setFillColor(235, 214, 167);
  pdf.setDrawColor(196, 151, 59);
  pdf.setLineWidth(0.22);
  pdf.roundedRect(rightX + cardPad, pillVirtuesY, rightInnerW, traitsBoxH, 1.2, 1.2, 'FD');
  pdf.setFont('SourceSans3', 'bold');
  pdf.setFontSize(7.2);
  pdf.setTextColor(59, 18, 7);
  pdf.text('Virtudes Cardeais:', rxCenter, pillVirtuesY + 3.6, { align: 'center' });
  pdf.setFont('SourceSans3', 'normal');
  pdf.setFontSize(7.8);
  pdf.text(traitsLines, rxCenter, pillVirtuesY + 7.4, { align: 'center', lineHeightFactor: 1.2 });

  y += pairCardH + 4.5;

  // 3. Painel da Varinha (Oficina Ollivanders)
  const wandVisualBox = 20;
  const wandLeftBlockW = wandVisualBox * 2 + 2.5;
  const wandSpecsX = MARGIN_X + cardPad + wandLeftBlockW + 5;
  const wandSpecsW = CONTENT_W - cardPad * 2 - wandLeftBlockW - 5;

  pdf.setFont('SourceSans3', 'normal');
  pdf.setFontSize(8.8);
  const specRows: Array<[string, string]> = [
    ['Modelo do Cabo:', `${wandHandle.name} (${wandHandle.colorName})`],
    ['Madeira do Fuste:', app.wand_wood || 'Carvalho Inglês'],
    ['Núcleo Mágico:', app.wand_core || 'Pena de Fênix'],
    ['Comprimento & Flexibilidade:', `${app.wand_length || '11 polegadas'} · ${app.wand_flexibility || 'Firme'}`],
  ];

  const wrappedSpecs = specRows.map(([k, v]) => {
    pdf.setFont('SourceSans3', 'bold');
    const kw = pdf.getTextWidth(`${k} `);
    pdf.setFont('SourceSans3', 'normal');
    const valLines = pdf.splitTextToSize(v, Math.max(40, wandSpecsW - kw)) as string[];
    return { k, kw, valLines };
  });

  pdf.setFont('EBGaramond', 'italic');
  pdf.setFontSize(8.9);
  const loreLines = pdf.splitTextToSize(`"${coreDescription}"`, wandSpecsW) as string[];

  const specsTotalH =
    wrappedSpecs.reduce((acc, r) => acc + Math.max(1, r.valLines.length) * 4.0, 0) +
    1.8 +
    loreLines.length * 3.8;

  const wandBodyH = Math.max(wandVisualBox + 1, specsTotalH);
  const wandBoxH = cardPad + 7.2 + wandBodyH + cardPad;

  pdf.setFillColor(253, 249, 238);
  pdf.setDrawColor(196, 151, 59);
  pdf.setLineWidth(0.32);
  pdf.roundedRect(MARGIN_X, y, CONTENT_W, wandBoxH, 1.5, 1.5, 'FD');

  pdf.setFont('Cinzel', 'bold');
  pdf.setFontSize(8.4);
  pdf.setTextColor(115, 62, 16);
  pdf.text('VARINHA DO BRUXO  ·  FABRICAÇÃO DE OLLIVANDERS (BECO DIAGONAL)', MARGIN_X + cardPad, y + cardPad + 3.2);
  pdf.setDrawColor(212, 190, 130);
  pdf.setLineWidth(0.22);
  pdf.line(MARGIN_X + cardPad, y + cardPad + 5.2, PAGE_W - MARGIN_X - cardPad, y + cardPad + 5.2);

  const wandContentTopY = y + cardPad + 7.5;
  const img1X = MARGIN_X + cardPad;
  const img2X = img1X + wandVisualBox + 2.5;
  const imgY = wandContentTopY + (wandBodyH - wandVisualBox) / 2;

  // Caixa 1: Cabo 3D
  pdf.setFillColor(43, 20, 8);
  pdf.setDrawColor(138, 90, 27);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(img1X, imgY, wandVisualBox, wandVisualBox, 1.2, 1.2, 'FD');
  if (assets.wandHandle) {
    const f = fitInsideBox(assets.wandHandle, wandVisualBox - 2.4, wandVisualBox - 2.4);
    pdf.addImage(
      assets.wandHandle.dataUrl,
      'PNG',
      img1X + (wandVisualBox - f.w) / 2,
      imgY + (wandVisualBox - f.h) / 2,
      f.w,
      f.h,
      'wand-handle',
      'FAST'
    );
  }

  // Caixa 2: Esboço Guia de Campo
  pdf.setFillColor(223, 205, 164);
  pdf.setDrawColor(138, 90, 27);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(img2X, imgY, wandVisualBox, wandVisualBox, 1.2, 1.2, 'FD');
  if (assets.wandSketch) {
    const f = fitInsideBox(assets.wandSketch, wandVisualBox - 2.4, wandVisualBox - 2.4);
    pdf.addImage(
      assets.wandSketch.dataUrl,
      'PNG',
      img2X + (wandVisualBox - f.w) / 2,
      imgY + (wandVisualBox - f.h) / 2,
      f.w,
      f.h,
      'wand-sketch',
      'FAST'
    );
  }

  let sy = wandContentTopY + 2.6;
  for (const row of wrappedSpecs) {
    pdf.setFont('SourceSans3', 'bold');
    pdf.setFontSize(8.7);
    pdf.setTextColor(43, 20, 8);
    pdf.text(row.k, wandSpecsX, sy);
    pdf.setFont('SourceSans3', 'normal');
    pdf.text(row.valLines, wandSpecsX + row.kw, sy, { lineHeightFactor: 1.2 });
    sy += Math.max(1, row.valLines.length) * 4.0;
  }
  sy += 1.4;
  pdf.setFont('EBGaramond', 'italic');
  pdf.setFontSize(8.9);
  pdf.setTextColor(94, 50, 17);
  pdf.text(loreLines, wandSpecsX, sy, { lineHeightFactor: 1.2 });

  y += wandBoxH + 4.5;

  // 4. Reservar Rodapé Ministerial na Página 1 (y = 246..271)
  const page1FooterTopY = 247.5;
  const chronicleAvailableH = page1FooterTopY - 4.0 - y;

  // Preparar linhas integrais da Crônica (NUNCA cortar palavras nem fatiar linhas)
  const chronicleTextW = CONTENT_W - cardPad * 2;
  pdf.setFont('EBGaramond', 'normal');
  pdf.setFontSize(10.0);
  const paragraphs = buildWrappedParagraphs(pdf, app.character_backstory, chronicleTextW);
  const flatLines = drawChronicleLineWithParagraphGap(paragraphs);
  const chronicleLineH = 4.45;
  const paraGapH = 1.6;

  // Calcular quantas linhas cabem integralmente na caixa da Página 1
  const headerAndNoticeH = cardPad + 7.5 + 5.5 + cardPad;
  const innerBudget = chronicleAvailableH - headerAndNoticeH;

  let usedOnPage1H = 0;
  let splitIndex = 0;
  for (let i = 0; i < flatLines.length; i += 1) {
    const extraGap = flatLines[i].isParaEnd && i < flatLines.length - 1 ? paraGapH : 0;
    if (usedOnPage1H + chronicleLineH + extraGap <= innerBudget) {
      usedOnPage1H += chronicleLineH + extraGap;
      splitIndex = i + 1;
    } else {
      break;
    }
  }

  // Regra anti-órfãs: se não couberem pelo menos 4 linhas na Página 1, iniciar crônica limpa na Página 2
  const hasChronicleBoxOnPage1 = splitIndex >= 4 || flatLines.length <= 4;
  if (hasChronicleBoxOnPage1 && splitIndex > 0) {
    // Se sobrar 1 ou 2 linhas para a página 2 (viúvas), recuar 2 linhas para manter equilíbrio
    if (flatLines.length - splitIndex > 0 && flatLines.length - splitIndex < 3 && splitIndex >= 6) {
      splitIndex -= 2;
    }

    const boxH = chronicleAvailableH;
    pdf.setFillColor(253, 249, 238);
    pdf.setDrawColor(196, 151, 59);
    pdf.setLineWidth(0.32);
    pdf.roundedRect(MARGIN_X, y, CONTENT_W, boxH, 1.5, 1.5, 'FD');

    const chX = MARGIN_X + cardPad;
    const chHeaderY = y + cardPad + 2.6;
    pdf.setFont('Cinzel', 'bold');
    pdf.setFontSize(8.4);
    pdf.setTextColor(115, 62, 16);
    pdf.text('CRÔNICA LAVRADA NO LIVRO DA ADMISSÃO', chX, chHeaderY + 0.6);

    drawCheckBadge(
      pdf,
      PAGE_W - MARGIN_X - cardPad,
      chHeaderY,
      `${wordCount.toLocaleString('pt-BR')} Palavras Aprovadas`
    );

    pdf.setDrawColor(212, 190, 130);
    pdf.setLineWidth(0.22);
    pdf.line(chX, y + cardPad + 5.8, PAGE_W - MARGIN_X - cardPad, y + cardPad + 5.8);

    let cy = y + cardPad + 9.8;
    pdf.setFont('EBGaramond', 'normal');
    pdf.setFontSize(10.0);
    pdf.setTextColor(43, 20, 8);

    for (let i = 0; i < splitIndex; i += 1) {
      const item = flatLines[i];
      pdf.text(item.text, chX, cy);
      cy += chronicleLineH;
      if (item.isParaEnd && i < splitIndex - 1) {
        cy += paraGapH;
      }
    }

    const hasMorePages = splitIndex < flatLines.length;
    pdf.setFont('SourceSans3', 'bold');
    pdf.setFontSize(7.6);
    pdf.setTextColor(115, 62, 16);
    const noticeText = hasMorePages
      ? `Continua integralmente na Página 2  ·  Crônica completa de ${wordCount.toLocaleString('pt-BR')} palavras sem cortes`
      : `(Crônica integral com ${wordCount.toLocaleString('pt-BR')} palavras arquivada sob o selo de confidencialidade ministerial)`;
    pdf.text(noticeText, PAGE_W - MARGIN_X - cardPad, y + boxH - cardPad + 0.5, { align: 'right' });
  } else {
    splitIndex = 0;
  }

  // 5. Rodapé Oficial de Certificação da Página 1 (Selo Canônico de Hogwarts + Assinaturas)
  pdf.setDrawColor(138, 90, 27);
  pdf.setLineWidth(0.45);
  pdf.line(MARGIN_X, page1FooterTopY, PAGE_W - MARGIN_X, page1FooterTopY);

  const sealCenterX = MARGIN_X + 9.5;
  const sealCenterY = page1FooterTopY + 12.2;

  // Anel carmesim e dourado ao redor do Brasão Canônico de Hogwarts
  pdf.setFillColor(122, 16, 16);
  pdf.setDrawColor(212, 168, 68);
  pdf.setLineWidth(0.65);
  pdf.circle(sealCenterX, sealCenterY, 9.2, 'FD');

  if (assets.hogwartsCrest) {
    const f = fitInsideBox(assets.hogwartsCrest, 15.2, 15.2);
    pdf.addImage(
      assets.hogwartsCrest.dataUrl,
      'PNG',
      sealCenterX - f.w / 2,
      sealCenterY - f.h / 2,
      f.w,
      f.h,
      'hogwarts-seal',
      'FAST'
    );
  }

  const sealTextX = MARGIN_X + 22;
  pdf.setFont('Cinzel', 'bold');
  pdf.setFontSize(8.2);
  pdf.setTextColor(59, 18, 7);
  pdf.text('SELO MINISTERIAL DE HOGWARTS', sealTextX, page1FooterTopY + 8.5);

  pdf.setFont('SourceSans3', 'normal');
  pdf.setFontSize(7.8);
  pdf.setTextColor(115, 62, 16);
  pdf.text(`Lavrado em ${new Date().toLocaleDateString('pt-BR')}`, sealTextX, page1FooterTopY + 12.8);

  pdf.setFillColor(46, 138, 86);
  pdf.circle(sealTextX + 1.0, page1FooterTopY + 16.4, 0.9, 'F');
  pdf.setFont('SourceSans3', 'bold');
  pdf.setFontSize(6.9);
  pdf.setTextColor(46, 138, 86);
  pdf.text('REGISTRO PERSISTENTE ARCANE MP', sealTextX + 3.0, page1FooterTopY + 16.5, { baseline: 'middle' });

  // Assinaturas Canônicas (alinhamento com folga segura acima da linha)
  const sigLineY = page1FooterTopY + 14.5;
  const sigW = 46;
  const sig2Center = PAGE_W - MARGIN_X - sigW / 2;
  const sig1Center = sig2Center - sigW - 7;

  for (const [cx, nameTxt, roleTxt] of [
    [sig1Center, 'Aurelian Vale Diggory', 'DIRETOR DE HOGWARTS'],
    [sig2Center, 'Conselho de Matrículas', 'SECRETARIA DE HOGWARTS'],
  ] as const) {
    pdf.setFont('EBGaramond', 'italic');
    pdf.setFontSize(12.2);
    pdf.setTextColor(59, 18, 7);
    pdf.text(nameTxt, cx, sigLineY - 2.4, { align: 'center' });

    pdf.setDrawColor(138, 90, 27);
    pdf.setLineWidth(0.32);
    pdf.line(cx - sigW / 2, sigLineY, cx + sigW / 2, sigLineY);

    pdf.setFont('SourceSans3', 'bold');
    pdf.setFontSize(6.8);
    pdf.setTextColor(115, 62, 16);
    pdf.text(roleTxt, cx, sigLineY + 3.6, { align: 'center' });
  }

  // ═══════════════════════════════════════════════════════════════
  // PÁGINAS 2..N: CRÔNICA INTEGRAL (ZERO CORTES / ANTI-ÓRFÃS)
  // ═══════════════════════════════════════════════════════════════
  if (splitIndex < flatLines.length) {
    let cursor = splitIndex;
    const contTextW = CONTENT_W - 8;
    pdf.setFont('EBGaramond', 'normal');
    pdf.setFontSize(10.5);
    const contLineH = 4.9;
    const contParaGap = 2.1;

    // Re-quebrar linhas restantes na medida ideal de leitura da página cheia (55–75 caracteres)
    const remainingText: string[] = [];
    let currentParaBuffer: string[] = [];
    for (let i = cursor; i < flatLines.length; i += 1) {
      currentParaBuffer.push(flatLines[i].text);
      if (flatLines[i].isParaEnd || i === flatLines.length - 1) {
        remainingText.push(currentParaBuffer.join(' '));
        currentParaBuffer = [];
      }
    }
    const contParagraphs = buildWrappedParagraphs(pdf, remainingText.join('\n\n'), contTextW);
    const contFlat = drawChronicleLineWithParagraphGap(contParagraphs);

    let contIdx = 0;
    while (contIdx < contFlat.length) {
      pdf.addPage();
      drawPageShell(pdf, assets, { isContinuation: true, characterName: fullName, ticketNum });

      let py = 29;
      if (contIdx === 0) {
        pdf.setFont('Cinzel', 'bold');
        pdf.setFontSize(11.5);
        pdf.setTextColor(59, 18, 7);
        pdf.text(
          splitIndex === 0 ? 'CRÔNICA LAVRADA NO LIVRO DA ADMISSÃO' : 'CRÔNICA LAVRADA NO LIVRO DA ADMISSÃO (CONTINUAÇÃO)',
          MARGIN_X + 4,
          py
        );
        drawCheckBadge(pdf, PAGE_W - MARGIN_X - 4, py - 0.8, `${wordCount.toLocaleString('pt-BR')} Palavras`);
        py += 7.5;
      }

      pdf.setFont('EBGaramond', 'normal');
      pdf.setFontSize(10.5);
      pdf.setTextColor(43, 20, 8);

      let simY = py;
      let rawEndIdx = contIdx;
      while (rawEndIdx < contFlat.length) {
        const line = contFlat[rawEndIdx];
        const gap = line.isParaEnd && rawEndIdx < contFlat.length - 1 ? contParaGap : 0;
        if (simY + contLineH + gap > SAFE_BOTTOM_Y) {
          break;
        }
        simY += contLineH + gap;
        rawEndIdx += 1;
      }
      const cleanEndIdx = findCleanPageEnd(contFlat, contIdx, rawEndIdx);
      while (contIdx < cleanEndIdx) {
        const line = contFlat[contIdx];
        const gap = line.isParaEnd && contIdx < contFlat.length - 1 ? contParaGap : 0;
        pdf.text(line.text, MARGIN_X + 4, py);
        py += contLineH + gap;
        contIdx += 1;
      }

      // Colofão final quando concluir todas as linhas da crônica
      if (contIdx >= contFlat.length) {
        const colophonNeeded = 24;
        if (py + colophonNeeded > SAFE_BOTTOM_Y) {
          pdf.addPage();
          drawPageShell(pdf, assets, { isContinuation: true, characterName: fullName, ticketNum });
          py = 34;
        } else {
          py += 6;
        }

        pdf.setDrawColor(196, 151, 59);
        pdf.setLineWidth(0.32);
        pdf.line(MARGIN_X + 14, py, PAGE_W - MARGIN_X - 14, py);
        py += 4.5;

        if (assets.hogwartsCrest) {
          const f = fitInsideBox(assets.hogwartsCrest, 11, 11);
          pdf.addImage(
            assets.hogwartsCrest.dataUrl,
            'PNG',
            CENTER_X - f.w / 2,
            py,
            f.w,
            f.h,
            'colophon-crest',
            'FAST'
          );
          py += f.h + 2.5;
        }

        pdf.setFont('EBGaramond', 'italic');
        pdf.setFontSize(9.2);
        pdf.setTextColor(82, 39, 14);
        pdf.text(
          `Fim da Crônica Integral de ${fullName} · ${wordCount.toLocaleString('pt-BR')} palavras lavradas no Livro da Admissão.`,
          CENTER_X,
          py + 2,
          { align: 'center' }
        );
      }
    }
  }

  // 6. Numeração global e rodapé padronizado em todas as páginas
  const totalPages = pdf.getNumberOfPages();
  for (let p = 1; p <= totalPages; p += 1) {
    pdf.setPage(p);
    pdf.setDrawColor(212, 190, 130);
    pdf.setLineWidth(0.22);
    pdf.line(MARGIN_X, FOOTER_LINE_Y, PAGE_W - MARGIN_X, FOOTER_LINE_Y);

    pdf.setFont('SourceSans3', 'normal');
    pdf.setFontSize(7.4);
    pdf.setTextColor(115, 62, 16);
    pdf.text(`ACCIO Roleplay · Ficha Ministerial Oficial ${ticketNum}`, MARGIN_X, FOOTER_TEXT_Y);
    pdf.text(`Página ${p} de ${totalPages}`, PAGE_W - MARGIN_X, FOOTER_TEXT_Y, { align: 'right' });
  }

  return pdf;
}

export async function loadBrowserAssets(app: CharacterApplication): Promise<PdfBuildAssets> {
  const { info: houseInfo } = formatHouseDisplay(app);
  const wandHandle =
    WAND_HANDLES.find((w) => w.name === app.wand_handle || w.id === app.wand_handle) || WAND_HANDLES[0];

  const [
    fontEntries,
    watermarkCrest,
    hogwartsCrest,
    ministrySeal,
    houseEmblem,
    wandHandleImg,
    wandSketchImg,
  ] = await Promise.all([
    Promise.all(FONT_ASSETS.map(async (f) => [f.file, await fetchFontBase64(f.file)] as const)),
    loadImageViaCanvas(SEAL_HOGWARTS_URL, 0.055, 640),
    loadImageViaCanvas(SEAL_HOGWARTS_URL, 1, 512),
    loadImageViaCanvas(SEAL_MINISTRY_URL, 1, 512),
    loadImageViaCanvas(houseInfo.emblemImg, 1, 384),
    loadImageViaCanvas(wandHandle.handleImg, 1, 384),
    loadImageViaCanvas(wandHandle.sketchImg, 1, 384),
  ]);

  const fonts: Record<string, string> = {};
  for (const [file, b64] of fontEntries) {
    if (b64) fonts[file] = b64;
  }

  return {
    fonts,
    parchmentBg: createParchmentBackgroundDataUrl(),
    watermarkCrest,
    hogwartsCrest,
    ministrySeal,
    houseEmblem,
    wandHandle: wandHandleImg,
    wandSketch: wandSketchImg,
  };
}

/**
 * Gera a Ficha Oficial de Inscrição em Hogwarts em PDF vetorial multi-página,
 * com acabamento de pergaminho antigo, selos oficiais canônicos, crônica integral sem cortes,
 * download imediato e sincronia no Supabase Storage.
 */
export async function generateAndDownloadCharacterPdf(
  app: CharacterApplication,
  onProgress?: (status: string) => void
): Promise<{ pdfUrl: string | null; success: boolean }> {
  try {
    if (onProgress) onProgress('Carregando selos ministeriais e tipografia...');
    const assets = await loadBrowserAssets(app);

    if (onProgress) onProgress('Diagramando pergaminho e crônica integral...');
    const pdf = await buildCharacterPdfDocument(app, assets);

    const fileName = `Ficha_Hogwarts_${app.first_name}_${app.last_name}.pdf`.replace(/\s+/g, '_');
    pdf.save(fileName);

    if (onProgress) onProgress('Sincronizando com os tomos de Hogwarts...');

    let publicPdfUrl: string | null = null;
    try {
      const blob = pdf.output('blob');
      const storagePath = `${app.id || app.discord_id}_ficha_oficial.pdf`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('character_sheets')
        .upload(storagePath, blob, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('character_sheets')
          .getPublicUrl(storagePath);

        publicPdfUrl = urlData.publicUrl;

        if (app.id) {
          await supabase
            .from('character_applications')
            .update({ pdf_url: publicPdfUrl })
            .eq('id', app.id);
        }
      }
    } catch (storageErr) {
      console.warn('PDF gerado localmente; sincronização com Supabase Storage não pôde ser completada:', storageErr);
    }

    if (onProgress) onProgress('Pronto! Ficha baixada com sucesso.');

    return {
      pdfUrl: publicPdfUrl,
      success: true,
    };
  } catch (error) {
    console.error('Falha ao gerar o PDF da ficha:', error);
    if (onProgress) onProgress('Erro ao gerar pergaminho.');
    return {
      pdfUrl: null,
      success: false,
    };
  }
}

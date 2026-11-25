import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Compass, Wand2, Sparkles, ChevronLeft, ChevronRight, Shield, Swords } from 'lucide-react';
import { soundManager } from '../lib/audio';
import { HouseId } from '../types';
import { ArcaneFrame, ArcaneDivider } from './ArcaneOrnaments';

interface CastleBanners3DProps {
  onSelectHouse?: (house: HouseId) => void;
  onOpenFormWithHouse?: (house: HouseId) => void;
}

interface HouseInfo {
  id: HouseId;
  name: string;
  motto: string;
  latinMotto: string;
  virtues: string[];
  colors: string;
  founder: string;
  ghost: string;
  location: string;
  element: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  crestAnimal: string;
}

const HOUSES_DATA: HouseInfo[] = [
  {
    id: 'gryffindor',
    name: 'Grifinória',
    motto: 'Onde habitam os corações indômitos e a ousadia cavalheiresca',
    latinMotto: 'Forti Animo Estote',
    virtues: ['Coragem', 'Ousadia', 'Nobreza de Espírito'],
    colors: 'Escarlate & Ouro',
    founder: 'Godric Gryffindor',
    ghost: 'Sir Nicholas de Mimsy-Porpington',
    location: 'Sétimo Andar, Torre Leste de Hogwarts',
    element: 'Fogo',
    primaryColor: '#7A0A0A',
    secondaryColor: '#380404',
    accentColor: '#EEBA30',
    crestAnimal: 'LEÃO RAMPANTE',
  },
  {
    id: 'slytherin',
    name: 'Sonserina',
    motto: 'Onde os astutos e determinados alcançarão a verdadeira grandeza',
    latinMotto: 'Ambitio Super Omnia',
    virtues: ['Ambição', 'Astúcia', 'Engenhosidade'],
    colors: 'Verde Esmeralda & Prata',
    founder: 'Salazar Slytherin',
    ghost: 'Barão Sangrento',
    location: 'Masmorras, Sob as Águas do Lago Negro',
    element: 'Água',
    primaryColor: '#124E2B',
    secondaryColor: '#072413',
    accentColor: '#D4D4D8',
    crestAnimal: 'SERPENTE MÁGICA',
  },
  {
    id: 'ravenclaw',
    name: 'Corvinal',
    motto: 'Onde a mente aguçada e a sabedoria eterna encontram seu refúgio',
    latinMotto: 'Sapientia Prima Ars',
    virtues: ['Sabedoria', 'Intelecto', 'Criatividade'],
    colors: 'Azul Safira & Bronze',
    founder: 'Rowena Ravenclaw',
    ghost: 'Dama Cinzenta (Helena Ravenclaw)',
    location: 'Torre Oeste de Hogwarts',
    element: 'Ar',
    primaryColor: '#0E2954',
    secondaryColor: '#051124',
    accentColor: '#C59A4E',
    crestAnimal: 'ÁGUIA MAJESTOSA',
  },
  {
    id: 'hufflepuff',
    name: 'Lufa-Lufa',
    motto: 'Onde os justos, leais e pacientes constroem legados indestrutíveis',
    latinMotto: 'Fides et Diligentia',
    virtues: ['Lealdade', 'Dedicação', 'Justiça'],
    colors: 'Amarelo Canário & Preto Ônix',
    founder: 'Helga Hufflepuff',
    ghost: 'Frei Gorducho',
    location: 'Corredor das Adegas, Próximo às Cozinhas',
    element: 'Terra',
    primaryColor: '#B88200',
    secondaryColor: '#1A140F',
    accentColor: '#FFE27A',
    crestAnimal: 'TEXUGO RESILIENTE',
  },
];

// Desenha a silhueta heráldica detalhada de cada animal sagrado de Hogwarts
function drawHeraldicAnimal(
  ctx: CanvasRenderingContext2D,
  houseId: HouseId,
  cx: number,
  cy: number,
  scale: number,
  fillColor: string,
  strokeColor: string
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  ctx.fillStyle = fillColor;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 3.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.shadowColor = strokeColor;
  ctx.shadowBlur = 16;

  if (houseId === 'gryffindor') {
    // LEÃO RAMPANTE HERÁLDICO DE GRIFINÓRIA (CORAGEM & NOBREZA)
    ctx.beginPath();
    // Cabeça altiva coroada
    ctx.moveTo(0, -95);
    ctx.bezierCurveTo(20, -115, 50, -105, 55, -85);
    ctx.bezierCurveTo(70, -80, 80, -65, 65, -50); // Focinho
    ctx.lineTo(82, -45); // Nariz
    ctx.lineTo(76, -30); // Boca aberta rugindo
    ctx.lineTo(55, -34);
    ctx.lineTo(58, -18); // Mandíbula inferior
    // Juba abundante
    ctx.bezierCurveTo(75, -5, 82, 20, 60, 40);
    ctx.bezierCurveTo(75, 60, 55, 80, 35, 85);
    // Pata dianteira direita erguida com garras
    ctx.lineTo(45, -20);
    ctx.lineTo(80, -35);
    ctx.lineTo(95, -25);
    ctx.lineTo(78, -10);
    ctx.lineTo(45, 0);
    // Pata dianteira esquerda
    ctx.lineTo(60, 20);
    ctx.lineTo(92, 35);
    ctx.lineTo(105, 45);
    ctx.lineTo(85, 55);
    ctx.lineTo(40, 45);
    // Tronco e flanco muscular
    ctx.bezierCurveTo(30, 70, 25, 95, 10, 115);
    // Pata traseira direita
    ctx.bezierCurveTo(25, 135, 50, 150, 75, 155);
    ctx.lineTo(88, 172);
    ctx.lineTo(60, 175);
    ctx.bezierCurveTo(35, 168, 18, 148, 5, 128);
    // Pata traseira esquerda
    ctx.bezierCurveTo(-15, 145, -30, 168, -38, 182);
    ctx.lineTo(-55, 186);
    ctx.lineTo(-32, 160);
    ctx.bezierCurveTo(-22, 138, -10, 118, -4, 98);
    // Cauda arqueada com laço heráldico duplo e tufo flamejante
    ctx.bezierCurveTo(-25, 75, -60, 55, -75, 15);
    ctx.bezierCurveTo(-85, -25, -70, -70, -42, -90);
    ctx.bezierCurveTo(-30, -108, -50, -125, -72, -118); // Tufo da cauda
    ctx.bezierCurveTo(-88, -112, -82, -90, -70, -80);
    ctx.bezierCurveTo(-55, -65, -50, -30, -55, 5);
    ctx.bezierCurveTo(-50, 45, -28, 80, -10, 100);
    // Dorso
    ctx.bezierCurveTo(-20, 60, -22, 18, -12, -22);
    ctx.bezierCurveTo(-8, -55, -4, -80, 0, -95);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Coroa real dourada
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFE27A';
    ctx.beginPath();
    ctx.moveTo(10, -98);
    ctx.lineTo(20, -116);
    ctx.lineTo(30, -102);
    ctx.lineTo(40, -120);
    ctx.lineTo(50, -102);
    ctx.lineTo(60, -116);
    ctx.lineTo(55, -92);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

  } else if (houseId === 'slytherin') {
    // SERPENTE HERÁLDICA DE SONSERINA (ASTÚCIA & PODER)
    ctx.beginPath();
    // Cabeça da cobra naja majestosa
    ctx.moveTo(35, -100);
    ctx.bezierCurveTo(60, -115, 88, -95, 88, -75);
    ctx.bezierCurveTo(88, -55, 60, -48, 48, -55);
    // Curvas sinuosas do corpo
    ctx.bezierCurveTo(80, -25, 95, 15, 68, 50);
    ctx.bezierCurveTo(40, 85, -25, 75, -40, 115);
    ctx.bezierCurveTo(-50, 145, -28, 180, 18, 185);
    ctx.bezierCurveTo(60, 190, 92, 158, 85, 125);
    ctx.bezierCurveTo(78, 102, 54, 98, 46, 115);
    ctx.bezierCurveTo(40, 132, 58, 148, 45, 158);
    ctx.bezierCurveTo(32, 165, 8, 160, -2, 142);
    ctx.bezierCurveTo(-12, 125, -10, 98, 15, 78);
    ctx.bezierCurveTo(48, 55, 62, 25, 50, -8);
    ctx.bezierCurveTo(38, -38, 12, -42, 2, -15);
    ctx.bezierCurveTo(-12, 18, -38, 12, -48, -15);
    ctx.bezierCurveTo(-58, -48, -35, -82, 2, -92);
    ctx.bezierCurveTo(15, -98, 25, -98, 35, -100);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Língua bífida em rubi
    ctx.strokeStyle = '#FF3B30';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(85, -72);
    ctx.lineTo(110, -70);
    ctx.lineTo(122, -80);
    ctx.moveTo(110, -70);
    ctx.lineTo(122, -62);
    ctx.stroke();

    // Olho esmeralda brilhante
    ctx.fillStyle = '#00FF66';
    ctx.shadowColor = '#00FF66';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(68, -82, 5, 0, Math.PI * 2);
    ctx.fill();

  } else if (houseId === 'ravenclaw') {
    // ÁGUIA DE CORVINAL (SABEDORIA & VISÃO)
    ctx.beginPath();
    ctx.moveTo(0, -100);
    ctx.bezierCurveTo(18, -112, 40, -100, 40, -82);
    ctx.lineTo(62, -76); // Bico adunco
    ctx.lineTo(42, -64);
    ctx.lineTo(26, -66);
    // Asa Direita imponente
    ctx.bezierCurveTo(50, -78, 88, -96, 125, -90);
    ctx.bezierCurveTo(135, -72, 112, -50, 102, -38);
    ctx.bezierCurveTo(124, -32, 128, -10, 112, 0);
    ctx.bezierCurveTo(122, 18, 112, 38, 90, 42);
    ctx.bezierCurveTo(72, 45, 52, 32, 42, 20);
    // Corpo e garras
    ctx.bezierCurveTo(36, 48, 36, 80, 25, 112);
    ctx.lineTo(40, 132);
    ctx.lineTo(20, 126);
    // Cauda em leque heráldico
    ctx.bezierCurveTo(15, 148, 22, 175, 34, 195);
    ctx.lineTo(0, 184);
    ctx.lineTo(-34, 195);
    ctx.bezierCurveTo(-22, 175, -15, 148, -20, 126);
    // Garra esquerda
    ctx.lineTo(-40, 132);
    ctx.lineTo(-25, 112);
    // Asa Esquerda majestosa
    ctx.bezierCurveTo(-36, 80, -36, 48, -42, 20);
    ctx.bezierCurveTo(-52, 32, -72, 45, -90, 42);
    ctx.bezierCurveTo(-112, 38, -122, 18, -112, 0);
    ctx.bezierCurveTo(-128, -10, -124, -32, -102, -38);
    ctx.bezierCurveTo(-112, -50, -135, -72, -125, -90);
    ctx.bezierCurveTo(-88, -96, -50, -78, -26, -66);
    ctx.bezierCurveTo(-20, -88, -15, -100, 0, -100);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Olho dourado reluzente
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFE27A';
    ctx.beginPath();
    ctx.arc(16, -84, 4, 0, Math.PI * 2);
    ctx.fill();

  } else {
    // TEXUGO DE LUFA-LUFA (LEALDADE & FORÇA)
    ctx.beginPath();
    ctx.moveTo(-45, -35);
    ctx.lineTo(-80, -20);
    ctx.lineTo(-68, -2);
    ctx.bezierCurveTo(-52, 4, -42, 14, -36, 30);
    // Pata dianteira forte
    ctx.lineTo(-48, 72);
    ctx.lineTo(-70, 102);
    ctx.lineTo(-48, 96);
    ctx.lineTo(-26, 60);
    // Peito e dorso musculoso
    ctx.bezierCurveTo(-10, 70, 18, 74, 40, 68);
    // Pata traseira
    ctx.lineTo(52, 102);
    ctx.lineTo(68, 126);
    ctx.lineTo(82, 120);
    ctx.bezierCurveTo(72, 88, 66, 62, 70, 42);
    // Cauda
    ctx.bezierCurveTo(86, 48, 102, 42, 114, 26);
    ctx.bezierCurveTo(124, 10, 112, -6, 90, -12);
    // Dorso largo
    ctx.bezierCurveTo(75, -28, 48, -44, 22, -50);
    ctx.bezierCurveTo(-6, -55, -28, -48, -45, -35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Faixa branca sagrada do texugo
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(-74, -22);
    ctx.bezierCurveTo(-52, -36, -26, -36, 2, -28);
    ctx.lineTo(-4, -16);
    ctx.bezierCurveTo(-30, -23, -52, -18, -72, -10);
    ctx.closePath();
    ctx.fill();

    // Olho vivo
    ctx.fillStyle = '#0D0202';
    ctx.beginPath();
    ctx.arc(-42, -22, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Gerador de textura cinematográfica 1024x2048 com tecelagem damasco e brasão heráldico
function createBannerTexture(house: HouseInfo): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Base do tecido com rico degradê de veludo e damasco
  const grad = ctx.createLinearGradient(0, 0, 1024, 2048);
  grad.addColorStop(0, house.primaryColor);
  grad.addColorStop(0.3, house.primaryColor);
  grad.addColorStop(0.65, house.secondaryColor);
  grad.addColorStop(1, '#080101');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 2048);

  // 2. Textura sutil de losangos medievais bordados (Damasco)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
  ctx.lineWidth = 2;
  const step = 64;
  for (let x = -1024; x < 2048; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 2048, 2048);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 2048, 0);
    ctx.lineTo(x, 2048);
    ctx.stroke();
  }

  // Trama vertical de fios de seda
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  for (let i = 0; i < 1024; i += 8) {
    ctx.fillRect(i, 0, 3, 2048);
  }

  // 3. Moldura Ornamental Real Dupla
  ctx.strokeStyle = house.accentColor;
  ctx.lineWidth = 28;
  ctx.strokeRect(40, 40, 944, 1968);

  ctx.lineWidth = 8;
  ctx.strokeRect(80, 80, 864, 1888);

  // Cantoneiras góticas medievais
  const cornerSize = 90;
  [[40, 40], [984 - cornerSize, 40]].forEach(([cx, cy]) => {
    ctx.fillStyle = house.accentColor;
    ctx.fillRect(cx, cy, cornerSize, 16);
    ctx.fillRect(cx, cy, 16, cornerSize);
  });

  // 4. Recorte triangular na cauda inferior (V-shape canônico)
  ctx.fillStyle = '#0A0202';
  ctx.beginPath();
  ctx.moveTo(0, 2048);
  ctx.lineTo(512, 1840);
  ctx.lineTo(1024, 2048);
  ctx.closePath();
  ctx.fill();

  // Borda na cauda recortada
  ctx.strokeStyle = house.accentColor;
  ctx.lineWidth = 22;
  ctx.beginPath();
  ctx.moveTo(40, 2010);
  ctx.lineTo(512, 1830);
  ctx.lineTo(984, 2010);
  ctx.stroke();

  // Franjas douradas na base
  ctx.strokeStyle = house.accentColor;
  ctx.lineWidth = 4;
  for (let fx = 50; fx < 974; fx += 16) {
    const fy = fx <= 512 
      ? 2010 - ((fx - 40) / 472) * 180 
      : 1830 + ((fx - 512) / 472) * 180;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx, fy + 24);
    ctx.stroke();
  }

  const centerX = 512;

  // 5. Cabeçalho Majestoso com Nome da Casa
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Fita de topo
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.fillRect(110, 210, 804, 130);
  ctx.strokeStyle = house.accentColor;
  ctx.lineWidth = 4;
  ctx.strokeRect(110, 210, 804, 130);

  // Nome da Casa em Cinzel Dourado
  ctx.font = '900 86px "Cinzel", Georgia, serif';
  ctx.fillStyle = house.accentColor;
  ctx.shadowColor = house.accentColor;
  ctx.shadowBlur = 24;
  ctx.fillText(house.name.toUpperCase(), centerX, 275);

  ctx.shadowBlur = 0;
  ctx.font = 'bold 30px "Cinzel", sans-serif';
  ctx.fillStyle = '#FFF0B2';
  ctx.letterSpacing = '6px';
  ctx.fillText(`• ${house.colors.toUpperCase()} •`, centerX, 385);
  ctx.restore();

  // 6. Grande Escudo Heráldico Central
  const centerY = 960;
  ctx.save();

  // Halo de luz mágico ao redor do escudo
  const halo = ctx.createRadialGradient(centerX, centerY, 80, centerX, centerY, 420);
  halo.addColorStop(0, 'rgba(255, 235, 160, 0.22)');
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(centerX - 420, centerY - 420, 840, 840);

  // Forma do Escudo Gótico Medieval
  const sw = 330;
  const sh = 420;
  ctx.beginPath();
  ctx.moveTo(centerX - sw, centerY - sh);
  ctx.lineTo(centerX + sw, centerY - sh);
  ctx.lineTo(centerX + sw, centerY + sh * 0.3);
  ctx.bezierCurveTo(centerX + sw, centerY + sh * 0.85, centerX + sw * 0.35, centerY + sh * 1.1, centerX, centerY + sh * 1.25);
  ctx.bezierCurveTo(centerX - sw * 0.35, centerY + sh * 1.1, centerX - sw, centerY + sh * 0.85, centerX - sw, centerY + sh * 0.3);
  ctx.closePath();

  // Fundo do escudo
  const shieldGrad = ctx.createLinearGradient(centerX - sw, centerY - sh, centerX + sw, centerY + sh);
  shieldGrad.addColorStop(0, '#160504');
  shieldGrad.addColorStop(1, '#080101');
  ctx.fillStyle = shieldGrad;
  ctx.fill();

  // Borda espessa ornamental do escudo
  ctx.lineWidth = 18;
  ctx.strokeStyle = house.accentColor;
  ctx.shadowColor = house.accentColor;
  ctx.shadowBlur = 18;
  ctx.stroke();

  // Borda interna fina
  ctx.lineWidth = 4;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.shadowBlur = 0;
  ctx.stroke();

  // 7. Desenhar o Animal Heráldico Sagrado dentro do escudo
  drawHeraldicAnimal(
    ctx,
    house.id,
    centerX,
    centerY + 10,
    1.65,
    house.accentColor,
    '#FFFFFF'
  );

  // Letra Monograma clássica no rodapé do escudo
  ctx.font = '900 68px "Cinzel", serif';
  ctx.fillStyle = '#FFF0B2';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = house.accentColor;
  ctx.shadowBlur = 15;
  ctx.fillText(house.name.charAt(0), centerX, centerY + 380);

  ctx.restore();

  // 8. Faixa em Pergaminho com Lema Latino Canônico
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Fita de lema
  const mottoY = 1660;
  ctx.fillStyle = 'rgba(12, 3, 3, 0.85)';
  ctx.beginPath();
  ctx.roundRect(140, mottoY - 45, 744, 90, 16);
  ctx.fill();
  ctx.strokeStyle = house.accentColor;
  ctx.lineWidth = 3.5;
  ctx.stroke();

  ctx.font = 'italic bold 44px "Crimson Text", Georgia, serif';
  ctx.fillStyle = house.accentColor;
  ctx.shadowColor = house.accentColor;
  ctx.shadowBlur = 12;
  ctx.fillText(`"${house.latinMotto}"`, centerX, mottoY);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 16;
  return texture;
}

export const CastleBanners3D: React.FC<CastleBanners3DProps> = ({
  onSelectHouse,
  onOpenFormWithHouse,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedHouse, setSelectedHouse] = useState<HouseInfo>(HOUSES_DATA[0]);
  const [activeHouseIndex, setActiveHouseIndex] = useState<number>(0);
  const targetCamX = useRef<number>(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1100;
    const height = isMobile ? 540 : isTablet ? 620 : 720;

    // 1. Cenário 3D
    const scene = new THREE.Scene();

    // 2. Câmera com FOV e distância perfeitos para proporção majestosa
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);
    
    // Cálculo trigonométrico exato para enquadrar perfeitamente os 4 estandartes com margem nobre
    const computeOptimalZ = (w: number, h: number, mobile: boolean) => {
      if (mobile) return 7.8;
      const aspect = w / h;
      const fovRad = (44 * Math.PI) / 180;
      const totalSpanWithMargins = 13.0;
      const hFov = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);
      const zByWidth = (totalSpanWithMargins / 2) / Math.tan(hFov / 2);
      return Math.max(8.8, zByWidth);
    };

    const cameraZ = computeOptimalZ(width, height, isMobile);
    camera.position.set(0, 0, cameraZ);

    // 3. Renderizador WebGL de alta fidelidade
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 4. Sistema de Iluminação Medieval de Hogwarts
    const ambientLight = new THREE.AmbientLight(0xfff1cf, 0.9);
    scene.add(ambientLight);

    // Grande tocha dourada principal
    const mainTorch = new THREE.DirectionalLight(0xffd885, 2.5);
    mainTorch.position.set(0, 6, 7);
    scene.add(mainTorch);

    // Fogueira quente no piso do salão
    const hearthLight = new THREE.PointLight(0xff7722, 2.0, 30);
    hearthLight.position.set(0, -5, 5);
    scene.add(hearthLight);

    // Luzes pontuais coloridas suaves nas extremidades
    const blueGlow = new THREE.PointLight(0x4a90e2, 1.2, 18);
    blueGlow.position.set(-8, 3, 3);
    scene.add(blueGlow);

    const greenGlow = new THREE.PointLight(0x2ecc71, 1.2, 18);
    greenGlow.position.set(8, 3, 3);
    scene.add(greenGlow);

    // 5. Partículas de Poeira Estelar / Brasas Flutuantes
    const particleCount = 80;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 18;
      particlePositions[i + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffc34f,
      size: 0.07,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const dustParticles = new THREE.Points(particleGeom, particleMat);
    scene.add(dustParticles);

    // 6. Construção dos 4 Estandartes com Proporções Amplas e Espaçamento Nobre
    const bannerMeshes: {
      mesh: THREE.Mesh;
      initialPos: THREE.Vector3;
      house: HouseInfo;
      geom: THREE.PlaneGeometry;
      origPos: Float32Array;
      index: number;
    }[] = [];

    // Dimensões majestosas com aspecto medieval autêntico
    const bannerWidth = 2.15;
    const bannerHeight = 4.85;
    // Espaçamento amplo garantindo respiração visual (nunca colados)
    const spacing = isMobile ? 3.2 : isTablet ? 2.85 : 2.95;
    const startX = -((HOUSES_DATA.length - 1) * spacing) / 2;

    HOUSES_DATA.forEach((house, idx) => {
      const posX = startX + idx * spacing;
      const posY = 0.2;

      // Malha de tecido denso para ondulações realistas
      const geom = new THREE.PlaneGeometry(bannerWidth, bannerHeight, 24, 38);
      const origPos = geom.attributes.position.array.slice() as Float32Array;

      const texture = createBannerTexture(house);
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        roughness: 0.35,
        metalness: 0.2,
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(posX, posY, 0);
      scene.add(mesh);

      // Vara de Latão Maciço Individual com Pontas em Pinha Medieval
      const poleRadius = 0.055;
      const poleLength = bannerWidth + 0.35;
      const poleGeom = new THREE.CylinderGeometry(poleRadius, poleRadius, poleLength, 20);
      poleGeom.rotateZ(Math.PI / 2);
      const poleMat = new THREE.MeshStandardMaterial({
        color: 0xe5b84c,
        metalness: 0.85,
        roughness: 0.25,
      });
      const poleMesh = new THREE.Mesh(poleGeom, poleMat);
      poleMesh.position.set(posX, posY + bannerHeight / 2 + 0.06, 0.04);
      scene.add(poleMesh);

      // Pontas ornamentais esféricas douradas nas extremidades de cada vara
      [-1, 1].forEach((dir) => {
        const finialGeom = new THREE.SphereGeometry(0.13, 16, 16);
        const finialMesh = new THREE.Mesh(finialGeom, poleMat);
        finialMesh.position.set(
          posX + (dir * poleLength) / 2,
          posY + bannerHeight / 2 + 0.06,
          0.04
        );
        scene.add(finialMesh);
      });

      // Cordas / Cabos de sustentação dourados subindo ao teto abobadado
      const ropeMat = new THREE.MeshStandardMaterial({
        color: 0xc8963e,
        roughness: 0.6,
      });
      [-1, 1].forEach((dir) => {
        const ropeLength = 1.4;
        const ropeGeom = new THREE.CylinderGeometry(0.018, 0.018, ropeLength, 8);
        ropeGeom.rotateZ(dir * 0.12);
        const ropeMesh = new THREE.Mesh(ropeGeom, ropeMat);
        ropeMesh.position.set(
          posX + dir * (bannerWidth * 0.36),
          posY + bannerHeight / 2 + 0.06 + ropeLength / 2,
          0.02
        );
        scene.add(ropeMesh);
      });

      bannerMeshes.push({
        mesh,
        initialPos: mesh.position.clone(),
        house,
        geom,
        origPos,
        index: idx,
      });
    });

    // 7. Raycaster e Interatividade de Clique
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerDown = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(bannerMeshes.map((b) => b.mesh));

      if (intersects.length > 0) {
        const hit = bannerMeshes.find((b) => b.mesh === intersects[0].object);
        if (hit) {
          soundManager.playSparkle();
          setSelectedHouse(hit.house);
          setActiveHouseIndex(hit.index);
          if (onSelectHouse) onSelectHouse(hit.house.id);
        }
      }
    };

    renderer.domElement.addEventListener('click', handlePointerDown);

    // 8. Loop de Animação com Física de Tecido e Câmera Deslizante
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let isVisible = true;

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const time = clock.getElapsedTime();

      // Flutuação das partículas no ar
      dustParticles.rotation.y = time * 0.025;
      dustParticles.rotation.x = Math.sin(time * 0.04) * 0.04;

      // Movimento suave da câmera para focar no estandarte selecionado em telas menores
      if (isMobile) {
        const selectedBanner = bannerMeshes[activeHouseIndex];
        if (selectedBanner) {
          targetCamX.current = selectedBanner.initialPos.x;
        }
      } else {
        targetCamX.current = 0;
      }
      camera.position.x += (targetCamX.current - camera.position.x) * 0.08;

      // Ondulação física do tecido ao vento de Hogwarts
      bannerMeshes.forEach(({ mesh, geom, origPos, initialPos, house }, bIndex) => {
        const isCurrentSelected = house.id === selectedHouse.id;
        // Estandarte ativo se projeta sutilmente para frente
        const targetZ = isCurrentSelected ? initialPos.z + 0.6 : initialPos.z;
        mesh.position.z += (targetZ - mesh.position.z) * 0.08;

        const posAttr = geom.attributes.position;
        const count = posAttr.count;

        for (let i = 0; i < count; i++) {
          const origX = origPos[i * 3];
          const origY = origPos[i * 3 + 1];

          // Topo preso à vara, base livre para flutuar
          const freedom = Math.pow((bannerHeight / 2 - origY) / bannerHeight, 1.35);

          // Equações de vento ondulatório suave
          const waveZ =
            Math.sin(origY * 1.6 + time * 3.2 + bIndex * 1.2) * 0.24 * freedom +
            Math.cos(origX * 2.5 + time * 2.4) * 0.08 * freedom +
            Math.sin(time * 1.6 + bIndex) * 0.05 * freedom;

          posAttr.setZ(i, waveZ);
        }

        posAttr.needsUpdate = true;
        geom.computeVertexNormals();
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newIsMobile = newWidth < 768;
      const newIsTablet = newWidth >= 768 && newWidth < 1100;
      const newHeight = newIsMobile ? 540 : newIsTablet ? 620 : 720;
      const newCameraZ = computeOptimalZ(newWidth, newHeight, newIsMobile);

      camera.aspect = newWidth / newHeight;
      camera.position.z = newCameraZ;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handlePointerDown);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [selectedHouse, activeHouseIndex]);

  const selectHouseByIndex = (index: number) => {
    const wrapped = (index + HOUSES_DATA.length) % HOUSES_DATA.length;
    setActiveHouseIndex(wrapped);
    setSelectedHouse(HOUSES_DATA[wrapped]);
    soundManager.playSparkle();
    if (onSelectHouse) onSelectHouse(HOUSES_DATA[wrapped].id);
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      
      {/* Título da Seção (Estilo ArcaneMP) */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
        <p className="eyebrow flex items-center justify-center gap-2">
          <Compass className="w-3.5 h-3.5 text-[var(--house-accent-secondary)] animate-spin" style={{ animationDuration: '20s' }} />
          <span>Exploração do Castelo &amp; As Quatro Casas</span>
        </p>
        <h2 className="title mt-4 text-3xl sm:text-5xl">
          Os Grandes Estandartes de Hogwarts
        </h2>
        <ArcaneDivider className="mt-6" />
        <p className="mt-6 max-w-[58ch] text-pretty text-[#b6bbc5]">
          Estandartes monumentais tecidos em tapeçaria mágica, suspensos sob os arcos do Grande Salão. Toque em qualquer flâmula tridimensional para revelar a história e a virtude de sua Casa.
        </p>
      </div>

      {/* Seletor Rápido de Casas */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-6">
        {HOUSES_DATA.map((h, i) => {
          const isSelected = selectedHouse.id === h.id;
          return (
            <button
              key={h.id}
              onClick={() => selectHouseByIndex(i)}
              className={`px-4 py-2 text-xs font-display uppercase tracking-wider border transition flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? 'bg-[#0d1422] text-[var(--house-accent)] border-[var(--house-accent)] shadow-lg'
                  : 'bg-[#0a0f19]/90 text-[#b6bbc5] border-[var(--house-border)] hover:border-[var(--house-accent)]/70 hover:text-[#ece7da]'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rotate-45"
                style={{ backgroundColor: h.accentColor }}
              />
              <span>{h.name}</span>
            </button>
          );
        })}
      </div>

      {/* CONTAINER DO WEBGL THREE.JS (Altura Ampla e Confortável) */}
      <div
        ref={mountRef}
        className="w-full h-[540px] sm:h-[620px] lg:h-[700px] relative flex items-center justify-center cursor-pointer select-none"
      >
        {/* Setas de Navegação Lateral para Mobile / Tablet */}
        <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none md:hidden z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              selectHouseByIndex(activeHouseIndex - 1);
            }}
            className="p-2.5 bg-[#0a0f19]/90 border border-[var(--house-border)] text-[var(--house-accent)] pointer-events-auto hover:bg-[#0d1422] shadow-xl"
            title="Casa Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none md:hidden z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              selectHouseByIndex(activeHouseIndex + 1);
            }}
            className="p-2.5 bg-[#0a0f19]/90 border border-[var(--house-border)] text-[var(--house-accent)] pointer-events-auto hover:bg-[#0d1422] shadow-xl"
            title="Próxima Casa"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dica Flutuante Inferior */}
        <div className="absolute bottom-4 inset-x-0 flex justify-center pointer-events-none z-10">
          <span className="text-xs font-semibold text-[var(--house-accent)] bg-[#0a0f19]/90 px-4 py-1.5 border border-[var(--house-border)] backdrop-blur-md shadow-xl flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--house-accent)] animate-pulse" />
            <span>Toque nos estandartes tridimensionais para inspecionar</span>
          </span>
        </div>
      </div>

      {/* PAINEL DE DETALHES DA CASA SELECIONADA (Moldura Ornamental ArcaneMP) */}
      <ArcaneFrame
        className="mt-8 max-w-4xl mx-auto p-6 sm:p-10 shadow-2xl overflow-hidden"
        style={{ borderColor: selectedHouse.accentColor }}
      >
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[110px] pointer-events-none opacity-25"
          style={{ backgroundColor: selectedHouse.primaryColor }}
        />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <span
                className="w-3 h-3 rotate-45 shadow-sm"
                style={{ backgroundColor: selectedHouse.accentColor }}
              />
              <span className="eyebrow text-[11px]">
                {selectedHouse.colors} · Elemento {selectedHouse.element} · {selectedHouse.crestAnimal}
              </span>
            </div>

            <h3 className="font-display text-2xl sm:text-4xl text-[#efe4cc]">
              Casa {selectedHouse.name}
            </h3>

            <p className="font-crimson italic text-lg text-[#ece7da]/90">
              "{selectedHouse.motto}"
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {selectedHouse.virtues.map((v) => (
                <span
                  key={v}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-[#0d1422] border border-[var(--house-border)] text-[#ece7da] inline-flex items-center gap-1.5"
                >
                  <Swords className="w-3.5 h-3.5 text-[var(--house-accent)]" />
                  <span>{v}</span>
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-[#b6bbc5] pt-4 border-t border-[var(--hair-soft)]">
              <div>
                <span className="eyebrow text-[10px] block mb-0.5">Fundador(a)</span>
                <span className="text-sm text-[#ece7da]">{selectedHouse.founder}</span>
              </div>
              <div>
                <span className="eyebrow text-[10px] block mb-0.5">Fantasma Residente</span>
                <span className="text-sm text-[#ece7da]">{selectedHouse.ghost}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="eyebrow text-[10px] block mb-0.5">Salão Comunal</span>
                <span className="text-sm leading-relaxed text-[#ece7da]">{selectedHouse.location}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 sm:p-7 bg-[#0d1422]/90 border border-[var(--house-border)] text-center space-y-4">
            <div
              className="w-20 h-20 arch flex items-center justify-center border border-[var(--house-border)] shadow-xl"
              style={{ backgroundColor: selectedHouse.primaryColor }}
            >
              <Shield className="w-9 h-9" style={{ color: selectedHouse.accentColor }} />
            </div>

            <span className="text-xs text-[#b6bbc5] leading-relaxed">
              Deseja aspirar a esta nobre casa na sua convocação oficial?
            </span>

            {onOpenFormWithHouse && (
              <button
                onClick={() => {
                  soundManager.playSparkle();
                  onOpenFormWithHouse(selectedHouse.id);
                }}
                className="w-full btn-primary btn-sm"
              >
                <Wand2 className="w-4 h-4" />
                <span>Escolher {selectedHouse.name}</span>
              </button>
            )}
          </div>

        </div>
      </ArcaneFrame>

    </section>
  );
};

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Compass, Wand2, Sparkles, ChevronLeft, ChevronRight, Swords } from 'lucide-react';
import { soundManager } from '../lib/audio';
import { HOUSES } from '../lib/constants';
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

interface BannerPalette {
  top: string;
  mid: string;
  bottom: string;
  border: string;
  text: string;
  glow: string;
}

const BANNER_CLOTH_PALETTES: Record<HouseId, BannerPalette> = {
  gryffindor: {
    top: '#64090C',
    mid: '#841014',
    bottom: '#440507',
    border: '#E2B44B',
    text: '#F7E9C8',
    glow: 'rgba(255, 224, 140, 0.16)',
  },
  slytherin: {
    top: '#0B351E',
    mid: '#155833',
    bottom: '#072213',
    border: '#CDD5DC',
    text: '#EFF4F7',
    glow: 'rgba(210, 238, 225, 0.14)',
  },
  ravenclaw: {
    top: '#0B2750',
    mid: '#143D74',
    bottom: '#071936',
    border: '#CCA25B',
    text: '#F5E7CE',
    glow: 'rgba(170, 210, 255, 0.15)',
  },
  hufflepuff: {
    top: '#966B0B',
    mid: '#B68612',
    bottom: '#694905',
    border: '#F2DA8E',
    text: '#FFF4D2',
    glow: 'rgba(255, 236, 175, 0.18)',
  },
};

const BANNER_TEX_W = 1024;
const BANNER_TEX_H = 2048;
const BANNER_NOTCH_DEPTH = 244;

// Traça a silhueta em cauda de andorinha (ou borda paralela recuada por `inset`)
function traceSwallowtailPath(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  notchDepth: number,
  inset: number
) {
  const halfW = w / 2;
  const slope = notchDepth / halfW;
  const normalFactor = Math.hypot(halfW, notchDepth) / halfW;
  const verticalShift = inset * normalFactor;

  const left = inset;
  const right = w - inset;
  const top = inset;
  const tipY = h - verticalShift - slope * inset;
  const apexY = h - notchDepth - verticalShift;

  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.lineTo(right, top);
  ctx.lineTo(right, tipY);
  ctx.lineTo(halfW, apexY);
  ctx.lineTo(left, tipY);
  ctx.closePath();
}

// Gera mapa de relevo (bump) sutil simulando fios de veludo e linho trançado
function createFabricBumpTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, size, size);

    for (let y = 0; y < size; y += 4) {
      ctx.fillStyle = y % 8 === 0 ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)';
      ctx.fillRect(0, y, size, 2);
    }
    for (let x = 0; x < size; x += 4) {
      ctx.fillStyle = x % 8 === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
      ctx.fillRect(x, 0, 2, size);
    }
  }
  const bump = new THREE.CanvasTexture(canvas);
  bump.wrapS = THREE.RepeatWrapping;
  bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(8, 16);
  return bump;
}

// Desenha a tapeçaria completa do estandarte 3D com o emblema oficial da casa em proporção 1:1
function paintBannerCanvas(
  ctx: CanvasRenderingContext2D,
  house: HouseInfo,
  emblemImg: HTMLImageElement | null
) {
  const W = BANNER_TEX_W;
  const H = BANNER_TEX_H;
  const centerX = W / 2;
  const palette = BANNER_CLOTH_PALETTES[house.id];

  ctx.clearRect(0, 0, W, H);
  ctx.save();

  // Recorte real da cauda em V com transparência fora da tapeçaria
  traceSwallowtailPath(ctx, W, H, BANNER_NOTCH_DEPTH, 0);
  ctx.clip();

  // 1. Base de veludo rico sem escurecimento artificial no recorte
  const baseGrad = ctx.createLinearGradient(0, 0, 0, H);
  baseGrad.addColorStop(0, palette.top);
  baseGrad.addColorStop(0.45, palette.mid);
  baseGrad.addColorStop(1, palette.bottom);
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, W, H);

  // Profundidade cilíndrica nas laterais e sombra projetada pela vara superior
  const sideShade = ctx.createLinearGradient(0, 0, W, 0);
  sideShade.addColorStop(0, 'rgba(0, 0, 0, 0.34)');
  sideShade.addColorStop(0.14, 'rgba(0, 0, 0, 0.06)');
  sideShade.addColorStop(0.5, 'rgba(255, 255, 255, 0.04)');
  sideShade.addColorStop(0.86, 'rgba(0, 0, 0, 0.06)');
  sideShade.addColorStop(1, 'rgba(0, 0, 0, 0.34)');
  ctx.fillStyle = sideShade;
  ctx.fillRect(0, 0, W, H);

  const rodShadow = ctx.createLinearGradient(0, 0, 0, 120);
  rodShadow.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
  rodShadow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = rodShadow;
  ctx.fillRect(0, 0, W, 120);

  // 2. Padronagem sutil de losangos em damasco medieval
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.032)';
  ctx.lineWidth = 2;
  const step = 64;
  for (let x = -W; x < H + W; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + H, H);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + H, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  // 3. Borda Ornamental Dupla acompanhando perfeitamente o recorte em V
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;

  traceSwallowtailPath(ctx, W, H, BANNER_NOTCH_DEPTH, 32);
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 11;
  ctx.lineJoin = 'miter';
  ctx.stroke();

  traceSwallowtailPath(ctx, W, H, BANNER_NOTCH_DEPTH, 58);
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 3.5;
  ctx.stroke();
  ctx.restore();

  // Cantoneiras ornamentais nos cantos superiores
  const cornerIn = 58;
  const cornerLen = 42;
  ctx.fillStyle = palette.border;
  ctx.fillRect(cornerIn, cornerIn, cornerLen, 8);
  ctx.fillRect(cornerIn, cornerIn, 8, cornerLen);
  ctx.fillRect(W - cornerIn - cornerLen, cornerIn, cornerLen, 8);
  ctx.fillRect(W - cornerIn - 8, cornerIn, 8, cornerLen);

  // 4. Tipografia Real da Casa no Topo
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = '700 84px "Cinzel", Georgia, serif';
  ctx.fillStyle = palette.text;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillText(house.name, centerX, 245, 820);

  // Fio divisor e losango central
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = palette.border;
  ctx.globalAlpha = 0.72;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - 180, 308);
  ctx.lineTo(centerX - 18, 308);
  ctx.moveTo(centerX + 18, 308);
  ctx.lineTo(centerX + 180, 308);
  ctx.stroke();

  ctx.fillStyle = palette.border;
  ctx.beginPath();
  ctx.moveTo(centerX, 300);
  ctx.lineTo(centerX + 8, 308);
  ctx.lineTo(centerX, 316);
  ctx.lineTo(centerX - 8, 308);
  ctx.closePath();
  ctx.fill();

  ctx.globalAlpha = 0.88;
  ctx.font = '600 22px "Cinzel", Georgia, serif';
  ctx.fillStyle = palette.text;
  ctx.fillText(house.colors.toUpperCase(), centerX, 354, 780);
  ctx.restore();

  // 5. Halo suave atrás do brasão para leitura impecável na tapeçaria
  const emblemCenterY = 985;
  const halo = ctx.createRadialGradient(centerX, emblemCenterY, 40, centerX, emblemCenterY, 430);
  halo.addColorStop(0, palette.glow);
  halo.addColorStop(0.65, 'rgba(0, 0, 0, 0.10)');
  halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(centerX - 440, emblemCenterY - 460, 880, 920);

  // 6. Emblema Oficial da Casa (sem distorção, centralizado e integrado ao tecido)
  if (emblemImg && emblemImg.naturalWidth > 0 && emblemImg.naturalHeight > 0) {
    const maxEmblemW = 780;
    const maxEmblemH = 980;
    const scale = Math.min(maxEmblemW / emblemImg.naturalWidth, maxEmblemH / emblemImg.naturalHeight);
    const drawW = emblemImg.naturalWidth * scale;
    const drawH = emblemImg.naturalHeight * scale;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.72)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    ctx.drawImage(
      emblemImg,
      centerX - drawW / 2,
      emblemCenterY - drawH / 2,
      drawW,
      drawH
    );
    ctx.restore();
  }

  // 7. Lema Latino Canônico abaixo do brasão
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'italic 600 34px "Crimson Text", Georgia, serif';
  ctx.fillStyle = palette.text;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 3;
  ctx.globalAlpha = 0.92;
  ctx.fillText(`"${house.latinMotto}"`, centerX, 1605, 760);
  ctx.restore();

  // 8. Sobreposição sutil de trama têxtil e vinheta para unificar emblema e pano
  ctx.save();
  ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
  for (let i = 0; i < W; i += 6) {
    ctx.fillRect(i, 0, 2, H);
  }
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
  for (let j = 0; j < H; j += 6) {
    ctx.fillRect(0, j, W, 2);
  }
  ctx.restore();

  ctx.restore();
}

// Cria CanvasTexture 1024x2048 sRGB e re-renderiza quando o emblema oficial e as fontes carregam
function createBannerTexture(
  house: HouseInfo,
  isDisposed: () => boolean
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = BANNER_TEX_W;
  canvas.height = BANNER_TEX_H;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;

  if (!ctx) return texture;

  let loadedImg: HTMLImageElement | null = null;
  const redraw = () => {
    if (isDisposed()) return;
    paintBannerCanvas(ctx, house, loadedImg);
    texture.needsUpdate = true;
  };

  redraw();

  const img = new Image();
  img.onload = () => {
    loadedImg = img;
    redraw();
  };
  img.src = HOUSES[house.id].emblemImg;

  if (typeof document !== 'undefined' && document.fonts?.ready) {
    document.fonts.ready.then(() => {
      redraw();
    });
  }

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
  const selectedHouseIdRef = useRef<HouseId>(selectedHouse.id);
  const activeHouseIndexRef = useRef<number>(activeHouseIndex);
  const onSelectHouseRef = useRef(onSelectHouse);

  selectedHouseIdRef.current = selectedHouse.id;
  activeHouseIndexRef.current = activeHouseIndex;
  onSelectHouseRef.current = onSelectHouse;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isDisposed = false;
    const width = container.clientWidth;
    let isMobile = width < 768;
    const isTablet = width >= 768 && width < 1100;
    const height = isMobile ? 540 : isTablet ? 620 : 720;

    // 1. Cenário 3D
    const scene = new THREE.Scene();

    // 2. Câmera com FOV e distância perfeitos para proporção majestosa
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 100);

    // Cálculo trigonométrico exato para enquadrar perfeitamente os 4 estandartes com margem nobre
    const computeOptimalZ = (w: number, h: number, mobile: boolean) => {
      if (mobile) return 7.6;
      const aspect = w / h;
      const fovRad = (44 * Math.PI) / 180;
      const totalSpanWithMargins = 12.8;
      const hFov = 2 * Math.atan(Math.tan(fovRad / 2) * aspect);
      const zByWidth = (totalSpanWithMargins / 2) / Math.tan(hFov / 2);
      return Math.max(8.5, zByWidth);
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
    renderer.toneMappingExposure = 1.22;
    container.appendChild(renderer.domElement);

    // 4. Sistema de Iluminação Medieval de Hogwarts
    const ambientLight = new THREE.AmbientLight(0xfff3d8, 1.05);
    scene.add(ambientLight);

    // Grande tocha dourada principal
    const mainTorch = new THREE.DirectionalLight(0xffdca0, 2.2);
    mainTorch.position.set(0, 6, 7);
    scene.add(mainTorch);

    // Fogueira quente no piso do salão
    const hearthLight = new THREE.PointLight(0xff8433, 1.7, 30);
    hearthLight.position.set(0, -5, 5);
    scene.add(hearthLight);

    // Luzes pontuais coloridas suaves nas extremidades
    const blueGlow = new THREE.PointLight(0x4a90e2, 1.1, 18);
    blueGlow.position.set(-8, 3, 3);
    scene.add(blueGlow);

    const greenGlow = new THREE.PointLight(0x2ecc71, 1.1, 18);
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

    // 6. Construção dos 4 Estandartes com Proporção Exata 1:2 (Zero Distorção)
    const bannerMeshes: {
      group: THREE.Group;
      mesh: THREE.Mesh;
      initialPos: THREE.Vector3;
      house: HouseInfo;
      geom: THREE.PlaneGeometry;
      mat: THREE.MeshStandardMaterial;
      texture: THREE.CanvasTexture;
      origPos: Float32Array;
      index: number;
    }[] = [];

    const fabricBumpTexture = createFabricBumpTexture();

    // Aspect ratio exatamente 1:2 igual ao canvas 1024x2048
    const bannerWidth = 2.2;
    const bannerHeight = 4.4;
    const poleRadius = 0.052;
    const poleLength = bannerWidth + 0.34;
    const ropeLength = 1.4;

    const poleGeom = new THREE.CylinderGeometry(poleRadius, poleRadius, poleLength, 20);
    poleGeom.rotateZ(Math.PI / 2);
    const poleMat = new THREE.MeshStandardMaterial({
      color: 0xe5b84c,
      metalness: 0.85,
      roughness: 0.25,
    });
    const finialGeom = new THREE.SphereGeometry(0.12, 16, 16);
    const ropeGeom = new THREE.CylinderGeometry(0.018, 0.018, ropeLength, 8);
    const ropeMat = new THREE.MeshStandardMaterial({
      color: 0xc8963e,
      roughness: 0.6,
    });

    // Espaçamento amplo garantindo respiração visual (nunca colados)
    const spacing = isMobile ? 3.2 : isTablet ? 2.85 : 2.95;
    const startX = -((HOUSES_DATA.length - 1) * spacing) / 2;

    HOUSES_DATA.forEach((house, idx) => {
      const posX = startX + idx * spacing;
      const posY = 0.08;

      const bannerGroup = new THREE.Group();
      bannerGroup.position.set(posX, posY, 0);

      // Malha de tecido denso para ondulações realistas
      const geom = new THREE.PlaneGeometry(bannerWidth, bannerHeight, 24, 38);
      const origPos = geom.attributes.position.array.slice() as Float32Array;

      const texture = createBannerTexture(house, () => isDisposed);
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        bumpMap: fabricBumpTexture,
        bumpScale: 0.016,
        side: THREE.DoubleSide,
        roughness: 0.68,
        metalness: 0.06,
        alphaTest: 0.42,
      });

      const mesh = new THREE.Mesh(geom, mat);
      bannerGroup.add(mesh);

      // Vara de Latão Maciço Individual com Pontas em Pinha Medieval
      const poleMesh = new THREE.Mesh(poleGeom, poleMat);
      poleMesh.position.set(0, bannerHeight / 2 + 0.05, 0.04);
      bannerGroup.add(poleMesh);

      // Pontas ornamentais esféricas douradas nas extremidades de cada vara
      [-1, 1].forEach((dir) => {
        const finialMesh = new THREE.Mesh(finialGeom, poleMat);
        finialMesh.position.set((dir * poleLength) / 2, bannerHeight / 2 + 0.05, 0.04);
        bannerGroup.add(finialMesh);
      });

      // Cordas / Cabos de sustentação dourados subindo ao teto abobadado
      [-1, 1].forEach((dir) => {
        const ropeMesh = new THREE.Mesh(ropeGeom, ropeMat);
        ropeMesh.rotation.z = dir * 0.12;
        ropeMesh.position.set(
          dir * (bannerWidth * 0.36),
          bannerHeight / 2 + 0.05 + ropeLength / 2,
          0.02
        );
        bannerGroup.add(ropeMesh);
      });

      scene.add(bannerGroup);

      bannerMeshes.push({
        group: bannerGroup,
        mesh,
        initialPos: bannerGroup.position.clone(),
        house,
        geom,
        mat,
        texture,
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
          if (onSelectHouseRef.current) onSelectHouseRef.current(hit.house.id);
        }
      }
    };

    renderer.domElement.addEventListener('click', handlePointerDown);

    // 8. Loop de Animação com Física de Tecido e Câmera Deslizante
    let animationFrameId: number;
    const clock = new THREE.Clock();
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
        const selectedBanner = bannerMeshes[activeHouseIndexRef.current];
        if (selectedBanner) {
          targetCamX.current = selectedBanner.initialPos.x;
        }
      } else {
        targetCamX.current = 0;
      }
      camera.position.x += (targetCamX.current - camera.position.x) * 0.08;

      // Ondulação física do tecido ao vento de Hogwarts
      bannerMeshes.forEach(({ group, geom, origPos, initialPos, house }, bIndex) => {
        const isCurrentSelected = house.id === selectedHouseIdRef.current;
        // Estandarte ativo e sua haste se projetam juntos para frente
        const targetZ = isCurrentSelected ? initialPos.z + 0.55 : initialPos.z;
        group.position.z += (targetZ - group.position.z) * 0.08;

        const posAttr = geom.attributes.position;
        const count = posAttr.count;

        for (let i = 0; i < count; i++) {
          const origX = origPos[i * 3];
          const origY = origPos[i * 3 + 1];

          // Topo preso à vara, base livre para flutuar
          const freedom = Math.pow(
            Math.max(0, (bannerHeight / 2 - origY) / bannerHeight),
            1.35
          );

          // Equações de vento ondulatório suave
          const waveZ =
            Math.sin(origY * 1.6 + time * 3.2 + bIndex * 1.2) * 0.22 * freedom +
            Math.cos(origX * 2.5 + time * 2.4) * 0.07 * freedom +
            Math.sin(time * 1.6 + bIndex) * 0.04 * freedom;

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
      isMobile = newIsMobile;
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
      isDisposed = true;
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handlePointerDown);
      cancelAnimationFrame(animationFrameId);

      bannerMeshes.forEach(({ geom, mat, texture }) => {
        geom.dispose();
        mat.dispose();
        texture.dispose();
      });
      fabricBumpTexture.dispose();
      poleGeom.dispose();
      poleMat.dispose();
      finialGeom.dispose();
      ropeGeom.dispose();
      ropeMat.dispose();
      particleGeom.dispose();
      particleMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

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
              <img
                src={HOUSES[h.id].emblemImg}
                alt={h.name}
                draggable={false}
                className="w-4 h-4 object-contain select-none pointer-events-none"
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
              className="w-28 h-28 flex items-center justify-center p-2 relative select-none"
            >
              <div
                className="absolute inset-2 rounded-full blur-xl opacity-35 pointer-events-none"
                style={{ backgroundColor: selectedHouse.primaryColor }}
              />
              <img
                src={HOUSES[selectedHouse.id].emblemImg}
                alt={`Emblema da Casa ${selectedHouse.name}`}
                draggable={false}
                className="relative z-10 w-full h-full object-contain drop-shadow-[0_10px_22px_rgba(0,0,0,0.75)] pointer-events-none"
              />
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

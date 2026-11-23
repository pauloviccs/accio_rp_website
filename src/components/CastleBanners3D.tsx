import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Compass, Wand2 } from 'lucide-react';
import { soundManager } from '../lib/audio';
import { HouseId } from '../types';

interface CastleBanners3DProps {
  onSelectHouse?: (house: HouseId) => void;
  onOpenFormWithHouse?: (house: HouseId) => void;
}

interface HouseInfo {
  id: HouseId;
  name: string;
  motto: string;
  virtues: string[];
  colors: string;
  founder: string;
  ghost: string;
  location: string;
  element: string;
  primaryColor: string;
  accentColor: string;
  crestAnimal: string;
}

const HOUSES_DATA: HouseInfo[] = [
  {
    id: 'gryffindor',
    name: 'Grifinória',
    motto: 'Forti Animo Estote',
    virtues: ['Coragem', 'Ousadia', 'Nobreza de Espírito'],
    colors: 'Escarlate & Ouro',
    founder: 'Godric Gryffindor',
    ghost: 'Sir Nicholas de Mimsy-Porpington',
    location: 'Sétimo Andar, Torre Leste de Hogwarts',
    element: 'Fogo',
    primaryColor: '#740001',
    accentColor: '#D3A625',
    crestAnimal: 'LEÃO',
  },
  {
    id: 'slytherin',
    name: 'Sonserina',
    motto: 'Ambitio Super Omnia',
    virtues: ['Ambição', 'Astúcia', 'Engenhosidade'],
    colors: 'Verde Esmeralda & Prata',
    founder: 'Salazar Slytherin',
    ghost: 'Barão Sangrento',
    location: 'Masmorras, Sob as Águas do Lago Negro',
    element: 'Água',
    primaryColor: '#1A472A',
    accentColor: '#AAAAAA',
    crestAnimal: 'SERPENTE',
  },
  {
    id: 'ravenclaw',
    name: 'Corvinal',
    motto: 'Sapientia Prima Ars',
    virtues: ['Sabedoria', 'Intelecto', 'Criatividade'],
    colors: 'Azul Safira & Bronze',
    founder: 'Rowena Ravenclaw',
    ghost: 'Dama Cinzenta (Helena Ravenclaw)',
    location: 'Torre Oeste de Hogwarts',
    element: 'Ar',
    primaryColor: '#0E1A40',
    accentColor: '#946B2D',
    crestAnimal: 'ÁGUIA',
  },
  {
    id: 'hufflepuff',
    name: 'Lufa-Lufa',
    motto: 'Fides et Diligentia',
    virtues: ['Lealdade', 'Dedicação', 'Justiça'],
    colors: 'Amarelo Canário & Preto',
    founder: 'Helga Hufflepuff',
    ghost: 'Frei Gorducho',
    location: 'Próximo às Cozinhas de Hogwarts',
    element: 'Terra',
    primaryColor: '#C49000',
    accentColor: '#2B231D',
    crestAnimal: 'TEXUGO',
  },
];

// Gerador de textura rica para estandarte gótico em Canvas 2D
function createBannerTexture(house: HouseInfo): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Fundo principal de seda/veludo
  const grad = ctx.createLinearGradient(0, 0, 512, 1024);
  grad.addColorStop(0, house.primaryColor);
  grad.addColorStop(0.5, house.primaryColor);
  grad.addColorStop(1, '#080202');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 1024);

  // Textura sutil de tecido
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  for (let i = 0; i < 512; i += 4) {
    ctx.fillRect(i, 0, 2, 1024);
  }

  // Borda ornamental gótica dourada/prateada
  ctx.strokeStyle = house.accentColor;
  ctx.lineWidth = 14;
  ctx.strokeRect(20, 20, 472, 984);

  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, 440, 952);

  // Recorte pontiagudo na base do estandarte (V-shape)
  ctx.fillStyle = '#0D0202';
  ctx.beginPath();
  ctx.moveTo(0, 1024);
  ctx.lineTo(256, 920);
  ctx.lineTo(512, 1024);
  ctx.lineTo(512, 1024);
  ctx.closePath();
  ctx.fill();

  // Brasão / Medalhão Central
  const centerX = 256;
  const centerY = 450;
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(10, 5, 5, 0.85)';
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = house.accentColor;
  ctx.stroke();

  // Animal Simbólico / Nome
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Letra inicial medieval
  ctx.font = 'bold 120px "Cinzel", serif, Georgia';
  ctx.fillStyle = house.accentColor;
  ctx.shadowColor = house.accentColor;
  ctx.shadowBlur = 15;
  ctx.fillText(house.name.charAt(0), centerX, centerY - 15);

  ctx.shadowBlur = 0;
  ctx.font = 'bold 22px "Cinzel", sans-serif';
  ctx.fillStyle = '#FFF0B2';
  ctx.fillText(house.crestAnimal, centerX, centerY + 80);

  // Nome da Casa no Topo
  ctx.font = 'bold 44px "Cinzel", serif, Georgia';
  ctx.fillStyle = '#FFF0B2';
  ctx.fillText(house.name.toUpperCase(), centerX, 160);

  // Lema no rodapé do estandarte
  ctx.font = 'italic 20px "Crimson Text", Georgia, serif';
  ctx.fillStyle = house.accentColor;
  ctx.fillText(`"${house.motto}"`, centerX, 840);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  return texture;
}

export const CastleBanners3D: React.FC<CastleBanners3DProps> = ({
  onSelectHouse,
  onOpenFormWithHouse,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedHouse, setSelectedHouse] = useState<HouseInfo>(HOUSES_DATA[0]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = 480;

    // 1. Cenário 3D
    const scene = new THREE.Scene();

    // 2. Câmera Perspectiva
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // 3. Renderizador WebGL de alta eficiência
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 4. Luzes de Velas & Fachos do Castelo
    const ambientLight = new THREE.AmbientLight(0xfff0b2, 0.7);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffc34f, 2.5, 20);
    pointLight.position.set(0, 3, 4);
    scene.add(pointLight);

    // 5. Construção dos 4 Estandartes
    const bannerMeshes: {
      mesh: THREE.Mesh;
      initialPos: THREE.Vector3;
      house: HouseInfo;
      geom: THREE.PlaneGeometry;
      origPos: Float32Array;
    }[] = [];

    const bannerWidth = 1.25;
    const bannerHeight = 3.0;
    const spacing = 1.6;
    const startX = -((HOUSES_DATA.length - 1) * spacing) / 2;

    HOUSES_DATA.forEach((house, idx) => {
      // Geometria de tecido com subdivisões para ondulação suave
      const geom = new THREE.PlaneGeometry(bannerWidth, bannerHeight, 18, 30);
      const origPos = geom.attributes.position.array.slice() as Float32Array;

      const texture = createBannerTexture(house);
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        roughness: 0.45,
        metalness: 0.15,
      });

      const mesh = new THREE.Mesh(geom, mat);
      const posX = startX + idx * spacing;
      mesh.position.set(posX, 0.2, 0);
      scene.add(mesh);

      // Vara de latão gótica segurando o topo
      const poleGeom = new THREE.CylinderGeometry(0.04, 0.04, bannerWidth + 0.3, 16);
      poleGeom.rotateZ(Math.PI / 2);
      const poleMat = new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        metalness: 0.8,
        roughness: 0.3,
      });
      const poleMesh = new THREE.Mesh(poleGeom, poleMat);
      poleMesh.position.set(posX, 0.2 + bannerHeight / 2 + 0.03, 0.02);
      scene.add(poleMesh);

      // Pontas ornamentais nas extremidades da vara
      [-1, 1].forEach((dir) => {
        const finialGeom = new THREE.SphereGeometry(0.08, 12, 12);
        const finialMesh = new THREE.Mesh(finialGeom, poleMat);
        finialMesh.position.set(
          posX + (dir * (bannerWidth + 0.3)) / 2,
          0.2 + bannerHeight / 2 + 0.03,
          0.02
        );
        scene.add(finialMesh);
      });

      bannerMeshes.push({
        mesh,
        initialPos: mesh.position.clone(),
        house,
        geom,
        origPos,
      });
    });

    // 6. Raycaster para clique e seleção 3D
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
          if (onSelectHouse) onSelectHouse(hit.house.id);
        }
      }
    };

    renderer.domElement.addEventListener('click', handlePointerDown);

    // 7. Loop de Animação com Física de Tecido (Vento nas Torres)
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let isVisible = true;

    // Observador para congelar o loop quando fora de tela (0% GPU)
    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    observer.observe(container);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const time = clock.getElapsedTime();

      // Ondulação física da bandeira
      bannerMeshes.forEach(({ mesh, geom, origPos, initialPos, house }, bIndex) => {
        const isCurrentSelected = house.id === selectedHouse.id;
        const targetZ = isCurrentSelected ? initialPos.z + 0.45 : initialPos.z;
        mesh.position.z += (targetZ - mesh.position.z) * 0.08;

        const posAttr = geom.attributes.position;
        const count = posAttr.count;

        for (let i = 0; i < count; i++) {
          const origX = origPos[i * 3];
          const origY = origPos[i * 3 + 1];

          // Fator de liberdade: topo fixo (0), base livre (1)
          const freedom = (1.5 - origY) / 3.0;

          // Onda senoidal de vento com turbulência
          const waveZ =
            Math.sin(origY * 2.8 + time * 3.2 + bIndex * 1.4) * 0.16 * freedom +
            Math.cos(origX * 3.5 + time * 2.4) * 0.04 * freedom;

          posAttr.setZ(i, waveZ);
        }

        posAttr.needsUpdate = true;
        geom.computeVertexNormals();
      });

      renderer.render(scene, camera);
    };

    animate();

    // Redimensionamento responsivo
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      camera.aspect = newWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, height);
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
  }, [selectedHouse]);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#B83A0C]/20 relative">
      
      {/* Título da Seção */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <span className="text-xs uppercase tracking-[0.25em] text-[#FFC34F] font-bold block mb-2 flex items-center justify-center gap-2">
          <Compass className="w-4 h-4 text-[#FFC34F] animate-spin" style={{ animationDuration: '15s' }} />
          <span>Exploração do Castelo & As Quatro Casas</span>
        </span>
        <h2 className="font-cinzel text-3xl sm:text-4xl font-extrabold text-[#FFF0B2] mb-3">
          Os Grandes Estandartes de Hogwarts
        </h2>
        <p className="font-crimson text-base sm:text-lg text-[#FFF0B2]/70">
          Toque em qualquer estandarte tridimensional para inspecionar os mistérios, história e virtudes de cada Casa ancestral.
        </p>
      </div>

      {/* CONTAINER DO WEBGL THREE.JS */}
      <div
        ref={mountRef}
        className="w-full h-[480px] relative flex items-center justify-center cursor-pointer select-none"
      >
        {/* Dica de interação para mobile e desktop */}
        <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none z-10">
          <span className="text-[11px] font-semibold text-[#FFC34F]/80 bg-[#160504]/80 px-3.5 py-1 rounded-full border border-[#B83A0C]/30 backdrop-blur-md">
            ✨ Clique ou toque nas bandeiras para selecioná-las
          </span>
        </div>
      </div>

      {/* PAINEL DE DETALHES DA CASA SELECIONADA */}
      <div className="mt-6 max-w-4xl mx-auto bg-[#1A0605] border-2 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl transition-all duration-500 relative overflow-hidden"
        style={{ borderColor: selectedHouse.primaryColor }}
      >
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[100px] pointer-events-none opacity-40"
          style={{ backgroundColor: selectedHouse.primaryColor }}
        />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Informações Centrais da Casa */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: selectedHouse.accentColor }}
              />
              <span className="text-xs uppercase tracking-widest font-bold text-[#FFC34F]">
                {selectedHouse.colors} · Elemento {selectedHouse.element}
              </span>
            </div>

            <h3 className="font-cinzel text-2xl sm:text-3xl font-extrabold text-[#FFF0B2]">
              Casa {selectedHouse.name}
            </h3>

            <p className="font-crimson italic text-base text-[#FFF0B2]/90">
              "{selectedHouse.motto}"
            </p>

            {/* Virtudes */}
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedHouse.virtues.map((v) => (
                <span
                  key={v}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#210604] border border-white/10 text-[#FFF0B2]"
                >
                  ⚔️ {v}
                </span>
              ))}
            </div>

            {/* Metadados Canônicos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#FFF0B2]/80 pt-2 border-t border-white/10">
              <div>
                <span className="text-[#FFC34F] block font-semibold">Fundador(a):</span>
                <span>{selectedHouse.founder}</span>
              </div>
              <div>
                <span className="text-[#FFC34F] block font-semibold">Fantasma Residente:</span>
                <span>{selectedHouse.ghost}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[#FFC34F] block font-semibold">Salão Comunal:</span>
                <span>{selectedHouse.location}</span>
              </div>
            </div>
          </div>

          {/* Ação de Escolha */}
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#100303]/90 border border-white/10 text-center space-y-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg"
              style={{ backgroundColor: selectedHouse.primaryColor }}
            >
              {selectedHouse.name.charAt(0)}
            </div>

            <span className="text-xs text-[#FFF0B2]/70">
              Deseja aspirar a esta nobre casa no seu pré-registro?
            </span>

            {onOpenFormWithHouse && (
              <button
                onClick={() => {
                  soundManager.playSparkle();
                  onOpenFormWithHouse(selectedHouse.id);
                }}
                className="w-full py-2.5 px-4 rounded-xl btn-accio-gold text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Escolher {selectedHouse.name}</span>
              </button>
            )}
          </div>

        </div>
      </div>

    </section>
  );
};

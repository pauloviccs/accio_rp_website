import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Compass, Wand2, Sparkles } from 'lucide-react';
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
    primaryColor: '#7A0A0A',
    accentColor: '#EEBA30',
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
    primaryColor: '#1A4D2E',
    accentColor: '#C0C0C0',
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
    primaryColor: '#0F265C',
    accentColor: '#B08846',
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
    primaryColor: '#D99B00',
    accentColor: '#2B231D',
    crestAnimal: 'TEXUGO',
  },
];

// Gerador de textura rica em alta resolução (1024x2048) com bordas ornamentais
function createBannerTexture(house: HouseInfo): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Fundo do tecido com degradê suntuoso de seda/veludo
  const grad = ctx.createLinearGradient(0, 0, 1024, 2048);
  grad.addColorStop(0, house.primaryColor);
  grad.addColorStop(0.35, house.primaryColor);
  grad.addColorStop(0.7, '#1A0606');
  grad.addColorStop(1, '#080101');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 2048);

  // 2. Trama vertical de tecido bordado
  ctx.fillStyle = 'rgba(255, 255, 255, 0.025)';
  for (let i = 0; i < 1024; i += 6) {
    ctx.fillRect(i, 0, 3, 2048);
  }

  // 3. Moldura ornamental gótica dupla
  ctx.strokeStyle = house.accentColor;
  ctx.lineWidth = 26;
  ctx.strokeRect(36, 36, 952, 1976);

  ctx.lineWidth = 8;
  ctx.strokeRect(70, 70, 884, 1908);

  // Detalhes de cantos ornamentais medievais
  const cornerSize = 80;
  [[36, 36], [988 - cornerSize, 36]].forEach(([cx, cy]) => {
    ctx.fillStyle = house.accentColor;
    ctx.fillRect(cx, cy, cornerSize, 14);
    ctx.fillRect(cx, cy, 14, cornerSize);
  });

  // 4. Recorte triangular na cauda inferior do estandarte (V-shape canônico)
  ctx.fillStyle = '#0B0202';
  ctx.beginPath();
  ctx.moveTo(0, 2048);
  ctx.lineTo(512, 1850);
  ctx.lineTo(1024, 2048);
  ctx.lineTo(1024, 2048);
  ctx.closePath();
  ctx.fill();

  // Borda na cauda
  ctx.strokeStyle = house.accentColor;
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(36, 2012);
  ctx.lineTo(512, 1840);
  ctx.lineTo(988, 2012);
  ctx.stroke();

  // 5. Medalhão Central / Brasão Ancestral
  const centerX = 512;
  const centerY = 920;
  ctx.save();

  // Halo luminoso no fundo do brasão
  const haloGrad = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, 340);
  haloGrad.addColorStop(0, 'rgba(255, 240, 178, 0.18)');
  haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = haloGrad;
  ctx.fillRect(centerX - 350, centerY - 350, 700, 700);

  // Escudo central gótico
  ctx.beginPath();
  ctx.arc(centerX, centerY, 290, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(12, 4, 4, 0.9)';
  ctx.fill();
  ctx.lineWidth = 16;
  ctx.strokeStyle = house.accentColor;
  ctx.stroke();

  // Segunda borda interna do escudo
  ctx.beginPath();
  ctx.arc(centerX, centerY, 265, 0, Math.PI * 2);
  ctx.lineWidth = 6;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Letra Monograma Gótica Majestosa
  ctx.font = '900 240px "Cinzel", "Times New Roman", serif';
  ctx.fillStyle = house.accentColor;
  ctx.shadowColor = house.accentColor;
  ctx.shadowBlur = 35;
  ctx.fillText(house.name.charAt(0), centerX, centerY - 25);

  ctx.shadowBlur = 0;
  // Animal da Casa
  ctx.font = 'bold 44px "Cinzel", sans-serif';
  ctx.fillStyle = '#FFF0B2';
  ctx.letterSpacing = '8px';
  ctx.fillText(`• ${house.crestAnimal} •`, centerX, centerY + 160);

  // Nome da Casa no Cabeçalho
  ctx.font = 'bold 78px "Cinzel", serif';
  ctx.fillStyle = '#FFF0B2';
  ctx.shadowColor = 'rgba(0,0,0,0.8)';
  ctx.shadowBlur = 15;
  ctx.fillText(house.name.toUpperCase(), centerX, 320);

  // Lema Latino Canônico na Faixa Inferior
  ctx.font = 'italic bold 42px "Crimson Text", Georgia, serif';
  ctx.fillStyle = house.accentColor;
  ctx.shadowBlur = 10;
  ctx.fillText(`"${house.motto}"`, centerX, 1680);

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

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = Math.max(580, Math.min(680, window.innerHeight * 0.7));

    // 1. Cenário 3D
    const scene = new THREE.Scene();

    // 2. Câmera
    const camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100);
    // Posicionamento que enquadra os 4 estandartes com escala imponente
    const cameraZ = width < 768 ? 10.5 : width < 1200 ? 8.6 : 7.6;
    camera.position.set(0, -0.1, cameraZ);

    // 3. Renderizador WebGL
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 4. Luzes de Velas & Tochas de Hogwarts
    const ambientLight = new THREE.AmbientLight(0xfff0b2, 0.85);
    scene.add(ambientLight);

    const mainTorch = new THREE.DirectionalLight(0xffd580, 2.2);
    mainTorch.position.set(0, 5, 6);
    scene.add(mainTorch);

    // Luz de preenchimento quente vinda de baixo (lareiras do castelo)
    const hearthLight = new THREE.PointLight(0xff8c42, 1.8, 25);
    hearthLight.position.set(0, -4, 4);
    scene.add(hearthLight);

    // 5. Partículas Estelares / Brasas Flutuantes no Ar do Castelo
    const particleCount = 75;
    const particleGeom = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 14;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xffc34f,
      size: 0.06,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const dustParticles = new THREE.Points(particleGeom, particleMat);
    scene.add(dustParticles);

    // 6. Construção dos 4 Grandes Estandartes (Escala Majestosa & Espaçamento Amplo)
    const bannerMeshes: {
      mesh: THREE.Mesh;
      initialPos: THREE.Vector3;
      house: HouseInfo;
      geom: THREE.PlaneGeometry;
      origPos: Float32Array;
    }[] = [];

    // Dimensões ampliadas para presença visual dramática
    const bannerWidth = 1.85;
    const bannerHeight = 4.1;
    // Espaçamento amplo para diagramação refinada (evitando qualquer aperto)
    const spacing = width < 768 ? 2.1 : 2.65;
    const startX = -((HOUSES_DATA.length - 1) * spacing) / 2;

    HOUSES_DATA.forEach((house, idx) => {
      // Malha de tecido de alta densidade para dobras orgânicas
      const geom = new THREE.PlaneGeometry(bannerWidth, bannerHeight, 22, 36);
      const origPos = geom.attributes.position.array.slice() as Float32Array;

      const texture = createBannerTexture(house);
      const mat = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        roughness: 0.38,
        metalness: 0.18,
      });

      const mesh = new THREE.Mesh(geom, mat);
      const posX = startX + idx * spacing;
      mesh.position.set(posX, 0.15, 0);
      scene.add(mesh);

      // Vara de Latão Gótica com Pontas Ornamentais
      const poleRadius = 0.055;
      const poleGeom = new THREE.CylinderGeometry(poleRadius, poleRadius, bannerWidth + 0.5, 20);
      poleGeom.rotateZ(Math.PI / 2);
      const poleMat = new THREE.MeshStandardMaterial({
        color: 0xe0b246,
        metalness: 0.85,
        roughness: 0.25,
      });
      const poleMesh = new THREE.Mesh(poleGeom, poleMat);
      poleMesh.position.set(posX, 0.15 + bannerHeight / 2 + 0.05, 0.03);
      scene.add(poleMesh);

      // Pontas ornamentais esféricas de coroa
      [-1, 1].forEach((dir) => {
        const finialGeom = new THREE.SphereGeometry(0.12, 16, 16);
        const finialMesh = new THREE.Mesh(finialGeom, poleMat);
        finialMesh.position.set(
          posX + (dir * (bannerWidth + 0.5)) / 2,
          0.15 + bannerHeight / 2 + 0.05,
          0.03
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

    // 7. Raycaster para clique e seleção 3D
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

    // 8. Loop de Animação com Física de Tecido e Poeira
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

      // Flutuação sutil das partículas no ar
      dustParticles.rotation.y = time * 0.03;
      dustParticles.rotation.x = Math.sin(time * 0.05) * 0.05;

      // Ondulação física da bandeira (Vento nas Colinas de Hogwarts)
      bannerMeshes.forEach(({ mesh, geom, origPos, initialPos, house }, bIndex) => {
        const isCurrentSelected = house.id === selectedHouse.id;
        // Destaque para a bandeira selecionada que avança em direção à câmera
        const targetZ = isCurrentSelected ? initialPos.z + 0.55 : initialPos.z;
        mesh.position.z += (targetZ - mesh.position.z) * 0.08;

        const posAttr = geom.attributes.position;
        const count = posAttr.count;

        for (let i = 0; i < count; i++) {
          const origX = origPos[i * 3];
          const origY = origPos[i * 3 + 1];

          // Fator de liberdade: topo preso à vara (0), base livre (1)
          const freedom = Math.pow((bannerHeight / 2 - origY) / bannerHeight, 1.4);

          // Equações de vento ondulatório fluido com perturbações secundárias
          const waveZ =
            Math.sin(origY * 1.8 + time * 3.4 + bIndex * 1.3) * 0.22 * freedom +
            Math.cos(origX * 2.8 + time * 2.6) * 0.07 * freedom +
            Math.sin(time * 1.8 + bIndex) * 0.04 * freedom;

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
      const newHeight = Math.max(580, Math.min(680, window.innerHeight * 0.7));
      const newCameraZ = newWidth < 768 ? 10.5 : newWidth < 1200 ? 8.6 : 7.6;
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
  }, [selectedHouse]);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#B83A0C]/20 relative">
      
      {/* Título da Seção */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-[0.25em] text-[#FFC34F] font-bold block mb-2 flex items-center justify-center gap-2">
          <Compass className="w-4 h-4 text-[#FFC34F] animate-spin" style={{ animationDuration: '20s' }} />
          <span>Exploração do Castelo & As Quatro Casas</span>
        </span>
        <h2 className="font-cinzel text-3xl sm:text-5xl font-extrabold text-[#FFF0B2] mb-3">
          Os Grandes Estandartes de Hogwarts
        </h2>
        <p className="font-crimson text-base sm:text-xl text-[#FFF0B2]/75 max-w-2xl mx-auto leading-relaxed">
          Estandartes tecidos em seda mágica ondulando sob os arcos do Grande Salão. Toque em qualquer flâmula tridimensional para revelar os segredos de sua Casa.
        </p>
      </div>

      {/* CONTAINER DO WEBGL THREE.JS (Altura Ampla e Confortável) */}
      <div
        ref={mountRef}
        className="w-full h-[580px] sm:h-[640px] relative flex items-center justify-center cursor-pointer select-none"
      >
        <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none z-10">
          <span className="text-xs font-semibold text-[#FFC34F] bg-[#160504]/90 px-4 py-1.5 rounded-full border border-[#B83A0C]/40 backdrop-blur-md shadow-xl flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FFC34F] animate-pulse" />
            <span>Toque nas bandeiras para selecioná-las e inspecionar sua história</span>
          </span>
        </div>
      </div>

      {/* PAINEL DE DETALHES DA CASA SELECIONADA */}
      <div 
        className="mt-8 max-w-4xl mx-auto bg-[#1A0605] border-2 rounded-3xl p-6 sm:p-9 shadow-2xl backdrop-blur-xl transition-all duration-500 relative overflow-hidden"
        style={{ borderColor: selectedHouse.accentColor }}
      >
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[110px] pointer-events-none opacity-30"
          style={{ backgroundColor: selectedHouse.primaryColor }}
        />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-3">
              <span
                className="w-4 h-4 rounded-full shadow-sm"
                style={{ backgroundColor: selectedHouse.accentColor }}
              />
              <span className="text-xs uppercase tracking-widest font-bold text-[#FFC34F]">
                {selectedHouse.colors} · Elemento {selectedHouse.element}
              </span>
            </div>

            <h3 className="font-cinzel text-2xl sm:text-4xl font-extrabold text-[#FFF0B2]">
              Casa {selectedHouse.name}
            </h3>

            <p className="font-crimson italic text-lg text-[#FFF0B2]/90">
              "{selectedHouse.motto}"
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {selectedHouse.virtues.map((v) => (
                <span
                  key={v}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#210604] border border-white/10 text-[#FFF0B2] shadow-sm"
                >
                  ⚔️ {v}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-[#FFF0B2]/85 pt-3 border-t border-white/10">
              <div>
                <span className="text-[#FFC34F] block font-semibold">Fundador(a):</span>
                <span className="text-sm">{selectedHouse.founder}</span>
              </div>
              <div>
                <span className="text-[#FFC34F] block font-semibold">Fantasma Residente:</span>
                <span className="text-sm">{selectedHouse.ghost}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[#FFC34F] block font-semibold">Salão Comunal:</span>
                <span className="text-sm leading-relaxed">{selectedHouse.location}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 sm:p-7 rounded-2xl bg-[#100303]/90 border border-white/10 text-center space-y-4 shadow-xl">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-2xl border border-white/20"
              style={{ backgroundColor: selectedHouse.primaryColor }}
            >
              {selectedHouse.name.charAt(0)}
            </div>

            <span className="text-xs text-[#FFF0B2]/70 leading-relaxed">
              Deseja aspirar a esta nobre casa na sua convocação oficial?
            </span>

            {onOpenFormWithHouse && (
              <button
                onClick={() => {
                  soundManager.playSparkle();
                  onOpenFormWithHouse(selectedHouse.id);
                }}
                className="w-full py-3 px-4 rounded-xl btn-accio-gold text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg"
              >
                <Wand2 className="w-4 h-4" />
                <span>Escolher {selectedHouse.name}</span>
              </button>
            )}
          </div>

        </div>
      </div>

    </section>
  );
};

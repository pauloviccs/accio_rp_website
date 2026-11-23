import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  hue: string;
}

const HOUSE_PARTICLE_PALETTES: Record<string, string[]> = {
  gryffindor: ['#FFF0B2', '#FFC34F', '#F47A16', '#FFE28A', '#B83A0C'],
  slytherin: ['#F1F5F9', '#34D399', '#2ECC71', '#059669', '#A7F3D0'],
  ravenclaw: ['#EFF6FF', '#60A5FA', '#93C5FD', '#C59A4E', '#3B82F6'],
  hufflepuff: ['#FEF08A', '#F59E0B', '#FBBF24', '#D97706', '#FDE047'],
};

export const ParticleCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const getActiveColors = () => {
      const theme = document.documentElement.getAttribute('data-house-theme') || 'gryffindor';
      return HOUSE_PARTICLE_PALETTES[theme] || HOUSE_PARTICLE_PALETTES.gryffindor;
    };

    const particleCount = Math.min(Math.floor(width / 24), 70);
    const particles: Particle[] = [];
    const initialColors = getActiveColors();

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.4 + 0.6,
        speedY: -(Math.random() * 0.45 + 0.15),
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.65 + 0.2,
        hue: initialColors[Math.floor(Math.random() * initialColors.length)],
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const currentColors = getActiveColors();

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
          // Ao reiniciar na base, assume uma cor da paleta da casa ativa
          p.hue = currentColors[Math.floor(Math.random() * currentColors.length)];
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.hue;
        ctx.globalAlpha = p.opacity;
        ctx.shadowBlur = p.size * 3.5;
        ctx.shadowColor = p.hue;
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-75 transition-opacity duration-1000"
    />
  );
};

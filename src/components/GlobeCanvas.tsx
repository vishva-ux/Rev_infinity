'use client';
import { useEffect, useRef } from 'react';

// Simplified continent landmass lat/lng points to form realistic Earth outline
const CONTINENTS_LAT_LNG: [number, number][] = [
  // North America
  [60,-100],[55,-120],[50,-110],[45,-90],[40,-100],[35,-115],[30,-100],[25,-90],[65,-150],[58,-135],[48,-124],
  // South America
  [10,-75],[5,-70],[0,-60],[-10,-55],[-20,-45],[-30,-60],[-40,-65],[-50,-70],[-15,-50],[-25,-55],
  // Europe
  [60,10],[55,20],[50,5],[45,15],[40,0],[50,30],[65,25],[48,2.5],[52,13],
  // Africa
  [30,10],[20,0],[10,20],[0,25],[-10,20],[-20,25],[-30,20],[15,40],[5,40],[-15,35],
  // Asia / India
  [70,80],[60,100],[50,80],[40,90],[30,70],[20,78],[15,75],[10,78],[28,84],[22,88],[35,105],[45,120],[35,140],[25,115],[15,100],
  // Australia
  [-20,130],[-25,140],[-30,120],[-35,138],[-15,140],[-25,120]
];

interface Arc {
  from: [number, number];
  to: [number, number];
  progress: number;
  speed: number;
  color: string;
}

export default function GlobeCanvas({ size = 320 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2 - 10;
    const radius = size * 0.40;
    let rotationY = 80; // Initial angle showing Asia / India prominently
    let animationFrameId = 0;

    // Generate dense dot grid covering Earth landmasses + ambient grid
    const landDots: { lat: number; lng: number }[] = [];
    CONTINENTS_LAT_LNG.forEach(([lat, lng]) => {
      for (let dLat = -4; dLat <= 4; dLat += 2) {
        for (let dLng = -4; dLng += 4; dLng += 2) {
          landDots.push({ lat: lat + dLat, lng: lng + dLng });
        }
      }
    });

    // Add ambient sphere wire dots
    for (let lat = -80; lat <= 80; lat += 12) {
      for (let lng = -180; lng < 180; lng += 15) {
        landDots.push({ lat, lng });
      }
    }

    // Active Arcs
    const arcs: Arc[] = [
      { from: [20, 78], to: [40, -74], progress: 0.1, speed: 0.006, color: '#8b5cf6' },
      { from: [20, 78], to: [51, 0], progress: 0.4, speed: 0.005, color: '#0066ff' },
      { from: [20, 78], to: [35, 139], progress: 0.7, speed: 0.007, color: '#ec4899' },
      { from: [40, -74], to: [51, 0], progress: 0.2, speed: 0.004, color: '#10b981' },
      { from: [51, 0], to: [35, 139], progress: 0.5, speed: 0.006, color: '#8b5cf6' },
    ];

    function project3D(lat: number, lng: number, rotY: number) {
      const radLat = (lat * Math.PI) / 180;
      const radLng = ((lng + rotY) * Math.PI) / 180;

      const x = radius * Math.cos(radLat) * Math.cos(radLng);
      const y = radius * Math.sin(radLat);
      const z = radius * Math.cos(radLat) * Math.sin(radLng);

      return {
        screenX: cx + x,
        screenY: cy - y,
        z,
        visible: z > -radius * 0.15
      };
    }

    function render() {
      ctx.clearRect(0, 0, size, size);

      // 1. Purple/Blue Outer Atmosphere Glow
      const bgGlow = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.35);
      bgGlow.addColorStop(0, 'rgba(139, 92, 246, 0.18)');
      bgGlow.addColorStop(0.5, 'rgba(0, 102, 255, 0.10)');
      bgGlow.addColorStop(1, 'rgba(11, 15, 25, 0)');
      ctx.fillStyle = bgGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // 2. Outer Ring Meridian Line
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Render Globe Dots
      landDots.forEach(pt => {
        const proj = project3D(pt.lat, pt.lng, rotationY);
        if (!proj.visible) return;

        const opacity = Math.max(0.12, (proj.z + radius) / (2 * radius));
        const dotSize = proj.z > 0 ? 1.4 : 0.9;

        ctx.beginPath();
        ctx.arc(proj.screenX, proj.screenY, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${opacity})`;
        ctx.fill();
      });

      // 4. Glowing Transaction Arcs
      arcs.forEach(arc => {
        const p1 = project3D(arc.from[0], arc.from[1], rotationY);
        const p2 = project3D(arc.to[0], arc.to[1], rotationY);

        if (p1.visible || p2.visible) {
          const midLat = (arc.from[0] + arc.to[0]) / 2 + 15;
          const midLng = (arc.from[1] + arc.to[1]) / 2;
          const pMid = project3D(midLat, midLng, rotationY);

          ctx.beginPath();
          ctx.moveTo(p1.screenX, p1.screenY);
          ctx.quadraticCurveTo(pMid.screenX, pMid.screenY - 20, p2.screenX, p2.screenY);
          ctx.strokeStyle = arc.color + 'aa';
          ctx.lineWidth = 1.5;
          ctx.shadowColor = arc.color;
          ctx.shadowBlur = 8;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Arc Traveling Pulse Dot
          const t = arc.progress;
          const currX = (1 - t) * (1 - t) * p1.screenX + 2 * (1 - t) * t * pMid.screenX + t * t * p2.screenX;
          const currY = (1 - t) * (1 - t) * p1.screenY + 2 * (1 - t) * t * (pMid.screenY - 20) + t * t * p2.screenY;

          ctx.beginPath();
          ctx.arc(currX, currY, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = arc.color;
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;

          arc.progress += arc.speed;
          if (arc.progress > 1) arc.progress = 0;
        }
      });

      // 5. Vertical Equalizer Bars at Bottom Center (from Screenshot!)
      const barCount = 11;
      const barWidth = 3;
      const barGap = 3;
      const startX = cx - ((barCount * (barWidth + barGap)) / 2);
      const startY = cy + radius - 15;

      for (let i = 0; i < barCount; i++) {
        const height = 12 + Math.sin((rotationY * 0.1) + i * 0.6) * 10;
        const x = startX + (i * (barWidth + barGap));
        const y = startY - height;

        const barGrad = ctx.createLinearGradient(x, y + height, x, y);
        barGrad.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
        barGrad.addColorStop(1, '#8b5cf6');

        ctx.fillStyle = barGrad;
        ctx.fillRect(x, y, barWidth, height);
      }

      rotationY += 0.15;
      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [size]);

  return <canvas ref={canvasRef} style={{ display: 'block' }} />;
}

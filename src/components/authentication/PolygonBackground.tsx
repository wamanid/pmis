import { useEffect, useRef, useState } from 'react';

interface Point {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
}

interface Polygon {
  points: Point[];
  fillOpacity: number;
  isAccent?: boolean;
}

export function PolygonBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // Create point with movement
    const createPoint = (x: number, y: number, maxOffset: number = 30): Point => ({
      x,
      y,
      baseX: x,
      baseY: y,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3
    });

    // Initialize polygons with dynamic points
    const polygons: Polygon[] = [
      // Top left section
      { points: [createPoint(0, 0), createPoint(200, 0), createPoint(100, 150)], fillOpacity: 0.4 },
      { points: [createPoint(200, 0), createPoint(350, 100), createPoint(200, 200)], fillOpacity: 0.4 },
      { points: [createPoint(0, 0), createPoint(100, 150), createPoint(0, 200)], fillOpacity: 0.4 },
      { points: [createPoint(100, 150), createPoint(200, 200), createPoint(0, 200)], fillOpacity: 0.4 },
      { points: [createPoint(200, 0), createPoint(400, 50), createPoint(350, 100)], fillOpacity: 0.4 },
      
      // Top right section
      { points: [createPoint(400, 50), createPoint(600, 0), createPoint(700, 150)], fillOpacity: 0.4 },
      { points: [createPoint(600, 0), createPoint(800, 0), createPoint(700, 150)], fillOpacity: 0.4 },
      { points: [createPoint(800, 0), createPoint(1000, 100), createPoint(900, 200)], fillOpacity: 0.4 },
      { points: [createPoint(700, 150), createPoint(900, 200), createPoint(600, 250)], fillOpacity: 0.4 },
      
      // Middle left section
      { points: [createPoint(0, 200), createPoint(150, 300), createPoint(0, 400)], fillOpacity: 0.4 },
      { points: [createPoint(150, 300), createPoint(250, 250), createPoint(200, 400)], fillOpacity: 0.4 },
      { points: [createPoint(200, 200), createPoint(350, 350), createPoint(200, 400)], fillOpacity: 0.4, isAccent: true },
      { points: [createPoint(250, 250), createPoint(400, 300), createPoint(350, 350)], fillOpacity: 0.4 },
      
      // Center section
      { points: [createPoint(350, 100), createPoint(500, 200), createPoint(400, 300)], fillOpacity: 0.4 },
      { points: [createPoint(500, 200), createPoint(650, 250), createPoint(550, 350)], fillOpacity: 0.4, isAccent: true },
      { points: [createPoint(400, 300), createPoint(550, 350), createPoint(450, 450)], fillOpacity: 0.4 },
      { points: [createPoint(550, 350), createPoint(700, 300), createPoint(650, 450)], fillOpacity: 0.4 },
      
      // Middle right section
      { points: [createPoint(700, 150), createPoint(850, 250), createPoint(750, 350)], fillOpacity: 0.4 },
      { points: [createPoint(850, 250), createPoint(1000, 200), createPoint(950, 350)], fillOpacity: 0.4, isAccent: true },
      { points: [createPoint(900, 200), createPoint(1100, 300), createPoint(1000, 400)], fillOpacity: 0.4 },
      { points: [createPoint(750, 350), createPoint(900, 400), createPoint(800, 500)], fillOpacity: 0.4 },
      
      // Bottom left section
      { points: [createPoint(0, 400), createPoint(150, 500), createPoint(0, 600)], fillOpacity: 0.4 },
      { points: [createPoint(150, 500), createPoint(300, 550), createPoint(200, 650)], fillOpacity: 0.4, isAccent: true },
      { points: [createPoint(200, 400), createPoint(350, 550), createPoint(150, 600)], fillOpacity: 0.4 },
      { points: [createPoint(300, 550), createPoint(450, 600), createPoint(350, 700)], fillOpacity: 0.4 },
      
      // Bottom center section
      { points: [createPoint(450, 450), createPoint(600, 550), createPoint(500, 650)], fillOpacity: 0.4 },
      { points: [createPoint(600, 550), createPoint(750, 500), createPoint(700, 650)], fillOpacity: 0.4, isAccent: true },
      { points: [createPoint(500, 650), createPoint(650, 700), createPoint(550, 800)], fillOpacity: 0.4 },
      { points: [createPoint(650, 700), createPoint(800, 750), createPoint(700, 850)], fillOpacity: 0.4 },
      
      // Bottom right section
      { points: [createPoint(800, 500), createPoint(950, 600), createPoint(850, 700)], fillOpacity: 0.4 },
      { points: [createPoint(950, 600), createPoint(1100, 650), createPoint(1000, 750)], fillOpacity: 0.4 },
      { points: [createPoint(850, 700), createPoint(1000, 800), createPoint(900, 900)], fillOpacity: 0.4 },
      { points: [createPoint(1000, 750), createPoint(1200, 700), createPoint(1150, 850)], fillOpacity: 0.4 },
      
      // Additional patterns
      { points: [createPoint(350, 0), createPoint(500, 50), createPoint(450, 150)], fillOpacity: 0.4 },
      { points: [createPoint(500, 50), createPoint(650, 100), createPoint(600, 200)], fillOpacity: 0.4 },
      { points: [createPoint(650, 100), createPoint(800, 150), createPoint(750, 250)], fillOpacity: 0.4 },
      { points: [createPoint(400, 50), createPoint(600, 0), createPoint(700, 150)], fillOpacity: 0.4, isAccent: true },
      
      // Edge patterns
      { points: [createPoint(1000, 100), createPoint(1200, 200), createPoint(1100, 300)], fillOpacity: 0.4 },
      { points: [createPoint(1100, 300), createPoint(1200, 400), createPoint(1100, 500)], fillOpacity: 0.4 },
      { points: [createPoint(0, 600), createPoint(100, 700), createPoint(0, 800)], fillOpacity: 0.4 },
      { points: [createPoint(100, 700), createPoint(200, 800), createPoint(50, 900)], fillOpacity: 0.4 },
      { points: [createPoint(0, 800), createPoint(150, 900), createPoint(0, 1000)], fillOpacity: 0.4 },
    ];

    const maxOffset = 30; // Maximum distance from base position

    const updatePoints = () => {
      polygons.forEach(polygon => {
        polygon.points.forEach(point => {
          // Update position based on velocity
          point.x += point.vx;
          point.y += point.vy;

          // Calculate distance from base position
          const dx = point.x - point.baseX;
          const dy = point.y - point.baseY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // If too far from base, reverse direction
          if (distance > maxOffset) {
            const angle = Math.atan2(dy, dx);
            point.vx = -Math.cos(angle) * 0.3;
            point.vy = -Math.sin(angle) * 0.3;
          }

          // Add some randomness to movement
          point.vx += (Math.random() - 0.5) * 0.02;
          point.vy += (Math.random() - 0.5) * 0.02;

          // Limit velocity
          const speed = Math.sqrt(point.vx * point.vx + point.vy * point.vy);
          if (speed > 0.5) {
            point.vx = (point.vx / speed) * 0.5;
            point.vy = (point.vy / speed) * 0.5;
          }
        });
      });
    };

    const drawPolygon = (polygon: Polygon) => {
      ctx.beginPath();
      ctx.moveTo(polygon.points[0].x, polygon.points[0].y);
      
      for (let i = 1; i < polygon.points.length; i++) {
        ctx.lineTo(polygon.points[i].x, polygon.points[i].y);
      }
      
      ctx.closePath();

      // Fill
      if (polygon.isAccent) {
        ctx.fillStyle = `rgba(101, 0, 0, 0.05)`;
      } else {
        const gradient = ctx.createLinearGradient(
          polygon.points[0].x, 
          polygon.points[0].y,
          polygon.points[polygon.points.length - 1].x,
          polygon.points[polygon.points.length - 1].y
        );
        gradient.addColorStop(0, 'rgba(249, 250, 251, 0.8)');
        gradient.addColorStop(1, 'rgba(229, 231, 235, 0.8)');
        ctx.fillStyle = gradient;
      }
      ctx.globalAlpha = polygon.fillOpacity;
      ctx.fill();

      // Stroke
      ctx.globalAlpha = 1;
      ctx.strokeStyle = polygon.isAccent ? '#650000' : '#650000';
      ctx.lineWidth = polygon.isAccent ? 2 : 1.5;
      ctx.stroke();
    };

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Draw base gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, dimensions.width, dimensions.height);
      bgGradient.addColorStop(0, '#f9fafb');
      bgGradient.addColorStop(0.5, '#f3f4f6');
      bgGradient.addColorStop(1, '#f9fafb');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Update and draw polygons
      updatePoints();
      polygons.forEach(drawPolygon);

      // Draw overlay
      const overlayGradient = ctx.createLinearGradient(0, 0, 0, dimensions.height);
      overlayGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
      overlayGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
      overlayGradient.addColorStop(1, 'rgba(255, 255, 255, 0.4)');
      ctx.fillStyle = overlayGradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ width: dimensions.width, height: dimensions.height }}
      />
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';

interface Wave {
  amplitude: number;
  frequency: number;
  speed: number;
  phase: number;
  opacity: number;
  color: string;
  yOffset: number;
}

export function WavesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef<number>(0);
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

    // Define multiple waves with different properties
    const waves: Wave[] = [
      {
        amplitude: 60,
        frequency: 0.003,
        speed: 0.02,
        phase: 0,
        opacity: 0.15,
        color: '#650000',
        yOffset: dimensions.height * 0.3
      },
      {
        amplitude: 45,
        frequency: 0.0025,
        speed: 0.015,
        phase: Math.PI / 2,
        opacity: 0.1,
        color: '#8B0000',
        yOffset: dimensions.height * 0.35
      },
      {
        amplitude: 50,
        frequency: 0.004,
        speed: 0.025,
        phase: Math.PI,
        opacity: 0.12,
        color: '#650000',
        yOffset: dimensions.height * 0.4
      },
      {
        amplitude: 70,
        frequency: 0.002,
        speed: 0.018,
        phase: Math.PI * 1.5,
        opacity: 0.08,
        color: '#A52A2A',
        yOffset: dimensions.height * 0.5
      },
      {
        amplitude: 40,
        frequency: 0.0035,
        speed: 0.022,
        phase: Math.PI / 4,
        opacity: 0.1,
        color: '#650000',
        yOffset: dimensions.height * 0.6
      },
      {
        amplitude: 55,
        frequency: 0.0028,
        speed: 0.02,
        phase: Math.PI * 0.75,
        opacity: 0.09,
        color: '#8B0000',
        yOffset: dimensions.height * 0.7
      },
      {
        amplitude: 65,
        frequency: 0.0022,
        speed: 0.016,
        phase: Math.PI * 1.25,
        opacity: 0.11,
        color: '#650000',
        yOffset: dimensions.height * 0.8
      }
    ];

    const drawWave = (wave: Wave, time: number) => {
      ctx.beginPath();
      ctx.moveTo(0, dimensions.height);

      // Draw the wave curve
      for (let x = 0; x <= dimensions.width; x += 2) {
        const y = wave.yOffset + 
                  Math.sin(x * wave.frequency + time * wave.speed + wave.phase) * wave.amplitude +
                  Math.sin(x * wave.frequency * 1.5 + time * wave.speed * 0.7) * (wave.amplitude * 0.3);
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      // Complete the shape by drawing to bottom corners
      ctx.lineTo(dimensions.width, dimensions.height);
      ctx.lineTo(0, dimensions.height);
      ctx.closePath();

      // Create gradient fill
      const gradient = ctx.createLinearGradient(0, wave.yOffset - wave.amplitude, 0, dimensions.height);
      gradient.addColorStop(0, wave.color);
      gradient.addColorStop(1, `${wave.color}00`); // Transparent at bottom
      
      ctx.fillStyle = gradient;
      ctx.globalAlpha = wave.opacity;
      ctx.fill();
    };

    const drawTopWaves = (time: number) => {
      // Top decorative waves
      const topWaves = [
        {
          amplitude: 40,
          frequency: 0.004,
          speed: 0.015,
          phase: 0,
          opacity: 0.08,
          color: '#650000',
          yOffset: dimensions.height * 0.15
        },
        {
          amplitude: 30,
          frequency: 0.005,
          speed: 0.02,
          phase: Math.PI / 3,
          opacity: 0.06,
          color: '#8B0000',
          yOffset: dimensions.height * 0.1
        }
      ];

      topWaves.forEach(wave => {
        ctx.beginPath();
        
        for (let x = 0; x <= dimensions.width; x += 2) {
          const y = wave.yOffset + 
                    Math.sin(x * wave.frequency + time * wave.speed + wave.phase) * wave.amplitude;
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Complete the shape by drawing to top corners
        ctx.lineTo(dimensions.width, 0);
        ctx.lineTo(0, 0);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, 0, 0, wave.yOffset + wave.amplitude);
        gradient.addColorStop(0, `${wave.color}00`);
        gradient.addColorStop(1, wave.color);
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = wave.opacity;
        ctx.fill();
      });
    };

    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      // Draw base gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, dimensions.width, dimensions.height);
      bgGradient.addColorStop(0, '#fafafa');
      bgGradient.addColorStop(0.5, '#f5f5f5');
      bgGradient.addColorStop(1, '#f0f0f0');
      ctx.fillStyle = bgGradient;
      ctx.globalAlpha = 1;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Draw top waves
      drawTopWaves(timeRef.current);

      // Draw main waves from back to front
      waves.forEach(wave => {
        drawWave(wave, timeRef.current);
      });

      // Add subtle overlay for depth
      const overlayGradient = ctx.createRadialGradient(
        dimensions.width / 2, 
        dimensions.height / 2, 
        0,
        dimensions.width / 2, 
        dimensions.height / 2, 
        dimensions.width * 0.7
      );
      overlayGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      overlayGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = overlayGradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      timeRef.current += 1;
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

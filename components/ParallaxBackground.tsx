
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';

interface ParallaxBackgroundProps {
  cameraX: number;
}

interface ParallaxLayerElement {
  id: string;
  type: 'nebula' | 'planet' | 'mountains' | 'debris';
  initialX: number;
  y: number;
  size?: number;
  color?: string; // Base color for planets
  atmosphereColor?: string; // Color for planet atmosphere glow
  opacity?: number;
  pathData?: string;
  blur?: number;
  width?: number;
  height?: number;
}

interface ParallaxLayerDef {
  id: string;
  speed: number; // Speed relative to camera movement
  driftFactor: number; // Factor for autonomous horizontal drift
  elements: ParallaxLayerElement[];
  zIndex: number;
}

const layers: ParallaxLayerDef[] = [
  {
    id: 'layer1-nebulas',
    speed: 0.005, 
    driftFactor: 0.02, 
    zIndex: 1,
    elements: [
      { id: 'neb1', type: 'nebula', initialX: GAME_WIDTH * 0.2, y: GAME_HEIGHT * 0.3, size: GAME_WIDTH * 0.8, color: 'rgba(60, 40, 90, 0.3)', blur: 30, width: GAME_WIDTH * 1.5, height: GAME_HEIGHT * 0.6 },
      { id: 'neb2', type: 'nebula', initialX: GAME_WIDTH * 0.8, y: GAME_HEIGHT * 0.6, size: GAME_WIDTH * 0.7, color: 'rgba(40, 40, 70, 0.25)', blur: 40, width: GAME_WIDTH * 1.2, height: GAME_HEIGHT * 0.5 },
      { id: 'neb3', type: 'nebula', initialX: GAME_WIDTH * 1.5, y: GAME_HEIGHT * 0.4, size: GAME_WIDTH * 0.9, color: 'rgba(50, 30, 80, 0.2)', blur: 35, width: GAME_WIDTH * 1.6, height: GAME_HEIGHT * 0.7 },
    ],
  },
  {
    id: 'layer2-distant-planets',
    speed: 0.01, 
    driftFactor: 0.03, 
    zIndex: 2,
    elements: [
      { id: 'planet1', type: 'planet', initialX: GAME_WIDTH * 0.7, y: GAME_HEIGHT * 0.25, size: 120, color: '#5a4a70', atmosphereColor: '#a78bfa', opacity: 0.6 },
      { id: 'planet2', type: 'planet', initialX: GAME_WIDTH * 0.1, y: GAME_HEIGHT * 0.45, size: 80, color: '#78352a', atmosphereColor: '#fca5a5', opacity: 0.55 },
      { id: 'planet3', type: 'planet', initialX: GAME_WIDTH * 1.3, y: GAME_HEIGHT * 0.35, size: 150, color: '#3c5a6d', atmosphereColor: '#67e8f9', opacity: 0.58 },
    ],
  },
];

// Helper to darken/lighten a hex color
const shadeColor = (color: string, percent: number): string => {
    let R = parseInt(color.substring(1,3),16);
    let G = parseInt(color.substring(3,5),16);
    let B = parseInt(color.substring(5,7),16);

    R = parseInt((R * (100 + percent) / 100).toString());
    G = parseInt((G * (100 + percent) / 100).toString());
    B = parseInt((B * (100 + percent) / 100).toString());

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    R = Math.max(0, R);
    G = Math.max(0, G);
    B = Math.max(0, B);

    const RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    const GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    const BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
}

const getPlanetStyle = (el: ParallaxLayerElement): React.CSSProperties => {
  const baseColor = el.color || '#555';
  // Use a slightly lighter/more vibrant version of baseColor for atmosphere if atmosphereColor isn't specified
  const atmosBase = el.atmosphereColor || shadeColor(baseColor, 15); 
  const size = el.size || 100;

  // Simulating texture and depth with multiple radial gradients
  // Highlights made more subtle (lower alpha)
  const backgroundStyle = `
    radial-gradient(circle at 20% 25%, rgba(255,255,255,0.06) 0%, transparent ${size * 0.15}px),
    radial-gradient(circle at 25% 20%, rgba(255,255,255,0.04) 0%, transparent ${size * 0.1}px),
    radial-gradient(ellipse at 70% 75%, ${baseColor} 0%, ${shadeColor(baseColor, -30)} 100%)
  `;
  
  // Atmosphere in box-shadow made more diffuse (larger blur, larger spread) and more transparent (lower alpha hex like '66' and '33')
  return {
    width: size,
    height: size,
    background: backgroundStyle,
    borderRadius: '50%',
    boxShadow: `
      inset ${size * 0.08}px ${size * 0.08}px ${size * 0.15}px rgba(0,0,0,0.15), 
      inset -${size * 0.03}px -${size * 0.03}px ${size * 0.1}px rgba(255,255,255,0.03),
      0 0 ${size * 0.25}px ${size * 0.08}px ${atmosBase}77,
      0 0 ${size * 0.5}px ${size * 0.15}px ${atmosBase}44
    `,
    opacity: el.opacity || 0.7, // Default element opacity if not specified in layer definition
  };
};


const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({ cameraX }) => {
  const [driftOffset, setDriftOffset] = useState(0);

  useEffect(() => {
    let lastTime = performance.now();
    let animationFrameId: number;
    const updateDrift = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; 
      const baseDriftSpeed = 0.8; // Reduced global drift further
      setDriftOffset(prev => prev + deltaTime * baseDriftSpeed);
      lastTime = currentTime;
      animationFrameId = requestAnimationFrame(updateDrift);
    };
    animationFrameId = requestAnimationFrame(updateDrift);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ backgroundColor: 'transparent' }}
    >
      {layers.map(layer => (
        <div
          key={layer.id}
          className="absolute inset-0"
          style={{ zIndex: layer.zIndex }}
        >
          {layer.elements.map(el => {
            const visualWidth = el.width || el.size || 0;
            const loopWidth = GAME_WIDTH + visualWidth;
            
            const currentBaseX = el.initialX - cameraX * layer.speed - driftOffset * layer.driftFactor;
            
            let xPosCenter = (currentBaseX % loopWidth + loopWidth) % loopWidth;

            if (xPosCenter + visualWidth / 2 < 0) {
                xPosCenter += loopWidth;
            } 
            else if (xPosCenter - visualWidth / 2 > GAME_WIDTH) {
                xPosCenter -= loopWidth;
            }
            
            let elementStyle: React.CSSProperties = {
              position: 'absolute',
              left: xPosCenter,
              top: el.y,
              transform: 'translate(-50%, -50%)', 
            };

            if (el.type === 'nebula') {
              elementStyle = {
                ...elementStyle,
                width: el.width || el.size,
                height: el.height || el.size,
                backgroundColor: el.color,
                borderRadius: '50%', 
                filter: `blur(${el.blur || 20}px) opacity(${el.opacity || 0.7})`,
              };
            } else if (el.type === 'planet') {
              elementStyle = {
                ...elementStyle,
                ...getPlanetStyle(el), 
              };
            }
            
            return (
              <div
                key={el.id}
                style={elementStyle}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default ParallaxBackground;

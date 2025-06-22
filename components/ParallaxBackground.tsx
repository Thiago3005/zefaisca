
import React from 'react';
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
  color?: string;
  opacity?: number;
  pathData?: string; 
  blur?: number; 
  width?: number; 
  height?: number; 
}

interface ParallaxLayerDef {
  id: string;
  speed: number; 
  elements: ParallaxLayerElement[];
  zIndex: number;
}

const layers: ParallaxLayerDef[] = [
  {
    id: 'layer1-nebulas',
    speed: 0.05,
    zIndex: 1, // Alterado de -3 para 1
    elements: [
      { id: 'neb1', type: 'nebula', initialX: GAME_WIDTH * 0.2, y: GAME_HEIGHT * 0.3, size: GAME_WIDTH * 0.8, color: 'rgba(50, 30, 80, 0.35)', blur: 30, width: GAME_WIDTH * 1.5, height: GAME_HEIGHT * 0.6 }, // Slightly brighter nebula
      { id: 'neb2', type: 'nebula', initialX: GAME_WIDTH * 0.8, y: GAME_HEIGHT * 0.6, size: GAME_WIDTH * 0.7, color: 'rgba(30, 30, 60, 0.3)', blur: 40, width: GAME_WIDTH * 1.2, height: GAME_HEIGHT * 0.5 },
      { id: 'neb3', type: 'nebula', initialX: GAME_WIDTH * 1.5, y: GAME_HEIGHT * 0.4, size: GAME_WIDTH * 0.9, color: 'rgba(40, 20, 70, 0.25)', blur: 35, width: GAME_WIDTH * 1.6, height: GAME_HEIGHT * 0.7 },
    ],
  },
  {
    id: 'layer2-distant-planets',
    speed: 0.15,
    zIndex: 2, // Alterado de -2 para 2
    elements: [
      { id: 'planet1', type: 'planet', initialX: GAME_WIDTH * 0.7, y: GAME_HEIGHT * 0.25, size: 120, color: '#3f3552', opacity: 0.9 }, 
      { id: 'planet2', type: 'planet', initialX: GAME_WIDTH * 0.1, y: GAME_HEIGHT * 0.4, size: 80, color: '#4a2a38', opacity: 0.8 },  
      { id: 'planet3', type: 'planet', initialX: GAME_WIDTH * 1.3, y: GAME_HEIGHT * 0.3, size: 150, color: '#283040', opacity: 0.85 }, 
    ],
  },
];


const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({ cameraX }) => {
  return (
    <div 
        className="absolute inset-0 overflow-hidden pointer-events-none" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }} // Debug: temp background for the whole parallax container, set to transparent for final
    >
      {layers.map(layer => (
        <div
          key={layer.id}
          className="absolute inset-0"
          style={{ zIndex: layer.zIndex }}
        >
          {layer.elements.map(el => {
            const visualWidth = el.width || el.size || 0; // The width of the visual element itself
            const visualHeight = el.height || el.size || 0; // The height for y-centering if needed

            // The loopWidth determines the range over which the element's position will cycle.
            // Using GAME_WIDTH + visualWidth ensures the element fully leaves one side before reappearing on the other.
            const loopWidth = GAME_WIDTH + visualWidth;
            
            const currentBaseX = el.initialX - cameraX * layer.speed;
            
            // Calculate the intended center position of the element within the loop.
            let xPosCenter = (currentBaseX % loopWidth + loopWidth) % loopWidth;
             // If initialX was meant to be the left edge, adjust xPosCenter to be the center
            if(el.type !== 'nebula' && el.type !== 'planet') { // Assuming initialX for mountains etc. might be left edge based
                 // No, stick to initialX being the reference point for the center calculation strategy
            }


            let transform = '';
            if (el.type === 'nebula' || el.type === 'planet') {
              transform = `translate(-50%, -50%)`; // Nebulas and planets are centered around their (xPosCenter, el.y)
            } else if (el.type === 'mountains') {
              transform = `translateX(-50%)`; // Mountains are centered horizontally, el.y is their top
            }
            
            // For elements that are not full-width patterns and should repeat by moving off one side and onto the other
            if (visualWidth < GAME_WIDTH * 0.8) { // Heuristic: smaller elements clearly repeat
                 // If xPosCenter (calculated center) + visualWidth/2 < 0, it means it's fully off-screen left. Add loopWidth.
                 if(xPosCenter + visualWidth / 2 < 0) xPosCenter += loopWidth;
                 // If xPosCenter (calculated center) - visualWidth/2 > GAME_WIDTH, fully off-screen right. Subtract loopWidth.
                 else if(xPosCenter - visualWidth / 2 > GAME_WIDTH) xPosCenter -= loopWidth;
            }


            if (el.type === 'nebula') {
              return (
                <div
                  key={el.id}
                  className="absolute" // Removed rounded-full to use width/height for shape
                  style={{
                    left: xPosCenter,
                    top: el.y,
                    width: el.width || el.size,
                    height: el.height || el.size,
                    backgroundColor: el.color,
                    borderRadius: (el.width || el.size || 0) / 2, // Elliptical nebulas via border-radius
                    filter: `blur(${el.blur || 20}px)`,
                    opacity: el.opacity || 1,
                    transform: transform,
                  }}
                />
              );
            } else if (el.type === 'planet') {
              return (
                <div
                  key={el.id}
                  className="absolute rounded-full"
                  style={{
                    left: xPosCenter,
                    top: el.y,
                    width: el.size,
                    height: el.size,
                    backgroundColor: el.color,
                    opacity: el.opacity || 1,
                    boxShadow: `inset ${el.size!*0.1}px ${el.size!*0.1}px ${el.size!*0.3}px rgba(0,0,0,0.3), inset -${el.size!*0.05}px -${el.size!*0.05}px ${el.size!*0.2}px rgba(255,255,255,0.05)`,
                    transform: transform,
                  }}
                />
              );
            } else if (el.type === 'mountains') {
                 return (
                    <div
                        key={el.id}
                        className="absolute"
                        style={{
                            left: xPosCenter,
                            top: el.y,
                            width: visualWidth,
                            height: visualHeight,
                            backgroundColor: el.color,
                            opacity: el.opacity,
                            transform: transform,
                            // Removed clipPath for debugging
                        }}
                    />
                 );
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
};

export default ParallaxBackground;

import React, { useState } from 'react';
import { UPGRADES, STAVES, ACCESSORIES } from '../constants';
import { Upgrade, Staff, Accessory, Rarity } from '../types';
import Button from './Button';
import audioManager from '../services/audioManager';

interface EncyclopediaViewProps {
  onClose: () => void;
}

type EncyclopediaTab = 'upgrades' | 'staves' | 'accessories';

const EncyclopediaView: React.FC<EncyclopediaViewProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<EncyclopediaTab>('upgrades');

  const renderRarityBadge = (rarity: Rarity, color: string) => {
    const isCelestial = rarity === Rarity.Celestial;
    return (
      <span 
        className="text-xs px-2 py-0.5 rounded-full" 
        style={{ backgroundColor: color, color: isCelestial ? '#000' : '#FFF' }}
      >
        {rarity.toUpperCase()}
      </span>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'upgrades':
        return UPGRADES.map((upgrade: Upgrade) => (
          <div key={upgrade.id} className="p-3 bg-slate-800 rounded-lg shadow-md border border-slate-700">
            <div className="flex justify-between items-center mb-1">
              <h3 className={`text-lg font-bold text-[${upgrade.color}]`}>
                {upgrade.icon} {upgrade.name}
              </h3>
              {renderRarityBadge(upgrade.rarity, upgrade.color)}
            </div>
            <p className="text-sm text-slate-300 mb-1">{upgrade.desc}</p>
            {upgrade.maxLevel && <p className="text-xs text-yellow-400">Nível Máx: {upgrade.maxLevel}</p>}
          </div>
        ));
      case 'staves':
        return STAVES.map((staff: Staff) => (
          <div key={staff.id} className="p-3 bg-slate-800 rounded-lg shadow-md border border-slate-700">
            <h3 className="text-lg font-bold text-purple-400 mb-1">{staff.emoji} {staff.name}</h3>
            <p className="text-sm text-slate-300 mb-2">{staff.description}</p>
            <div className="text-xs text-slate-400 space-y-0.5">
              {staff.damageModifier && <p>Mod. Dano: <span className="text-sky-300">{staff.damageModifier}x</span></p>}
              {staff.fireRateModifier && <p>Mod. Cadência: <span className="text-sky-300">{staff.fireRateModifier}x</span></p>}
              {staff.projectileSpeedModifier && <p>Mod. Vel. Projétil: <span className="text-sky-300">{staff.projectileSpeedModifier}x</span></p>}
              <p>Visual: <span className="text-sky-300">{staff.projectileVisual}</span></p>
              {staff.shotgunPellets && <p>Fragmentos: <span className="text-sky-300">{staff.shotgunPellets}</span></p>}
              {staff.homing && <p className="text-green-400">Teleguiado</p>}
              {staff.explodesOnImpact && <p className="text-orange-400">Explode ao Impactar (Raio: {staff.explosionRadius})</p>}
              {staff.bounces && <p>Quica: <span className="text-sky-300">{staff.bounces} vezes</span></p>}
              {staff.stunChance && <p className="text-yellow-400">Chance de Atordoar: {staff.stunChance * 100}% ({staff.stunDuration}ms)</p>}
              {staff.silenceChance && <p className="text-gray-400">Chance de Silenciar: {staff.silenceChance * 100}% ({staff.silenceDuration}ms)</p>}
              {staff.curseChance && <p className="text-red-400">Chance de Amaldiçoar</p>}
            </div>
          </div>
        ));
      case 'accessories':
        return ACCESSORIES.map((accessory: Accessory) => (
          <div key={accessory.id} className="p-3 bg-slate-800 rounded-lg shadow-md border border-slate-700">
            <h3 className="text-lg font-bold text-teal-400 mb-1">{accessory.emoji} {accessory.name}</h3>
            <p className="text-sm text-slate-300">{accessory.description}</p>
            {/* Could add a more detailed effect summary here if needed */}
          </div>
        ));
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tabId: EncyclopediaTab; label: string }> = ({ tabId, label }) => (
    <Button
      onClick={() => {
        setActiveTab(tabId);
        audioManager.playSound('ui_button_click', { volume: 0.6 });
      }}
      variant={activeTab === tabId ? 'primary' : 'secondary'}
      className={`py-2 px-4 text-sm ${activeTab !== tabId ? 'opacity-70 hover:opacity-100' : ''}`}
    >
      {label}
    </Button>
  );

  return (
    <div className="relative z-10 bg-slate-900 bg-opacity-80 p-6 md:p-8 rounded-xl shadow-xl w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-400">Enciclopédia Cósmica</h2>
        <Button onClick={onClose} variant="danger" className="py-2 px-4 text-sm">
          Voltar
        </Button>
      </div>

      <div className="flex space-x-2 mb-4 border-b-2 border-slate-700 pb-2">
        <TabButton tabId="upgrades" label="Melhorias ✨" />
        <TabButton tabId="staves" label="Cajados 🪄" />
        <TabButton tabId="accessories" label="Acessórios 🎒" />
      </div>

      <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar-encyclopedia">
        {renderContent()}
      </div>
      <style>{`
        .custom-scrollbar-encyclopedia::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar-encyclopedia::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.9); /* slate-800 with more opacity */
          border-radius: 10px;
        }
        .custom-scrollbar-encyclopedia::-webkit-scrollbar-thumb {
          background: #a78bfaAA; /* purple-400 with alpha */
          border-radius: 10px;
          border: 2px solid rgba(30, 41, 59, 0.9);
        }
        .custom-scrollbar-encyclopedia::-webkit-scrollbar-thumb:hover {
          background: #c4b5fd; /* purple-300 */
        }
      `}</style>
    </div>
  );
};

export default EncyclopediaView;


import React from 'react';
import { Card, CardRarity } from '../types';
import { soundManager } from '../soundManager';

interface CardChoiceScreenProps {
  cards: Card[];
  onCardSelect: (card: Card) => void;
  canReroll: boolean;
  onRerollCards: () => void;
}

const CardChoiceScreen: React.FC<CardChoiceScreenProps> = ({ cards, onCardSelect, canReroll, onRerollCards }) => {
  
  const getRarityStyle = (rarity: CardRarity) => {
    switch (rarity) {
      case CardRarity.COMMON: 
        return 'border-slate-600 hover:border-slate-500 bg-slate-800 text-white';
      case CardRarity.UNCOMMON: 
        return 'border-green-600 hover:border-green-500 bg-green-700 text-white';
      case CardRarity.EPIC: 
        return 'border-purple-600 hover:border-purple-500 bg-purple-800 text-white';
      default: 
        return 'border-gray-500 hover:border-gray-400 bg-gray-700 text-white';
    }
  };

  const handleCardClick = (card: Card) => {
    soundManager.playUIClick();
    onCardSelect(card);
  };

  const handleRerollClick = () => {
    soundManager.playUIClick();
    onRerollCards();
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50 p-4">
      <div className="bg-slate-900 p-8 rounded-xl shadow-2xl text-white w-full max-w-4xl border-2 border-slate-700">
        <h2 className="text-4xl font-bold mb-8 text-center text-yellow-400">Escolha sua Melhoria!</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`p-6 rounded-lg border-2 ${getRarityStyle(card.rarity)} cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-xl flex flex-col justify-between`}
              onClick={() => handleCardClick(card)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && handleCardClick(card)}
            >
              <div>
                <h3 className="text-2xl font-semibold mb-2 flex items-center">
                  {card.icon && <span className="mr-3 text-3xl">{card.icon}</span>}
                  {card.name}
                </h3>
                <p className="text-sm text-slate-300 mb-3 h-20 overflow-y-auto custom-scrollbar">{card.description}</p>
              </div>
              <p className={`text-xs font-bold uppercase self-end p-1 px-2 rounded ${
                card.rarity === CardRarity.COMMON ? 'bg-slate-500 text-white' :
                card.rarity === CardRarity.UNCOMMON ? 'bg-green-500 text-white' : 
                card.rarity === CardRarity.EPIC ? 'bg-purple-500 text-white' : 
                'bg-gray-600 text-white'
              }`}>{card.rarity}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
            {canReroll && (
                <button
                onClick={handleRerollClick}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-lg shadow-md transition-transform transform hover:scale-105 mb-4"
                >
                Rolar Novamente (Grátis!) 🕵️
                </button>
            )}
            <p className="text-sm text-slate-400">Clique em uma carta para continuar a batalha!</p>
        </div>
      </div>
    </div>
  );
};

export default CardChoiceScreen;

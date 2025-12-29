
import React, { useState } from 'react';
import { Shield, Zap, Heart, Crown, Rocket, Gift, Palette, Sparkles, Coins, Store } from 'lucide-react';
import { ShopItem, UserProfile } from '../types';

interface ShopProps {
  user: UserProfile;
  onBuy: (item: ShopItem) => boolean;
  onActivate?: (item: ShopItem) => void;
}

const Shop: React.FC<ShopProps> = ({ user, onBuy, onActivate }) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const isAdult = user.age >= 18;

  const items: ShopItem[] = [
    // Power Ups
    {
      id: 'shield_1',
      title: "Protector de Racha",
      desc: "Evita perder tu racha si faltas un día.",
      price: 200,
      currency: 'coins',
      icon: <Shield className="text-blue-400" size={32} />,
      category: 'powerup',
      reqAge: 'all'
    },
    {
      id: 'heart_refill',
      title: "Recarga de Vidas",
      desc: "Restaura 20 corazones al instante.",
      price: 350,
      currency: 'coins',
      icon: <Heart className="text-red-500" size={32} />,
      category: 'powerup',
      reqAge: 'all'
    },
    // Cosmetics (Adult)
    {
      id: 'theme_dark_pro',
      title: "Tema: Midnight Pro",
      desc: "Interfaz ultra oscura y elegante.",
      price: 500,
      currency: 'coins',
      icon: <Palette className="text-purple-400" size={32} />,
      category: 'cosmetic',
      reqAge: 'adult'
    },
    {
      id: 'badge_biz',
      title: "Insignia: CEO",
      desc: "Muestra que vas en serio con el inglés de negocios.",
      price: 1000,
      currency: 'coins',
      icon: <Zap className="text-yellow-400" size={32} />,
      category: 'cosmetic',
      reqAge: 'adult'
    },
    // Cosmetics (Kid)
    {
      id: 'mascot_hero',
      title: "Traje: Superhéroe",
      desc: "Viste a tu robot como un héroe.",
      price: 400,
      currency: 'coins',
      icon: <Rocket className="text-red-400" size={32} />,
      category: 'cosmetic',
      reqAge: 'kid'
    },
    {
      id: 'frame_galaxy',
      title: "Marco Galáctico",
      desc: "Un borde brillante para tu avatar.",
      price: 300,
      currency: 'coins',
      icon: <Sparkles className="text-cyan-400" size={32} />,
      category: 'cosmetic',
      reqAge: 'kid'
    }
  ];

  const filteredItems = items.filter(i => i.reqAge === 'all' || (isAdult ? i.reqAge === 'adult' : i.reqAge === 'kid'));

  const handlePurchase = (item: ShopItem) => {
    if (user.inventory.includes(item.id) && item.category === 'cosmetic') {
      setFeedback("¡Ya tienes este artículo!");
      setTimeout(() => setFeedback(null), 2000);
      return;
    }

    const success = onBuy(item);
    if (success) {
      setFeedback(`¡Compraste ${item.title}!`);
      setTimeout(() => setFeedback(null), 3000);
    } else {
      setFeedback("Fondos insuficientes");
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const handleActivate = (item: ShopItem) => {
    if (onActivate) {
      onActivate(item);
      setFeedback(`¡Activaste ${item.title}!`);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  return (
    <div className="animate-fade-in pb-20 relative">
      {feedback && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-space-dark border border-space-primary text-white px-6 py-3 rounded-full shadow-xl animate-bounce flex items-center gap-2">
          {feedback.includes("insuficientes") ? "❌" : "✅"} {feedback}
        </div>
      )}

      {/* Header */}
      <div className={`p-6 mb-8 sticky top-0 z-10 backdrop-blur-md bg-opacity-95 shadow-lg md:rounded-b-3xl border-b border-white/10
          ${isAdult
          ? 'bg-space-card'
          : 'bg-gradient-to-r from-blue-600 to-indigo-700'
        }
      `}>
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-widest flex items-center gap-3 drop-shadow-md">
              {isAdult ? <Store className="text-blue-400" /> : <Rocket className="text-yellow-400 animate-bounce-slow" />}
              {isAdult ? "Tienda Premium" : "Arsenal"}
            </h1>
            <p className={`text-sm font-medium mt-1 ${isAdult ? 'text-space-muted' : 'text-blue-200'}`}>
              {isAdult ? "Adquiere recursos estratégicos." : "¡Equípate para la misión, Cadete!"}
            </p>
          </div>
          <div className="bg-black/40 px-5 py-2.5 rounded-2xl border border-white/10 flex items-center gap-3 shadow-inner backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Coins className="text-yellow-400 drop-shadow-md" size={24} />
              <span className="font-black text-2xl text-white">{user.coins}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-8">

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.map(item => {
            const owned = user.inventory.includes(item.id) && item.category === 'cosmetic';
            // Determine if a cosmetic item is currently active/equipped
            let isEquipped = false;
            if (item.id === 'theme_dark_pro' && user.theme === 'midnight') {
              isEquipped = true;
            } else if (item.category === 'cosmetic' && (item.id.startsWith('badge_') || item.id === 'mascot_hero' || item.id === 'frame_galaxy') && user.activeBadge === item.id) {
              isEquipped = true;
            }
            // Add more equipped checks for other cosmetic types if needed

            return (
              <div
                key={item.id}
                className={`relative group rounded-3xl p-[2px] transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl
                    ${isAdult
                    ? 'bg-gradient-to-b from-gray-700 to-gray-900'
                    : (owned ? 'bg-gray-300' : 'bg-gradient-to-b from-blue-400 to-purple-500 hover:from-yellow-400 hover:to-orange-500')
                  }
                `}
              >
                <div className={`h-full rounded-[22px] p-5 flex flex-col justify-between relative overflow-hidden
                    ${isAdult ? 'bg-space-card' : 'bg-white'}
                `}>
                  {/* Shine Effect */}
                  {!isAdult && !owned && <div className="absolute top-0 -inset-full h-full w-1/2 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />}

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110
                                ${isAdult
                          ? 'bg-space-dark border border-space-light'
                          : 'bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-white'
                        }
                            `}>
                        {item.icon}
                      </div>
                      {owned && <span className="text-green-600 font-black text-[10px] uppercase bg-green-100 px-3 py-1 rounded-full border border-green-200">Adquirido</span>}
                    </div>

                    <h3 className={`font-black text-xl mb-2 leading-tight ${isAdult ? 'text-white' : 'text-gray-800'}`}>{item.title}</h3>
                    <p className={`text-sm font-medium leading-snug min-h-[40px] ${isAdult ? 'text-space-muted' : 'text-gray-500'}`}>{item.desc}</p>
                  </div>

                  <div className="mt-4 relative z-10">
                    {owned && item.category === 'cosmetic' ? (
                      <button
                        onClick={() => handleActivate(item)}
                        disabled={isEquipped}
                        className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest transition-all border-b-4 active:border-b-0 active:translate-y-1
                                    ${isEquipped
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default'
                            : (isAdult ? 'bg-space-primary text-space-dark border-blue-600 hover:bg-blue-400' : 'bg-green-500 text-white border-green-700 hover:bg-green-400 shadow-lg shadow-green-500/30')}`}
                      >
                        {isEquipped ? "Equipado" : "Equipar"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePurchase(item)}
                        disabled={owned || (!item.category.includes('powerup') && owned)} // Allow multiple purchase for consumables if desired, but here logic is simplistic
                        className={`w-full py-3 rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border-b-4 active:border-b-0 active:translate-y-1
                                    ${owned && item.category !== 'powerup'
                            ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-default'
                            : user.coins >= item.price
                              ? (isAdult
                                ? 'bg-space-light text-white border-gray-600 hover:bg-space-primary hover:text-black hover:border-blue-600'
                                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-800 hover:brightness-110 shadow-lg shadow-blue-500/30'
                              )
                              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-70'
                          }
                      `}
                      >
                        {owned && item.category !== 'powerup' ? 'Agotado' : (
                          <>
                            {item.price} <Coins size={16} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default Shop;

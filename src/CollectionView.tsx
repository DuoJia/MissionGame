// src/CollectionView.tsx
import React, { useMemo } from "react";
import { Package, Hammer, Heart, Swords } from "lucide-react";
import { Card, View, getRarityColor } from "./types";

interface CollectionViewProps {
  inventory: Card[];
  setView: (view: View) => void;
  setInventory: React.Dispatch<React.SetStateAction<Card[]>>; // 新增這個 prop
}

export default function CollectionView({
  inventory,
  setView,
  setInventory,
}: CollectionViewProps) {
  
  // 🎯 計算可合成的卡片組合
  // 邏輯：同名、同稀有度、同星級的卡片每3張可以合成
  const mergeableGroups = useMemo(() => {
    const groups: Record<string, Card[]> = {};
    
    inventory.forEach(card => {
        // 只有未滿5星的卡片可以合成
        if ((card.starLevel || 1) >= 5) return;

        // 建立群組 Key: Name-Rarity-Star
        const key = `${card.name}-${card.rarity}-${card.starLevel || 1}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(card);
    });

    // 過濾出數量 >= 3 的群組
    return Object.entries(groups).filter(([_, cards]) => cards.length >= 3);
  }, [inventory]);

  // 🎯 執行合成
  const handleMerge = (cardsToMerge: Card[]) => {
      if (cardsToMerge.length < 3) return;
      
      // 取前三張進行消耗
      const usedCards = cardsToMerge.slice(0, 3);
      const usedIds = new Set(usedCards.map(c => c.id));
      const baseCard = usedCards[0]; // 以第一張為基底

      // 計算新數值 (簡單邏輯：升星數值成長 1.2 倍，無條件進位)
      const newHp = Math.ceil((baseCard.hp || 1) * 1.2);
      const newAtk = Math.ceil((baseCard.atk || 1) * 1.2);
      const newStar = (baseCard.starLevel || 1) + 1;

      if(window.confirm(`合成 3 張 [${baseCard.name} ★${baseCard.starLevel}] ?\n將獲得 ★${newStar} (HP:${newHp} / ATK:${newAtk})`)) {
          
          setInventory(prev => {
             // 移除使用掉的卡片
             const remaining = prev.filter(c => !usedIds.has(c.id));
             
             // 加入新卡片
             const newCard: Card = {
                 ...baseCard,
                 id: "m-" + Date.now(), // 新 ID
                 hp: newHp,
                 atk: newAtk,
                 starLevel: newStar,
                 seed: baseCard.seed // 保持原本的外觀
             };
             
             return [newCard, ...remaining];
          });
      }
  };

  return (
    <div className="p-4 pb-20">
      <div className="flex justify-between items-center mb-4 border-b-4 border-black pb-2">
         <h2 className="text-xl font-bold">
            CARDS ({inventory.length})
         </h2>
         {/* 顯示合成提示 */}
         {mergeableGroups.length > 0 && (
             <div className="text-xs font-bold text-pink-600 animate-pulse">
                 ✨ {mergeableGroups.length} 可合成
             </div>
         )}
      </div>
      
      {/* 🎯 合成區塊：如果有可合成的卡片，顯示在這裡 */}
      {mergeableGroups.length > 0 && (
          <div className="mb-6 p-3 bg-yellow-100 border-4 border-yellow-400 rounded">
              <h3 className="font-bold text-sm mb-2 flex items-center gap-2 text-yellow-800">
                  <Hammer size={16} /> 合成工作台 (Synthesis)
              </h3>
              <div className="space-y-2">
                  {mergeableGroups.map(([key, cards]) => {
                      const base = cards[0];
                      const canMergeCount = Math.floor(cards.length / 3);
                      return (
                          <div key={key} className="flex items-center justify-between bg-white border-2 border-yellow-500 p-2 shadow-sm">
                              <div className="flex items-center gap-2">
                                  <img 
                                    src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${base.seed}`} 
                                    className="w-8 h-8 border border-gray-300 bg-gray-100" 
                                    alt="icon"
                                  />
                                  <div className="text-xs">
                                      <div className="font-bold">{base.name}</div>
                                      <div className="text-gray-500">★{base.starLevel || 1} x {cards.length}張</div>
                                  </div>
                              </div>
                              <button 
                                onClick={() => handleMerge(cards)}
                                className="px-3 py-1 bg-blue-500 text-white text-xs font-bold border-b-4 border-blue-700 active:border-0 active:translate-y-1"
                              >
                                  合成 ({canMergeCount})
                              </button>
                          </div>
                      )
                  })}
              </div>
          </div>
      )}

      {inventory.length === 0 ? (
        <div className="text-center py-10 text-gray-400 border-4 border-dashed border-gray-300">
          <Package size={48} className="mx-auto mb-2 opacity-50" />
          <p>No cards yet.</p>
          <button
            onClick={() => setView("gacha")}
            className="text-pink-500 underline mt-2"
          >
            Go draw cards!
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {inventory.map((card, idx) => (
            <div
              key={card.id}
              className={`relative bg-white border-4 p-2 flex flex-col items-center transition-transform hover:-translate-y-1 ${getRarityColor(
                card.rarity
              )}`}
            >
              {/* 星級顯示 */}
              <div className="absolute top-1 left-1 text-[10px] text-yellow-500 font-bold drop-shadow-sm bg-black/10 px-1 rounded">
                {"★".repeat(card.starLevel || 1)}
              </div>
              
              <img
                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${card.seed}`}
                alt={card.name}
                className="w-16 h-16 image-render-pixel mb-2 mt-2"
              />
              
              <div className="text-xs font-bold uppercase truncate w-full text-center">
                {card.name}
              </div>
              <div className="text-[8px] opacity-70 uppercase mb-1">
                {card.rarity}
              </div>

              {/* 🎯 數值顯示 */}
              <div className="flex gap-2 w-full justify-center mt-1 pt-1 border-t border-black/10">
                  <div className="flex items-center gap-1 text-[9px] font-bold text-red-600" title="HP">
                      <Heart size={10} fill="currentColor" /> {card.hp || "?"}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] font-bold text-blue-600" title="ATK">
                      <Swords size={10} fill="currentColor" /> {card.atk || "?"}
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
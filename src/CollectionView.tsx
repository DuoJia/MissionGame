// src/CollectionView.tsx
//蒐集卡片功能
import React from "react";
import { Package } from "lucide-react";
import { Card, View, getRarityColor } from "./types";

interface CollectionViewProps {
  inventory: Card[];
  setView: (view: View) => void;
}

export default function CollectionView({
  inventory,
  setView,
}: CollectionViewProps) {
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 border-b-4 border-black inline-block">
        MY CARDS ({inventory.length})
      </h2>

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
        <div className="grid grid-cols-3 gap-3">
          {inventory.map((card, idx) => (
            <div
              key={idx}
              className={`relative bg-white border-2 p-2 flex flex-col items-center ${getRarityColor(
                card.rarity
              )}`}
            >
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-current opacity-50"></div>
              <img
                src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${card.seed}`}
                alt={card.name}
                className="w-16 h-16 image-render-pixel mb-2"
              />
              <div className="text-[10px] font-bold uppercase truncate w-full text-center">
                {card.name}
              </div>
              <div className="text-[8px] opacity-70 uppercase">
                {card.rarity}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

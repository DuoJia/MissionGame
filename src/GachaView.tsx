// src/GachaView.tsx
//抽卡功能
import React from "react";
import { Package } from "lucide-react";
import { User, Card } from "./types"; // 引入型別

interface GachaViewProps {
  user: User;
  gachaAnimating: boolean;
  lastDraw: Card | null;
  drawCard: () => void;
}

export default function GachaView({
  user,
  gachaAnimating,
  lastDraw,
  drawCard,
}: GachaViewProps) {
  const COST = 100;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold mb-4 border-b-4 border-black inline-block">
        MYSTERY BOX
      </h2>

      {/* 積分累積顯示 */}
      <div className="text-center text-sm font-bold p-3 border-4 border-gray-300 bg-white">
        目前累積點數: <span className="text-pink-500">{user.total_points}</span>{" "}
        PT / {COST} PT
      </div>

      {/* Gacha Box */}
      <div className="bg-indigo-900 text-white border-4 border-black p-4 relative overflow-hidden">
        <div className="relative z-10 text-center">
          <h2 className="text-xl font-bold mb-2 text-yellow-400 drop-shadow-md">
            Gacha Machine
          </h2>
          <p className="text-xs text-indigo-200 mb-4">COST: {COST} PT</p>
          <button
            onClick={drawCard}
            disabled={gachaAnimating || user.total_points < COST} // 不足 100 點禁用
            className="w-full py-3 bg-pink-500 border-b-4 border-r-4 border-pink-700 active:border-0 active:translate-y-1 text-white font-bold pixel-btn hover:bg-pink-400 disabled:bg-gray-500 disabled:border-gray-700 disabled:shadow-none"
          >
            {gachaAnimating ? "OPENING..." : `DRAW CARD`}
          </button>
        </div>

        {/* Last Draw Result Overlay */}
        {lastDraw && !gachaAnimating && (
          <div className="mt-4 bg-black/50 p-2 rounded border border-white/20 flex items-center gap-3 animate-bounce-in">
            <img
              src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${lastDraw.seed}`}
              alt="result"
              className="w-12 h-12 bg-white rounded border-2 border-white"
            />
            <div className="text-left">
              <div className="text-yellow-400 text-sm font-bold">
                YOU GOT IT!
              </div>
              <div className="text-white text-xs">
                {lastDraw.name} ({lastDraw.rarity})
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

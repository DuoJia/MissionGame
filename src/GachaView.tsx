// src/GachaView.tsx
import React from "react";
import { User, Card } from "./types";

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

      <div className="text-center text-sm font-bold p-3 border-4 border-gray-300 bg-white">
        目前累積點數: <span className="text-pink-500">{user.total_points}</span>{" "}
        PT / {COST} PT
      </div>

      <div className="bg-indigo-900 text-white border-4 border-black p-4 relative overflow-hidden min-h-[300px] flex flex-col justify-center">
        <div className="relative z-10 text-center">
          <h2 className="text-xl font-bold mb-2 text-yellow-400 drop-shadow-md">
            Gacha Machine
          </h2>
          <p className="text-xs text-indigo-200 mb-4">COST: {COST} PT</p>

          {/* 按鈕區域，避免被結果遮擋 */}
          {!lastDraw || gachaAnimating ? (
            <button
              onClick={drawCard}
              disabled={gachaAnimating || user.total_points < COST}
              className="w-full py-3 bg-pink-500 border-b-4 border-r-4 border-pink-700 active:border-0 active:translate-y-1 text-white font-bold pixel-btn hover:bg-pink-400 disabled:bg-gray-500 disabled:border-gray-700 disabled:shadow-none"
            >
              {gachaAnimating ? "OPENING..." : `DRAW CARD`}
            </button>
          ) : null}
        </div>

        {/* 🎯 修改：抽卡結果顯示詳細數值 */}
        {lastDraw && !gachaAnimating && (
          <div className="mt-4 bg-black/60 p-4 rounded border-2 border-white/50 animate-bounce-in flex flex-col items-center gap-3">
            <div className="text-yellow-400 text-lg font-bold animate-pulse">
              YOU GOT IT!
            </div>
            <img
              src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${lastDraw.seed}`}
              alt="result"
              className="w-24 h-24 bg-white rounded-lg border-4 border-white shadow-lg image-render-pixel"
            />
            <div className="text-center">
              <div className="text-white font-bold text-lg">
                {lastDraw.name}
              </div>
              <div className="text-gray-300 text-xs uppercase mb-2">
                {lastDraw.rarity}
              </div>

              {/* 數值顯示 */}
              <div className="flex gap-2 justify-center text-xs font-bold">
                <span className="bg-red-500 text-white px-2 py-1 rounded border border-white">
                  HP {lastDraw.hp}
                </span>
                <span className="bg-blue-500 text-white px-2 py-1 rounded border border-white">
                  ATK {lastDraw.atk}
                </span>
              </div>
              <div className="mt-2 text-yellow-400 text-sm">
                {"★".repeat(lastDraw.starLevel)}
              </div>
            </div>

            <button
              onClick={drawCard}
              disabled={user.total_points < COST}
              className="mt-2 px-4 py-2 bg-green-500 border-b-4 border-green-700 text-white font-bold text-xs pixel-btn active:border-0 active:translate-y-1"
            >
              DRAW AGAIN
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

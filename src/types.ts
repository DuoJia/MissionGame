// src/types.ts
// 定義類別

export type Rarity = "common" | "rare" | "epic" | "legendary";
export type View = "dashboard" | "collection" | "category_manager" | "gacha";

export interface User {
  id: string;
  name: string;
  total_points: number;
  streak: number;
  lastLoginDate: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  categoryId: string;
  title: string;
  difficulty: 1 | 2 | 3;
  points: number;
  completed: boolean;
  period: "daily" | "once";
}

export interface Card {
  id: string;
  name: string;
  rarity: Rarity;
  seed: string;
}

export const INITIAL_CATEGORIES: Category[] = [
  { id: "c1", name: "學習", color: "bg-yellow-500" },
  { id: "c2", name: "工作", color: "bg-blue-500" },
  { id: "c3", name: "家庭", color: "bg-green-500" },
  { id: "c4", name: "遊戲", color: "bg-red-500" },
  { id: "c5", name: "臨時項目", color: "bg-gray-500" },
];

export const CARD_TEMPLATES = [
  { name: "Slime", rarity: "common" },
  { name: "Rat", rarity: "common" },
  { name: "Bat", rarity: "common" },
  { name: "Knight", rarity: "rare" },
  { name: "Elf", rarity: "rare" },
  { name: "Wizard", rarity: "epic" },
  { name: "Dragon", rarity: "legendary" },
];

export const COLOR_OPTIONS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
];

export const getRarityColor = (r: string) => {
  switch (r) {
    case "common":
      return "border-gray-400 text-gray-600 bg-gray-100";
    case "rare":
      return "border-blue-500 text-blue-600 bg-blue-50";
    case "epic":
      return "border-purple-500 text-purple-600 bg-purple-50";
    case "legendary":
      return "border-yellow-500 text-yellow-600 bg-yellow-50";
    default:
      return "border-gray-400";
  }
};

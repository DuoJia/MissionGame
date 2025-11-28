import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Package,
  Plus,
  Trash2,
  X,
  Grid,
  List,
} from "lucide-react";

// --- 1. Type Definitions ---

type Rarity = "common" | "rare" | "epic" | "legendary";

interface User {
  id: string;
  name: string;
  total_points: number;
  streak: number;
  lastLoginDate: string; // 用於判斷每日重置
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  categoryId: string;
  title: string;
  difficulty: 1 | 2 | 3;
  points: number;
  completed: boolean;
  period: "daily" | "once"; // 區分每日任務或一次性任務
}

interface Card {
  id: string;
  name: string;
  rarity: Rarity;
  seed: string; // 用於產生固定的像素圖
}

// --- 2. Initial Data & Config ---

const INITIAL_CATEGORIES: Category[] = [
  { id: "c1", name: "工作", color: "bg-blue-500" },
  { id: "c2", name: "健康", color: "bg-green-500" },
  { id: "c3", name: "學習", color: "bg-yellow-500" },
  { id: "c4", name: "家事", color: "bg-orange-500" },
];

const CARD_TEMPLATES = [
  { name: "Slime", rarity: "common" },
  { name: "Rat", rarity: "common" },
  { name: "Bat", rarity: "common" },
  { name: "Knight", rarity: "rare" },
  { name: "Elf", rarity: "rare" },
  { name: "Wizard", rarity: "epic" },
  { name: "Dragon", rarity: "legendary" },
];

// --- 3. Main Component ---

export default function App() {
  // --- State Management with LocalStorage Initialization ---

  // 讀取 User
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem("pixel_user");
    return saved
      ? JSON.parse(saved)
      : {
          id: "u1",
          name: "Pixel Hero",
          total_points: 0,
          streak: 0,
          lastLoginDate: new Date().toDateString(),
        };
  });

  // 讀取 Tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("pixel_tasks");
    return saved ? JSON.parse(saved) : [];
  });

  // 讀取 Inventory
  const [inventory, setInventory] = useState<Card[]>(() => {
    const saved = localStorage.getItem("pixel_inventory");
    return saved ? JSON.parse(saved) : [];
  });

  // UI State
  const [view, setView] = useState<"dashboard" | "collection">("dashboard");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    categoryId: "c1",
    difficulty: 1,
  });
  const [gachaAnimating, setGachaAnimating] = useState(false);
  const [lastDraw, setLastDraw] = useState<Card | null>(null);

  // --- Effects: Persistence & Daily Reset ---

  // 1. 保存資料到 LocalStorage
  useEffect(() => {
    localStorage.setItem("pixel_user", JSON.stringify(user));
    localStorage.setItem("pixel_tasks", JSON.stringify(tasks));
    localStorage.setItem("pixel_inventory", JSON.stringify(inventory));
  }, [user, tasks, inventory]);

  // 2. 每日重置檢查 (Daily Reset)
  useEffect(() => {
    const today = new Date().toDateString();
    if (user.lastLoginDate !== today) {
      // 是新的一天！
      const resetTasks = tasks.map((t) => {
        if (t.period === "daily") {
          return { ...t, completed: false }; // 重置每日任務
        }
        return t;
      });

      setTasks(resetTasks);
      setUser((prev) => ({ ...prev, lastLoginDate: today }));
      alert("新的一天開始了！每日任務已重置。");
    }
  }, []); // 僅在組件掛載時執行一次

  // --- Actions ---

  const addTask = () => {
    if (!newTask.title.trim()) return;

    const diffPoints = { 1: 10, 2: 20, 3: 30 };
    const task: Task = {
      id: Date.now().toString(),
      categoryId: newTask.categoryId,
      title: newTask.title,
      difficulty: newTask.difficulty as 1 | 2 | 3,
      points: diffPoints[newTask.difficulty as 1 | 2 | 3],
      completed: false,
      period: "daily", // 預設都是每日任務
    };

    setTasks([...tasks, task]);
    setIsModalOpen(false);
    setNewTask({ title: "", categoryId: "c1", difficulty: 1 });
  };

  const deleteTask = (id: string) => {
    if (window.confirm("確定要刪除這個任務嗎？")) {
      setTasks(tasks.filter((t) => t.id !== id));
    }
  };

  const toggleTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (!task.completed) {
      // 完成任務
      setUser((prev) => ({
        ...prev,
        total_points: prev.total_points + task.points,
        streak: prev.streak + 1, // 簡單邏輯：每次完成都加 streak (可優化)
      }));
    } else {
      // 取消完成 (扣分)
      setUser((prev) => ({
        ...prev,
        total_points: Math.max(0, prev.total_points - task.points),
      }));
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const drawCard = () => {
    const COST = 200;
    if (user.total_points < COST) {
      alert("積分不足 (需要 200 PT)");
      return;
    }

    setUser((prev) => ({ ...prev, total_points: prev.total_points - COST }));
    setGachaAnimating(true);

    setTimeout(() => {
      const rand = Math.random();
      let rarity = "common";
      if (rand > 0.95) rarity = "legendary";
      else if (rand > 0.85) rarity = "epic";
      else if (rand > 0.65) rarity = "rare";

      const pool =
        CARD_TEMPLATES.filter((c) => c.rarity === rarity) || CARD_TEMPLATES;
      const template = pool[Math.floor(Math.random() * pool.length)];

      const newCard: Card = {
        id: Date.now().toString(),
        name: template.name,
        rarity: rarity as Rarity,
        seed: Math.random().toString(), // 隨機種子讓圖案不同
      };

      setInventory((prev) => [newCard, ...prev]);
      setLastDraw(newCard);
      setGachaAnimating(false);
    }, 1500);
  };

  // --- Helpers ---
  const getRarityColor = (r: string) => {
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

  // --- Render ---

  return (
    <div className="min-h-screen pb-20 md:pb-8 max-w-lg mx-auto bg-gray-50 border-x-4 border-gray-300 min-h-screen shadow-2xl">
      {/* Header */}
      <div className="bg-gray-800 text-white p-4 sticky top-0 z-10 border-b-4 border-black">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-sm text-gray-400">PLAYER</h1>
            <div className="text-xl font-bold">{user.name}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-yellow-400">CREDITS</div>
            <div className="text-xl font-bold">{user.total_points} PT</div>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="mt-2 w-full h-2 bg-gray-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 transition-all duration-500"
            style={{
              width: `${Math.min(((user.total_points % 1000) / 10) * 1, 100)}%`,
            }}
          />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b-4 border-black bg-white">
        <button
          onClick={() => setView("dashboard")}
          className={`flex-1 py-3 font-bold flex items-center justify-center gap-2 ${
            view === "dashboard"
              ? "bg-blue-100 text-blue-800"
              : "text-gray-400 hover:bg-gray-100"
          }`}
        >
          <List size={18} /> TASKS
        </button>
        <button
          onClick={() => setView("collection")}
          className={`flex-1 py-3 font-bold flex items-center justify-center gap-2 ${
            view === "collection"
              ? "bg-purple-100 text-purple-800"
              : "text-gray-400 hover:bg-gray-100"
          }`}
        >
          <Grid size={18} /> CARDS
        </button>
      </div>

      {/* VIEW: DASHBOARD */}
      {view === "dashboard" && (
        <div className="p-4 space-y-6">
          {/* Add Task Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3 border-4 border-dashed border-gray-400 text-gray-500 font-bold hover:bg-white hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} /> NEW TASK
          </button>

          {/* Task Lists by Category */}
          {INITIAL_CATEGORIES.map((cat) => {
            const catTasks = tasks.filter((t) => t.categoryId === cat.id);
            if (catTasks.length === 0) return null;

            return (
              <div key={cat.id} className="relative">
                <div
                  className={`inline-block px-2 py-1 text-xs text-white font-bold mb-2 ${cat.color} border-2 border-black`}
                >
                  {cat.name}
                </div>
                <div className="space-y-3">
                  {catTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`
                      group relative p-3 bg-white border-4 border-black transition-all
                      ${
                        task.completed
                          ? "opacity-60 bg-gray-100"
                          : "hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
                      }
                    `}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h3
                            className={`font-bold ${
                              task.completed ? "line-through text-gray-500" : ""
                            }`}
                          >
                            {task.title}
                          </h3>
                          <div className="text-[10px] text-gray-500 mt-1">
                            DIFF: {"★".repeat(task.difficulty)} | REWARD:{" "}
                            {task.points}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className={`w-10 h-10 border-2 border-black flex items-center justify-center transition-colors ${
                              task.completed
                                ? "bg-black text-white"
                                : "bg-white hover:bg-green-200"
                            }`}
                          >
                            {task.completed && <CheckSquare size={20} />}
                          </button>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-100 p-1 rounded transition-opacity"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Gacha Box (Always visible on dashboard) */}
          <div className="mt-8 border-t-4 border-black pt-6">
            <div className="bg-indigo-900 text-white border-4 border-black p-4 relative overflow-hidden">
              <div className="relative z-10 text-center">
                <h2 className="text-xl font-bold mb-2 text-yellow-400 drop-shadow-md">
                  MYSTERY BOX
                </h2>
                <p className="text-xs text-indigo-200 mb-4">COST: 200 PT</p>
                <button
                  onClick={drawCard}
                  disabled={gachaAnimating}
                  className="w-full py-3 bg-pink-500 border-b-4 border-r-4 border-pink-700 active:border-0 active:translate-y-1 text-white font-bold pixel-btn hover:bg-pink-400"
                >
                  {gachaAnimating ? "OPENING..." : "DRAW NOW"}
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
        </div>
      )}

      {/* VIEW: COLLECTION */}
      {view === "collection" && (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4 border-b-4 border-black inline-block">
            MY CARDS ({inventory.length})
          </h2>

          {inventory.length === 0 ? (
            <div className="text-center py-10 text-gray-400 border-4 border-dashed border-gray-300">
              <Package size={48} className="mx-auto mb-2 opacity-50" />
              <p>No cards yet.</p>
              <button
                onClick={() => setView("dashboard")}
                className="text-blue-500 underline mt-2"
              >
                Go earn points!
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
      )}

      {/* MODAL: ADD TASK */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black p-6 w-full max-w-sm shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-4">NEW QUEST</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1">TITLE</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  className="w-full border-2 border-gray-400 p-2 font-sans focus:border-black outline-none"
                  placeholder="e.g. Drink Water"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">CATEGORY</label>
                <select
                  value={newTask.categoryId}
                  onChange={(e) =>
                    setNewTask({ ...newTask, categoryId: e.target.value })
                  }
                  className="w-full border-2 border-gray-400 p-2 font-sans focus:border-black outline-none bg-white"
                >
                  {INITIAL_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1">
                  DIFFICULTY
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() =>
                        setNewTask({ ...newTask, difficulty: lvl as any })
                      }
                      className={`flex-1 py-2 border-2 text-center font-bold ${
                        newTask.difficulty === lvl
                          ? "bg-black text-white border-black"
                          : "border-gray-300 text-gray-400"
                      }`}
                    >
                      {"★".repeat(lvl)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={addTask}
                className="w-full py-3 bg-green-500 text-white font-bold border-b-4 border-green-700 active:border-0 active:translate-y-1 mt-4"
              >
                CREATE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

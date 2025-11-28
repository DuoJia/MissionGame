// src/App.tsx

import React, { useState, useEffect, useMemo } from "react";
import {
  CheckSquare,
  Package,
  Plus,
  Trash2,
  X,
  Grid,
  List,
  ChevronUp,
  ChevronDown,
  Settings,
  Edit,
  Save,
  Trash,
} from "lucide-react";

// 🎯 引入模組化檔案
import {
  User,
  Category,
  Task,
  Card,
  Rarity,
  View,
  INITIAL_CATEGORIES,
  CARD_TEMPLATES,
  COLOR_OPTIONS,
  getRarityColor,
} from "./types";
// 🎯 移除 .tsx 副檔名，避免 TS2691 錯誤。
import TaskModal from "./TaskModel";
import GachaView from "./GachaView";
import CollectionView from "./CollectionView";

// --- 3. Main Component ---

export default function App() {
  // --- State Management with LocalStorage Initialization ---

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem("pixel_categories");
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

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

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("pixel_tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [inventory, setInventory] = useState<Card[]>(() => {
    const saved = localStorage.getItem("pixel_inventory");
    return saved ? JSON.parse(saved) : [];
  });

  // UI State
  const [view, setView] = useState<View>("dashboard");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    categoryId: categories[0]?.id || "c1",
    difficulty: 1 as 1 | 2 | 3, // 明確指定型別
  });
  const [gachaAnimating, setGachaAnimating] = useState(false);
  const [lastDraw, setLastDraw] = useState<Card | null>(null);

  // R3: 任務折疊狀態
  const [collapsedCategories, setCollapsedCategories] = useState<
    Record<string, boolean>
  >({});

  // --- Effects: Persistence & Daily Reset ---

  useEffect(() => {
    localStorage.setItem("pixel_user", JSON.stringify(user));
    localStorage.setItem("pixel_tasks", JSON.stringify(tasks));
    localStorage.setItem("pixel_inventory", JSON.stringify(inventory));
    localStorage.setItem("pixel_categories", JSON.stringify(categories));
  }, [user, tasks, inventory, categories]);

  useEffect(() => {
    const today = new Date().toDateString();
    if (user.lastLoginDate !== today) {
      const resetTasks = tasks.map((t) => {
        if (t.period === "daily") {
          return { ...t, completed: false };
        }
        return t;
      });

      setTasks(resetTasks);
      setUser((prev) => ({ ...prev, lastLoginDate: today }));
    }
  }, []);

  // --- Actions ---

  // 🎯 修復 addTask 邏輯
  const addTask = () => {
    if (!newTask.title.trim()) return;

    const pointsMap = { 1: 10, 2: 20, 3: 30 };

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title.trim(),
      categoryId: newTask.categoryId,
      difficulty: newTask.difficulty,
      points: pointsMap[newTask.difficulty],
      completed: false,
      period: "daily", // 預設為每日任務
    };

    setTasks((prev) => [task, ...prev]);
    setIsTaskModalOpen(false);
    setNewTask({
      title: "",
      categoryId: categories[0]?.id || "c1",
      difficulty: 1,
    });
  };

  const deleteCategory = (/* ... */) => {
    /* ... existing logic ... */
  };
  const addCategory = (/* ... */) => {
    /* ... existing logic ... */
  };

  // 🎯 確保 toggleCollapse 留在 App.tsx
  const toggleCollapse = (id: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // 任務完成/取消，積分會自動累積到 total_points
  const toggleTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (!task.completed) {
      // 完成任務，增加積分
      setUser((prev) => ({
        ...prev,
        total_points: prev.total_points + task.points,
        streak: prev.streak + 1,
      }));
    } else {
      // 取消完成，扣除積分
      setUser((prev) => ({
        ...prev,
        total_points: Math.max(0, prev.total_points - task.points),
      }));
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTask = (id: string) => {
    if (window.confirm("確定要刪除這個任務嗎？")) {
      setTasks(tasks.filter((t) => t.id !== id));
    }
  };

  // 🎯 抽卡成本設定為 100 點
  const drawCard = () => {
    const COST = 100; // 成本改為 100 PT
    if (user.total_points < COST) {
      alert(`積分不足 (需要 ${COST} PT)`);
      return;
    }

    setUser((prev) => ({ ...prev, total_points: prev.total_points - COST }));
    setGachaAnimating(true);

    setTimeout(() => {
      const rand = Math.random();
      let rarity: Rarity = "common";
      if (rand > 0.95) rarity = "legendary";
      else if (rand > 0.85) rarity = "epic";
      else if (rand > 0.65) rarity = "rare";

      const pool =
        CARD_TEMPLATES.filter((c) => c.rarity === rarity) || CARD_TEMPLATES;
      const template = pool[Math.floor(Math.random() * pool.length)];

      const newCard: Card = {
        id: Date.now().toString(),
        name: template.name,
        rarity: rarity,
        seed: Math.random().toString(),
      };

      setInventory((prev) => [newCard, ...prev]);
      setLastDraw(newCard);
      setGachaAnimating(false);
    }, 1500);
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
          onClick={() => setView("gacha")}
          className={`flex-1 py-3 font-bold flex items-center justify-center gap-2 ${
            view === "gacha"
              ? "bg-pink-100 text-pink-800"
              : "text-gray-400 hover:bg-gray-100"
          }`}
        >
          <Package size={18} /> GACHA
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
        <button
          onClick={() => setView("category_manager")}
          className={`py-3 px-3 font-bold flex items-center justify-center gap-2 ${
            view === "category_manager"
              ? "bg-orange-100 text-orange-800"
              : "text-gray-400 hover:bg-gray-100"
          }`}
          title="管理類別"
        >
          <Settings size={18} />
        </button>
      </div>
      {/* VIEW: DASHBOARD */}
      {view === "dashboard" && (
        <div className="p-4 space-y-6">
          {/* Add Task Button */}
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="w-full py-3 border-4 border-dashed border-gray-400 text-gray-500 font-bold hover:bg-white hover:border-black hover:text-black transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} /> NEW TASK
          </button>
          {/* Task Lists by Category (R3: Folding Logic applied) */}
          {categories.map((cat) => {
            const catTasks = tasks.filter((t) => t.categoryId === cat.id);
            if (catTasks.length === 0 && view === "dashboard") return null;

            const isCollapsed = collapsedCategories[cat.id];

            return (
              <div key={cat.id} className="relative">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={(_e) => toggleCollapse(cat.id)}
                >
                  <div
                    className={`inline-block px-2 py-1 text-xs text-white font-bold mb-2 ${cat.color} border-2 border-black`}
                  >
                    {cat.name} ({catTasks.length})
                  </div>
                  <button className="p-1 border-2 border-black bg-white hover:bg-gray-200">
                    {isCollapsed ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronUp size={16} />
                    )}
                  </button>
                </div>

                {!isCollapsed && (
                  <div className="space-y-3">
                    {catTasks.length === 0 && (
                      <p className="text-xs text-gray-500 pl-2">
                        此類別尚無任務。
                      </p>
                    )}
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
                                task.completed
                                  ? "line-through text-gray-500"
                                  : ""
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
                )}
              </div>
            );
          })}
        </div>
      )}
      {/* VIEW: GACHA (使用模組化組件) */}
      {view === "gacha" && (
        <GachaView
          user={user}
          gachaAnimating={gachaAnimating}
          lastDraw={lastDraw}
          drawCard={drawCard}
        />
      )}
      {/* VIEW: COLLECTION (使用模組化組件) */}
      {view === "collection" && (
        <CollectionView inventory={inventory} setView={setView} />
      )}
      {/* R2: VIEW: CATEGORY MANAGER (Omitted for brevity) */}
      {view === "category_manager" && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          {/* ... Category Manager Modal content ... */}
          {/* 這裡需要 Category Manager 的實際內容，目前是空的 */}
        </div>
      )}
      {/* MODAL: ADD TASK (使用模組化組件) */}
      <TaskModal
        isTaskModalOpen={isTaskModalOpen}
        setIsTaskModalOpen={setIsTaskModalOpen}
        newTask={newTask}
        setNewTask={setNewTask}
        categories={categories}
        addTask={addTask}
      />
    </div>
  );
}

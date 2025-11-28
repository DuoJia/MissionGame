// src/TaskModal.tsx
//任務清單功能
import React from "react";
import { Plus, X } from "lucide-react";
import { Task, Category } from "./types"; // 引入型別

// 定義 TaskModal 接收的 props
interface TaskModalProps {
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (isOpen: boolean) => void;
  newTask: { title: string; categoryId: string; difficulty: 1 | 2 | 3 };
  setNewTask: React.Dispatch<
    React.SetStateAction<{
      title: string;
      categoryId: string;
      difficulty: 1 | 2 | 3;
    }>
  >;
  categories: Category[]; // 使用 categories state
  addTask: () => void; // 使用 addTask action
}

export default function TaskModal({
  isTaskModalOpen,
  setIsTaskModalOpen,
  newTask,
  setNewTask,
  categories,
  addTask,
}: TaskModalProps) {
  if (!isTaskModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black p-6 w-full max-w-sm shadow-2xl relative">
        <button
          onClick={() => setIsTaskModalOpen(false)}
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
              placeholder="e.g. 喝水"
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
              {/* 確保這裡使用 categories 變數 */}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">DIFFICULTY</label>
            <div className="flex gap-2">
              {[1, 2, 3].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() =>
                    setNewTask({ ...newTask, difficulty: lvl as 1 | 2 | 3 })
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
            disabled={newTask.title.trim() === ""}
          >
            CREATE
          </button>
        </div>
      </div>
    </div>
  );
}

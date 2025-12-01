// src/CategoryManagerModal.tsx

import React, { useState } from "react";
import { X, Save, Trash2, Plus, Edit } from "lucide-react";
import { Category, COLOR_OPTIONS } from "./types";

interface CategoryManagerModalProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  onClose: () => void;
  tasksCount: Record<string, number>; // 每個類別的任務數量，用於刪除檢查
}

export default function CategoryManagerModal({
  categories,
  setCategories,
  onClose,
  tasksCount,
}: CategoryManagerModalProps) {
  // State for adding new category
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(COLOR_OPTIONS[0]);

  // State for editing existing categories (key: categoryId)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;

    const newCat: Category = {
      id: "c" + Date.now().toString(),
      name: newCategoryName.trim(),
      color: newCategoryColor,
    };
    setCategories((prev) => [...prev, newCat]);
    setNewCategoryName(""); // Reset input
  };

  const handleDeleteCategory = (id: string, name: string) => {
    if (tasksCount[id] > 0) {
      alert(
        `無法刪除類別 "${name}"。請先移除或移動此類別下的 ${tasksCount[id]} 個任務。`
      );
      return;
    }
    if (window.confirm(`確定要刪除類別 "${name}" 嗎？此操作不可逆。`)) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  };

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) return;

    setCategories((prev) =>
      prev.map((c) =>
        c.id === editingId
          ? { ...c, name: editName.trim(), color: editColor }
          : c
      )
    );
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black w-full max-w-lg shadow-2xl relative overflow-y-auto max-h-[90vh]">
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-black p-2 bg-white border-2 border-black"
          >
            <X size={24} />
          </button>
          <h2 className="text-xl font-bold mb-6 border-b-4 border-black inline-block">
            CATEGORY MANAGER
          </h2>

          {/* 類別列表 */}
          <div className="space-y-3 mb-6">
            <h3 className="font-bold text-gray-600 border-b pb-1">
              現有類別 ({categories.length})
            </h3>
            {categories.map((cat) => (
              <div
                key={cat.id}
                className={`flex items-center justify-between p-3 bg-gray-50 border-2 border-black/50 ${cat.color} bg-opacity-10`}
              >
                {editingId === cat.id ? (
                  // 編輯模式
                  <div className="flex-1 flex gap-2 items-center">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border-2 border-gray-400 p-1 font-sans text-sm flex-1"
                    />
                    <select
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      className="border-2 border-gray-400 p-1 font-sans text-sm bg-white"
                    >
                      {COLOR_OPTIONS.map((color) => (
                        <option key={color} value={color}>
                          {color.replace("bg-", "")}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleSaveEdit}
                      className="p-1 bg-green-500 text-white border-2 border-green-700"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 bg-gray-500 text-white border-2 border-gray-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  // 顯示模式
                  <div className="flex items-center gap-2 flex-1">
                    <span
                      className={`inline-block w-4 h-4 ${cat.color} border border-black`}
                    ></span>
                    <span className="font-bold text-sm">
                      {cat.name} ({tasksCount[cat.id] || 0})
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(cat)}
                    className="p-1 border-2 border-black bg-yellow-300 hover:bg-yellow-400"
                    disabled={editingId !== null}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="p-1 border-2 border-black bg-red-400 text-white hover:bg-red-500"
                    disabled={editingId !== null}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 新增類別區塊 */}
          <h3 className="font-bold text-gray-600 border-b pb-1">新增類別</h3>
          <div className="flex flex-col gap-3 p-4 border-4 border-dashed border-gray-300 mt-4 bg-gray-50">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="輸入類別名稱..."
              className="w-full border-2 border-gray-400 p-2 font-sans"
              disabled={editingId !== null}
            />
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold">選擇顏色:</label>
              <div className="flex gap-1 overflow-x-auto p-1">
                {COLOR_OPTIONS.map((color) => (
                  <div
                    key={color}
                    onClick={() => setNewCategoryColor(color)}
                    className={`w-6 h-6 border-2 cursor-pointer ${color} ${
                      newCategoryColor === color
                        ? "border-black scale-110"
                        : "border-gray-400"
                    } transition-all`}
                  ></div>
                ))}
              </div>
            </div>
            <button
              onClick={handleAddCategory}
              className="py-2 bg-blue-500 text-white font-bold border-b-4 border-blue-700 active:border-0 active:translate-y-1 mt-2 disabled:bg-gray-500 disabled:border-gray-700"
              disabled={!newCategoryName.trim() || editingId !== null}
            >
              <Plus size={18} className="inline-block mr-2" /> ADD NEW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

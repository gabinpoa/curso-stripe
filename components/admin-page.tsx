"use client";

import { seedCourse } from "@/app/admin/actions";
import { useState } from "react";

export default function AdminPageComponent() {
  const [formData, setFormData] = useState({
    productId: "",
    libraryId: "",
    modules: [{ collectionId: "", isExtraContent: false }],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await seedCourse(formData);
      alert("Course added successfully!");
    } catch (error) {
      console.error("Seed process failed:", error);
      alert("An error occurred while adding the course.");
    }
  };

  const handleModuleChange = (
    index: number,
    field: string,
    value: string | boolean
  ) => {
    const updatedModules = [...formData.modules];
    updatedModules[index] = { ...updatedModules[index], [field]: value };
    setFormData({ ...formData, modules: updatedModules });
  };

  const addModule = () => {
    setFormData({
      ...formData,
      modules: [
        ...formData.modules,
        { collectionId: "", isExtraContent: false },
      ],
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin - Seed Data</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Product ID</label>
          <input
            type="text"
            value={formData.productId}
            onChange={(e) =>
              setFormData({ ...formData, productId: e.target.value })
            }
            className="border p-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Library ID</label>
          <input
            type="text"
            value={formData.libraryId}
            onChange={(e) =>
              setFormData({ ...formData, libraryId: e.target.value })
            }
            className="border p-2 w-full"
            required
          />
        </div>
        {formData.modules.map((module, index) => (
          <div key={index} className="border p-4 space-y-2">
            <h2 className="font-medium">Module {index + 1}</h2>
            <div>
              <label className="block font-medium">Collection ID</label>
              <input
                type="text"
                value={module.collectionId}
                onChange={(e) =>
                  handleModuleChange(index, "collectionId", e.target.value)
                }
                className="border p-2 w-full"
                required
              />
            </div>
            <div>
              <label className="block font-medium">Is Extra Content</label>
              <input
                type="checkbox"
                checked={module.isExtraContent}
                onChange={(e) =>
                  handleModuleChange(index, "isExtraContent", e.target.checked)
                }
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addModule}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Module
        </button>
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
}

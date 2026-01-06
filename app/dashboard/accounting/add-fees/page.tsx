"use client";

import React, { useState } from "react";
import { Plus, Trash2, Edit2 } from "lucide-react";

interface Fee {
  id: string;
  caseId: string;
  amount: number;
  description: string;
  dueDate: string;
}

export default function AddFeesPage() {
  const [fees] = useState<Fee[]>([]);
  const [isAddingFee, setIsAddingFee] = useState(false);
  const [formData, setFormData] = useState({
    caseId: "",
    amount: "",
    description: "",
    dueDate: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add fee submission logic
    setFormData({
      caseId: "",
      amount: "",
      description: "",
      dueDate: new Date().toISOString().split("T")[0],
    });
    setIsAddingFee(false);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">إضافة اتعاب</h1>
          <p className="text-slate-400">إضافة اتعاب جديدة للقضايا</p>
        </div>

        {/* Add Fee Button */}
        <div className="mb-8">
          <button
            onClick={() => setIsAddingFee(!isAddingFee)}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium"
          >
            <Plus className="w-5 h-5" />
            إضافة اتعاب جديدة
          </button>
        </div>

        {/* Add Fee Form */}
        {isAddingFee && (
          <div className="mb-8 rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              إضافة اتعاب جديدة
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    رقم القضية
                  </label>
                  <input
                    type="text"
                    value={formData.caseId}
                    onChange={(e) =>
                      setFormData({ ...formData, caseId: e.target.value })
                    }
                    placeholder="رقم القضية"
                    className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    المبلغ
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="المبلغ"
                    className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    الوصف
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="وصف الاتعاب"
                    className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700/50 text-white placeholder-slate-400 focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    تاريخ الاستحقاق
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-700/50 text-white focus:outline-none focus:border-green-500 transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingFee(false)}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Fees List */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 backdrop-blur-sm overflow-hidden">
          {fees.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-slate-400">لا توجد اتعاب مضافة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900/50 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                      رقم القضية
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                      المبلغ
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                      الوصف
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                      تاريخ الاستحقاق
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {fees.map((fee) => (
                    <tr
                      key={fee.id}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-300">{fee.caseId}</td>
                      <td className="px-6 py-4 text-slate-300">
                        {fee.amount} ريال
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {fee.description}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {new Date(fee.dueDate).toLocaleDateString("ar-SA")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

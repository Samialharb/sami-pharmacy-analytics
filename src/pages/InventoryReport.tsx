import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Download, Filter, AlertCircle, TrendingDown } from 'lucide-react';

const InventoryReport = () => {
  const [warehouse, setWarehouse] = useState('all');

  const inventoryData = [
    { product: 'دواء أ', quantity: 450, reorderLevel: 100, value: 22500 },
    { product: 'دواء ب', quantity: 280, reorderLevel: 80, value: 14000 },
    { product: 'دواء ج', quantity: 520, reorderLevel: 120, value: 26000 },
    { product: 'دواء د', quantity: 45, reorderLevel: 100, value: 2250 },
    { product: 'دواء هـ', quantity: 180, reorderLevel: 60, value: 9000 },
  ];

  const warehouseStatus = [
    { warehouse: 'المستودع الرئيسي', capacity: 10000, current: 7500, utilization: 75 },
    { warehouse: 'المستودع الثانوي', capacity: 5000, current: 3200, utilization: 64 },
    { warehouse: 'مستودع الفرع', capacity: 3000, current: 2100, utilization: 70 },
  ];

  const lowStockItems = [
    { product: 'دواء د', quantity: 45, reorderLevel: 100, status: 'حرج' },
    { product: 'دواء ف', quantity: 75, reorderLevel: 100, status: 'منخفض' },
    { product: 'دواء ز', quantity: 95, reorderLevel: 100, status: 'منخفض' },
  ];

  const movementHistory = [
    { date: '2024-11-11', type: 'إدخال', product: 'دواء أ', quantity: 100, reference: 'PO-001' },
    { date: '2024-11-10', type: 'إخراج', product: 'دواء ب', quantity: 50, reference: 'SO-045' },
    { date: '2024-11-10', type: 'تحويل', product: 'دواء ج', quantity: 30, reference: 'TR-012' },
    { date: '2024-11-09', type: 'إدخال', product: 'دواء د', quantity: 75, reference: 'PO-002' },
  ];

  const kpis = [
    { label: 'إجمالي قيمة المخزون', value: '73,750 ريال', change: '+5.2%' },
    { label: 'عدد المنتجات', value: '1,475', change: '+2.1%' },
    { label: 'معدل الدوران', value: '4.2x', change: '+0.3x' },
    { label: 'المنتجات منخفضة المخزون', value: '3', change: '-1' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تقرير المخزون</h1>
          <p className="text-gray-400 mt-1">تحليل شامل لحالة المخزون والمستودعات</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition">
          <Download size={20} />
          تصدير PDF
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center gap-4">
        <Filter size={20} className="text-gray-400" />
        <select
          value={warehouse}
          onChange={(e) => setWarehouse(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
        >
          <option value="all">جميع المستودعات</option>
          <option value="main">المستودع الرئيسي</option>
          <option value="secondary">المستودع الثانوي</option>
          <option value="branch">مستودع الفرع</option>
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">{kpi.label}</p>
            <p className="text-2xl font-bold mt-2">{kpi.value}</p>
            <p className="text-green-400 text-sm mt-2">{kpi.change}</p>
          </div>
        ))}
      </div>

      {/* Warehouse Status */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4">حالة المستودعات</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={warehouseStatus}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="warehouse" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
            <Legend />
            <Bar dataKey="current" fill="#3B82F6" name="المستخدم" />
            <Bar dataKey="capacity" fill="#D1D5DB" name="السعة الكلية" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Inventory Levels */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4">مستويات المخزون</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right py-3 px-4">المنتج</th>
                <th className="text-right py-3 px-4">الكمية الحالية</th>
                <th className="text-right py-3 px-4">مستوى إعادة الطلب</th>
                <th className="text-right py-3 px-4">قيمة المخزون</th>
                <th className="text-right py-3 px-4">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {inventoryData.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                  <td className="py-3 px-4">{item.product}</td>
                  <td className="py-3 px-4">{item.quantity}</td>
                  <td className="py-3 px-4">{item.reorderLevel}</td>
                  <td className="py-3 px-4">{item.value.toLocaleString()} ريال</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.quantity < item.reorderLevel 
                        ? 'bg-red-900/30 text-red-400' 
                        : 'bg-green-900/30 text-green-400'
                    }`}>
                      {item.quantity < item.reorderLevel ? 'منخفض' : 'طبيعي'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
        <h3 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
          <AlertCircle size={20} />
          تنبيهات المخزون المنخفض
        </h3>
        <div className="space-y-2">
          {lowStockItems.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-800/50 p-3 rounded">
              <div>
                <p className="font-semibold">{item.product}</p>
                <p className="text-sm text-gray-400">الكمية الحالية: {item.quantity}</p>
              </div>
              <span className={`px-3 py-1 rounded text-sm font-semibold ${
                item.status === 'حرج' 
                  ? 'bg-red-900/50 text-red-300' 
                  : 'bg-yellow-900/50 text-yellow-300'
              }`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Movement History */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4">سجل حركات المخزون</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right py-3 px-4">التاريخ</th>
                <th className="text-right py-3 px-4">نوع الحركة</th>
                <th className="text-right py-3 px-4">المنتج</th>
                <th className="text-right py-3 px-4">الكمية</th>
                <th className="text-right py-3 px-4">المرجع</th>
              </tr>
            </thead>
            <tbody>
              {movementHistory.map((movement, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                  <td className="py-3 px-4">{movement.date}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      movement.type === 'إدخال' ? 'bg-green-900/30 text-green-400' :
                      movement.type === 'إخراج' ? 'bg-red-900/30 text-red-400' :
                      'bg-blue-900/30 text-blue-400'
                    }`}>
                      {movement.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">{movement.product}</td>
                  <td className="py-3 px-4">{movement.quantity}</td>
                  <td className="py-3 px-4 font-mono">{movement.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryReport;

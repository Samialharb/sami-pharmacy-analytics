import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Filter, AlertTriangle } from 'lucide-react';

const PurchaseReport = () => {
  const [dateRange, setDateRange] = useState('month');

  const monthlyPurchaseData = [
    { month: 'يناير', purchases: 18000, orders: 45, suppliers: 12 },
    { month: 'فبراير', purchases: 21000, orders: 52, suppliers: 14 },
    { month: 'مارس', purchases: 19000, orders: 48, suppliers: 13 },
    { month: 'أبريل', purchases: 24000, orders: 60, suppliers: 15 },
    { month: 'مايو', purchases: 22000, orders: 55, suppliers: 14 },
    { month: 'يونيو', purchases: 26000, orders: 65, suppliers: 16 },
  ];

  const topSuppliers = [
    { name: 'المورد أ', purchases: 45000, orders: 28 },
    { name: 'المورد ب', purchases: 38000, orders: 24 },
    { name: 'المورد ج', purchases: 32000, orders: 20 },
    { name: 'المورد د', purchases: 28000, orders: 17 },
  ];

  const supplierDistribution = [
    { name: 'المورد أ', value: 45000 },
    { name: 'المورد ب', value: 38000 },
    { name: 'المورد ج', value: 32000 },
    { name: 'آخرون', value: 50000 },
  ];

  const pendingOrders = [
    { poId: 'PO-001', supplier: 'المورد أ', amount: 5000, date: '2024-11-05', status: 'في الطريق' },
    { poId: 'PO-002', supplier: 'المورد ب', amount: 3500, date: '2024-11-08', status: 'قيد الانتظار' },
    { poId: 'PO-003', supplier: 'المورد ج', amount: 4200, date: '2024-11-10', status: 'في الطريق' },
  ];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const kpis = [
    { label: 'إجمالي المشتريات', value: '130,000 ريال', change: '+15.2%' },
    { label: 'عدد الطلبات', value: '325', change: '+10.5%' },
    { label: 'عدد الموردين', value: '28', change: '+2.1%' },
    { label: 'متوسط سعر الطلب', value: '400 ريال', change: '+3.8%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تقرير المشتريات</h1>
          <p className="text-gray-400 mt-1">تحليل شامل لأوامر الشراء والموردين</p>
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
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
        >
          <option value="week">هذا الأسبوع</option>
          <option value="month">هذا الشهر</option>
          <option value="quarter">هذا الربع</option>
          <option value="year">هذه السنة</option>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Purchases */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">المشتريات الشهرية</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyPurchaseData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="purchases" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Supplier Distribution */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">توزيع الموردين</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={supplierDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {supplierDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Suppliers */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4">أفضل الموردين</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right py-3 px-4">المورد</th>
                <th className="text-right py-3 px-4">إجمالي المشتريات</th>
                <th className="text-right py-3 px-4">عدد الطلبات</th>
                <th className="text-right py-3 px-4">متوسط الطلب</th>
              </tr>
            </thead>
            <tbody>
              {topSuppliers.map((supplier, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                  <td className="py-3 px-4">{supplier.name}</td>
                  <td className="py-3 px-4">{supplier.purchases.toLocaleString()} ريال</td>
                  <td className="py-3 px-4">{supplier.orders}</td>
                  <td className="py-3 px-4">{(supplier.purchases / supplier.orders).toFixed(0)} ريال</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Orders */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle size={20} className="text-yellow-500" />
          الطلبات المعلقة
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right py-3 px-4">رقم الطلب</th>
                <th className="text-right py-3 px-4">المورد</th>
                <th className="text-right py-3 px-4">المبلغ</th>
                <th className="text-right py-3 px-4">التاريخ</th>
                <th className="text-right py-3 px-4">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {pendingOrders.map((order, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                  <td className="py-3 px-4 font-mono">{order.poId}</td>
                  <td className="py-3 px-4">{order.supplier}</td>
                  <td className="py-3 px-4">{order.amount.toLocaleString()} ريال</td>
                  <td className="py-3 px-4">{order.date}</td>
                  <td className="py-3 px-4">
                    <span className="bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded text-xs">
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReport;

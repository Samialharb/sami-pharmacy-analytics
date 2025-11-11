import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Download, Filter, Users, TrendingUp } from 'lucide-react';

const CustomersReport = () => {
  const [sortBy, setSortBy] = useState('revenue');

  const customerData = [
    { month: 'يناير', newCustomers: 45, activeCustomers: 320, churnRate: 5 },
    { month: 'فبراير', newCustomers: 52, activeCustomers: 350, churnRate: 4 },
    { month: 'مارس', newCustomers: 48, activeCustomers: 380, churnRate: 3 },
    { month: 'أبريل', newCustomers: 60, activeCustomers: 420, churnRate: 4 },
    { month: 'مايو', newCustomers: 55, activeCustomers: 450, churnRate: 2 },
    { month: 'يونيو', newCustomers: 65, activeCustomers: 500, churnRate: 3 },
  ];

  const topCustomers = [
    { id: 'C-001', name: 'عميل أ', revenue: 45000, orders: 28, lastPurchase: '2024-11-10', status: 'نشط' },
    { id: 'C-002', name: 'عميل ب', revenue: 38000, orders: 24, lastPurchase: '2024-11-09', status: 'نشط' },
    { id: 'C-003', name: 'عميل ج', revenue: 32000, orders: 20, lastPurchase: '2024-11-08', status: 'نشط' },
    { id: 'C-004', name: 'عميل د', revenue: 28000, orders: 17, lastPurchase: '2024-11-07', status: 'نشط' },
    { id: 'C-005', name: 'عميل هـ', revenue: 22000, orders: 14, lastPurchase: '2024-10-25', status: 'غير نشط' },
  ];

  const customerSegmentation = [
    { segment: 'عملاء ذهبيين', count: 15, revenue: 250000, percentage: 35 },
    { segment: 'عملاء فضيين', count: 45, revenue: 180000, percentage: 25 },
    { segment: 'عملاء عاديين', count: 150, revenue: 120000, percentage: 17 },
    { segment: 'عملاء جدد', count: 200, revenue: 80000, percentage: 11 },
    { segment: 'عملاء غير نشطين', count: 100, revenue: 40000, percentage: 6 },
  ];

  const customerLifetime = [
    { month: 'يناير', ltv: 2500, clv: 1800 },
    { month: 'فبراير', ltv: 2650, clv: 1950 },
    { month: 'مارس', ltv: 2800, clv: 2100 },
    { month: 'أبريل', ltv: 3000, clv: 2250 },
    { month: 'مايو', ltv: 3200, clv: 2400 },
    { month: 'يونيو', ltv: 3450, clv: 2600 },
  ];

  const kpis = [
    { label: 'إجمالي العملاء', value: '3,377', change: '+6.2%' },
    { label: 'العملاء النشطين', value: '2,890', change: '+8.5%' },
    { label: 'متوسط قيمة العميل', value: '2,600 ريال', change: '+12.3%' },
    { label: 'معدل الاحتفاظ', value: '94.2%', change: '+2.1%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تقرير العملاء</h1>
          <p className="text-gray-400 mt-1">تحليل شامل لسلوك العملاء والعلاقات</p>
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
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
        >
          <option value="revenue">ترتيب حسب الإيرادات</option>
          <option value="orders">ترتيب حسب عدد الطلبات</option>
          <option value="recent">الأحدث أولاً</option>
          <option value="inactive">غير النشطين</option>
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

      {/* Customer Growth Chart */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4">نمو العملاء الشهري</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={customerData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="month" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
            <Legend />
            <Bar dataKey="newCustomers" fill="#10B981" name="عملاء جدد" />
            <Bar dataKey="activeCustomers" fill="#3B82F6" name="عملاء نشطين" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Customer Lifetime Value */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4">قيمة العميل مدى الحياة</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={customerLifetime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="month" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
            <Legend />
            <Bar dataKey="ltv" fill="#F59E0B" name="LTV" />
            <Bar dataKey="clv" fill="#8B5CF6" name="CLV" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Customers */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          أفضل العملاء
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right py-3 px-4">معرّف العميل</th>
                <th className="text-right py-3 px-4">الاسم</th>
                <th className="text-right py-3 px-4">الإيرادات</th>
                <th className="text-right py-3 px-4">عدد الطلبات</th>
                <th className="text-right py-3 px-4">آخر عملية شراء</th>
                <th className="text-right py-3 px-4">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((customer, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                  <td className="py-3 px-4 font-mono text-xs">{customer.id}</td>
                  <td className="py-3 px-4">{customer.name}</td>
                  <td className="py-3 px-4">{customer.revenue.toLocaleString()} ريال</td>
                  <td className="py-3 px-4">{customer.orders}</td>
                  <td className="py-3 px-4">{customer.lastPurchase}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      customer.status === 'نشط'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Segmentation */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users size={20} />
          تقسيم العملاء
        </h2>
        <div className="space-y-4">
          {customerSegmentation.map((segment, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold">{segment.segment}</span>
                  <p className="text-sm text-gray-400">{segment.count} عميل</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{segment.revenue.toLocaleString()} ريال</p>
                  <p className="text-sm text-gray-400">{segment.percentage}%</p>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{width: `${segment.percentage * 2}%`}}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">متوسط قيمة الطلب</p>
          <p className="text-2xl font-bold mt-2">1,650 ريال</p>
          <p className="text-green-400 text-sm mt-2">+4.5%</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">معدل تكرار الشراء</p>
          <p className="text-2xl font-bold mt-2">4.2x</p>
          <p className="text-green-400 text-sm mt-2">+1.2x</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">معدل الاحتفاظ</p>
          <p className="text-2xl font-bold mt-2">94.2%</p>
          <p className="text-green-400 text-sm mt-2">+2.1%</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">معدل الفقد</p>
          <p className="text-2xl font-bold mt-2">5.8%</p>
          <p className="text-red-400 text-sm mt-2">-2.1%</p>
        </div>
      </div>
    </div>
  );
};

export default CustomersReport;

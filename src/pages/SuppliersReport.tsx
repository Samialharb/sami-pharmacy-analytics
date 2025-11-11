import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter } from 'recharts';
import { Download, Filter, Star, TrendingUp } from 'lucide-react';

const SuppliersReport = () => {
  const [sortBy, setSortBy] = useState('purchases');

  const supplierPerformance = [
    { supplier: 'المورد أ', purchases: 45000, orders: 28, avgDelivery: 3, rating: 4.8 },
    { supplier: 'المورد ب', purchases: 38000, orders: 24, avgDelivery: 4, rating: 4.5 },
    { supplier: 'المورد ج', purchases: 32000, orders: 20, avgDelivery: 2, rating: 4.9 },
    { supplier: 'المورد د', purchases: 28000, orders: 17, avgDelivery: 5, rating: 4.2 },
    { supplier: 'المورد هـ', purchases: 22000, orders: 14, avgDelivery: 3, rating: 4.6 },
  ];

  const monthlySupplierData = [
    { month: 'يناير', 'المورد أ': 3500, 'المورد ب': 2800, 'المورد ج': 2400 },
    { month: 'فبراير', 'المورد أ': 3800, 'المورد ب': 3000, 'المورد ج': 2600 },
    { month: 'مارس', 'المورد أ': 3600, 'المورد ب': 2900, 'المورد ج': 2500 },
    { month: 'أبريل', 'المورد أ': 4200, 'المورد ب': 3200, 'المورد ج': 2800 },
    { month: 'مايو', 'المورد أ': 3900, 'المورد ب': 3100, 'المورد ج': 2700 },
    { month: 'يونيو', 'المورد أ': 4300, 'المورد ب': 3400, 'المورد ج': 2900 },
  ];

  const deliveryPerformance = [
    { supplier: 'المورد أ', onTime: 95, late: 5 },
    { supplier: 'المورد ب', onTime: 88, late: 12 },
    { supplier: 'المورد ج', onTime: 98, late: 2 },
    { supplier: 'المورد د', onTime: 80, late: 20 },
    { supplier: 'المورد هـ', onTime: 92, late: 8 },
  ];

  const qualityMetrics = [
    { supplier: 'المورد أ', defectRate: 2.1, returnRate: 1.5, compliance: 98.4 },
    { supplier: 'المورد ب', defectRate: 3.2, returnRate: 2.1, compliance: 96.8 },
    { supplier: 'المورد ج', defectRate: 1.2, returnRate: 0.8, compliance: 99.2 },
    { supplier: 'المورد د', defectRate: 4.5, returnRate: 3.2, compliance: 94.5 },
    { supplier: 'المورد هـ', defectRate: 2.8, returnRate: 1.9, compliance: 97.2 },
  ];

  const kpis = [
    { label: 'عدد الموردين النشطين', value: '28', change: '+2' },
    { label: 'متوسط التقييم', value: '4.6/5', change: '+0.2' },
    { label: 'معدل الالتزام بالتسليم', value: '92.6%', change: '+3.2%' },
    { label: 'معدل الجودة', value: '97.2%', change: '+1.5%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تقرير الموردين</h1>
          <p className="text-gray-400 mt-1">تحليل شامل لأداء الموردين والعلاقات التجارية</p>
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
          <option value="purchases">ترتيب حسب المشتريات</option>
          <option value="rating">ترتيب حسب التقييم</option>
          <option value="delivery">ترتيب حسب التسليم</option>
          <option value="quality">ترتيب حسب الجودة</option>
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
          <h2 className="text-lg font-semibold mb-4">المشتريات الشهرية من أفضل الموردين</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySupplierData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="المورد أ" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="المورد ب" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="المورد ج" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Delivery Performance */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">أداء التسليم</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deliveryPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="supplier" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
              <Legend />
              <Bar dataKey="onTime" fill="#10B981" name="في الموعد" />
              <Bar dataKey="late" fill="#EF4444" name="متأخر" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Suppliers */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          أفضل الموردين
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right py-3 px-4">المورد</th>
                <th className="text-right py-3 px-4">إجمالي المشتريات</th>
                <th className="text-right py-3 px-4">عدد الطلبات</th>
                <th className="text-right py-3 px-4">متوسط التسليم</th>
                <th className="text-right py-3 px-4">التقييم</th>
              </tr>
            </thead>
            <tbody>
              {supplierPerformance.map((supplier, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                  <td className="py-3 px-4">{supplier.supplier}</td>
                  <td className="py-3 px-4">{supplier.purchases.toLocaleString()} ريال</td>
                  <td className="py-3 px-4">{supplier.orders}</td>
                  <td className="py-3 px-4">{supplier.avgDelivery} أيام</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-400 fill-yellow-400" />
                      <span>{supplier.rating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4">مؤشرات الجودة</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right py-3 px-4">المورد</th>
                <th className="text-right py-3 px-4">معدل العيوب</th>
                <th className="text-right py-3 px-4">معدل الإرجاع</th>
                <th className="text-right py-3 px-4">الامتثال</th>
              </tr>
            </thead>
            <tbody>
              {qualityMetrics.map((metric, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                  <td className="py-3 px-4">{metric.supplier}</td>
                  <td className="py-3 px-4">
                    <span className={metric.defectRate < 2.5 ? 'text-green-400' : 'text-red-400'}>
                      {metric.defectRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={metric.returnRate < 2 ? 'text-green-400' : 'text-red-400'}>
                      {metric.returnRate}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{width: `${metric.compliance}%`}}
                      ></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">متوسط وقت التسليم</p>
          <p className="text-2xl font-bold mt-2">3.4 أيام</p>
          <p className="text-green-400 text-sm mt-2">↓ 0.5 يوم من الشهر الماضي</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">معدل الجودة الإجمالي</p>
          <p className="text-2xl font-bold mt-2">97.2%</p>
          <p className="text-green-400 text-sm mt-2">↑ 1.5% من الشهر الماضي</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">متوسط سعر الطلب</p>
          <p className="text-2xl font-bold mt-2">1,450 ريال</p>
          <p className="text-green-400 text-sm mt-2">↓ 2.3% من الشهر الماضي</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">معدل الالتزام بالشروط</p>
          <p className="text-2xl font-bold mt-2">96.8%</p>
          <p className="text-green-400 text-sm mt-2">↑ 2.1% من الشهر الماضي</p>
        </div>
      </div>
    </div>
  );
};

export default SuppliersReport;

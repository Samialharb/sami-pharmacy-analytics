import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter } from 'recharts';
import { Download, Filter, TrendingUp, AlertTriangle } from 'lucide-react';

const ProductsReport = () => {
  const [category, setCategory] = useState('all');

  const productSales = [
    { product: 'دواء أ', sales: 15000, units: 450, margin: 35 },
    { product: 'دواء ب', sales: 12000, units: 380, margin: 32 },
    { product: 'دواء ج', sales: 10000, units: 320, margin: 38 },
    { product: 'دواء د', sales: 8000, units: 250, margin: 30 },
    { product: 'دواء هـ', sales: 6000, units: 180, margin: 28 },
  ];

  const monthlySalesData = [
    { month: 'يناير', category1: 4500, category2: 3200, category3: 2800 },
    { month: 'فبراير', category1: 4800, category2: 3400, category3: 3000 },
    { month: 'مارس', category1: 4600, category2: 3300, category3: 2900 },
    { month: 'أبريل', category1: 5200, category2: 3800, category3: 3200 },
    { month: 'مايو', category1: 4900, category2: 3600, category3: 3100 },
    { month: 'يونيو', category1: 5500, category2: 4000, category3: 3400 },
  ];

  const productPerformance = [
    { product: 'دواء أ', growth: 12.5, profitability: 35, marketShare: 18 },
    { product: 'دواء ب', growth: 8.3, profitability: 32, marketShare: 14 },
    { product: 'دواء ج', growth: 15.2, profitability: 38, marketShare: 12 },
    { product: 'دواء د', growth: 5.1, profitability: 30, marketShare: 10 },
    { product: 'دواء هـ', growth: 3.8, profitability: 28, marketShare: 8 },
  ];

  const stockLevels = [
    { product: 'دواء أ', current: 450, reorder: 100, status: 'جيد' },
    { product: 'دواء ب', current: 280, reorder: 80, status: 'منخفض' },
    { product: 'دواء ج', current: 520, reorder: 120, status: 'جيد' },
    { product: 'دواء د', current: 45, reorder: 100, status: 'حرج' },
    { product: 'دواء هـ', current: 180, reorder: 60, status: 'جيد' },
  ];

  const kpis = [
    { label: 'إجمالي المنتجات', value: '500+', change: '+25' },
    { label: 'متوسط الهامش الربحي', value: '32.6%', change: '+2.1%' },
    { label: 'معدل دوران المخزون', value: '4.2x', change: '+0.3x' },
    { label: 'المنتجات الرائجة', value: '45', change: '+8' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تقرير المنتجات</h1>
          <p className="text-gray-400 mt-1">تحليل شامل لأداء المنتجات والمبيعات</p>
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
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
        >
          <option value="all">جميع الفئات</option>
          <option value="category1">فئة 1 - الأدوية العامة</option>
          <option value="category2">فئة 2 - الأدوية المتخصصة</option>
          <option value="category3">فئة 3 - المكملات الغذائية</option>
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
        {/* Category Sales */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">مبيعات الفئات الشهرية</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="category1" stroke="#3B82F6" strokeWidth={2} name="الفئة 1" />
              <Line type="monotone" dataKey="category2" stroke="#10B981" strokeWidth={2} name="الفئة 2" />
              <Line type="monotone" dataKey="category3" stroke="#F59E0B" strokeWidth={2} name="الفئة 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Product Performance */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">أداء المنتجات</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={productSales}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="product" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
              <Legend />
              <Bar dataKey="sales" fill="#3B82F6" name="المبيعات" />
              <Bar dataKey="units" fill="#10B981" name="الوحدات" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          أفضل المنتجات مبيعاً
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right py-3 px-4">المنتج</th>
                <th className="text-right py-3 px-4">المبيعات</th>
                <th className="text-right py-3 px-4">الوحدات المباعة</th>
                <th className="text-right py-3 px-4">الهامش الربحي</th>
                <th className="text-right py-3 px-4">النسبة المئوية</th>
              </tr>
            </thead>
            <tbody>
              {productSales.map((product, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                  <td className="py-3 px-4">{product.product}</td>
                  <td className="py-3 px-4">{product.sales.toLocaleString()} ريال</td>
                  <td className="py-3 px-4">{product.units}</td>
                  <td className="py-3 px-4">{product.margin}%</td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(product.sales / 15000) * 100}%`}}></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Levels */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4">مستويات المخزون</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right py-3 px-4">المنتج</th>
                <th className="text-right py-3 px-4">المخزون الحالي</th>
                <th className="text-right py-3 px-4">مستوى إعادة الطلب</th>
                <th className="text-right py-3 px-4">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {stockLevels.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                  <td className="py-3 px-4">{item.product}</td>
                  <td className="py-3 px-4">{item.current}</td>
                  <td className="py-3 px-4">{item.reorder}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 w-fit ${
                      item.status === 'جيد'
                        ? 'bg-green-900/30 text-green-400'
                        : item.status === 'منخفض'
                        ? 'bg-yellow-900/30 text-yellow-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {item.status === 'حرج' && <AlertTriangle size={14} />}
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Performance Metrics */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4">مؤشرات الأداء</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right py-3 px-4">المنتج</th>
                <th className="text-right py-3 px-4">معدل النمو</th>
                <th className="text-right py-3 px-4">الربحية</th>
                <th className="text-right py-3 px-4">حصة السوق</th>
              </tr>
            </thead>
            <tbody>
              {productPerformance.map((metric, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                  <td className="py-3 px-4">{metric.product}</td>
                  <td className="py-3 px-4">
                    <span className="text-green-400">↑ {metric.growth}%</span>
                  </td>
                  <td className="py-3 px-4">{metric.profitability}%</td>
                  <td className="py-3 px-4">{metric.marketShare}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">متوسط سعر المنتج</p>
          <p className="text-2xl font-bold mt-2">850 ريال</p>
          <p className="text-green-400 text-sm mt-2">↑ 3.2% من الشهر الماضي</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">متوسط الهامش الربحي</p>
          <p className="text-2xl font-bold mt-2">32.6%</p>
          <p className="text-green-400 text-sm mt-2">↑ 2.1% من الشهر الماضي</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">معدل دوران المخزون</p>
          <p className="text-2xl font-bold mt-2">4.2x</p>
          <p className="text-green-400 text-sm mt-2">↑ 0.3x من الشهر الماضي</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">المنتجات الرائجة</p>
          <p className="text-2xl font-bold mt-2">45</p>
          <p className="text-green-400 text-sm mt-2">↑ 8 منتجات جديدة</p>
        </div>
      </div>
    </div>
  );
};

export default ProductsReport;

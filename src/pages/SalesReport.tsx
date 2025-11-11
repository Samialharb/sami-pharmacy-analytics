import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Download, Filter, TrendingUp } from 'lucide-react';

const SalesReport = () => {
  const [dateRange, setDateRange] = useState('month');
  const [selectedProduct, setSelectedProduct] = useState('all');

  // Sample data
  const monthlySalesData = [
    { month: 'يناير', sales: 45000, orders: 320, customers: 150 },
    { month: 'فبراير', sales: 52000, orders: 380, customers: 180 },
    { month: 'مارس', sales: 48000, orders: 350, customers: 160 },
    { month: 'أبريل', sales: 61000, orders: 420, customers: 200 },
    { month: 'مايو', sales: 55000, orders: 390, customers: 190 },
    { month: 'يونيو', sales: 67000, orders: 450, customers: 220 },
  ];

  const topProducts = [
    { name: 'دواء أ', sales: 15000, units: 450 },
    { name: 'دواء ب', sales: 12000, units: 380 },
    { name: 'دواء ج', sales: 10000, units: 320 },
    { name: 'دواء د', sales: 8000, units: 250 },
    { name: 'دواء هـ', sales: 6000, units: 180 },
  ];

  const salesByCustomer = [
    { customer: 'عميل أ', sales: 25000, orders: 45 },
    { customer: 'عميل ب', sales: 20000, orders: 38 },
    { customer: 'عميل ج', sales: 18000, orders: 35 },
    { customer: 'عميل د', sales: 15000, orders: 28 },
    { customer: 'عميل هـ', sales: 12000, orders: 22 },
  ];

  const kpis = [
    { label: 'إجمالي المبيعات', value: '328,000 ريال', change: '+12.5%' },
    { label: 'عدد الطلبات', value: '1,890', change: '+8.3%' },
    { label: 'متوسط قيمة الطلب', value: '173.5 ريال', change: '+4.2%' },
    { label: 'عدد العملاء', value: '940', change: '+6.1%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تقرير المبيعات</h1>
          <p className="text-gray-400 mt-1">تحليل شامل لأداء المبيعات والطلبات</p>
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
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
        >
          <option value="all">جميع المنتجات</option>
          <option value="category1">فئة 1</option>
          <option value="category2">فئة 2</option>
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
        {/* Monthly Sales Trend */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            اتجاه المبيعات الشهري
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlySalesData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
              <Area type="monotone" dataKey="sales" stroke="#3B82F6" fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders vs Customers */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">الطلبات مقابل العملاء</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
              <Legend />
              <Bar dataKey="orders" fill="#10B981" />
              <Bar dataKey="customers" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4">أفضل المنتجات مبيعاً</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right py-3 px-4">المنتج</th>
                <th className="text-right py-3 px-4">المبيعات</th>
                <th className="text-right py-3 px-4">الوحدات المباعة</th>
                <th className="text-right py-3 px-4">النسبة المئوية</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                  <td className="py-3 px-4">{product.name}</td>
                  <td className="py-3 px-4">{product.sales.toLocaleString()} ريال</td>
                  <td className="py-3 px-4">{product.units}</td>
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

      {/* Sales by Customer */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4">المبيعات حسب العميل</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right py-3 px-4">العميل</th>
                <th className="text-right py-3 px-4">إجمالي المبيعات</th>
                <th className="text-right py-3 px-4">عدد الطلبات</th>
                <th className="text-right py-3 px-4">متوسط الطلب</th>
              </tr>
            </thead>
            <tbody>
              {salesByCustomer.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                  <td className="py-3 px-4">{item.customer}</td>
                  <td className="py-3 px-4">{item.sales.toLocaleString()} ريال</td>
                  <td className="py-3 px-4">{item.orders}</td>
                  <td className="py-3 px-4">{(item.sales / item.orders).toFixed(0)} ريال</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;

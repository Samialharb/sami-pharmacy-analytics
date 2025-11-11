import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Download, Filter, TrendingUp, TrendingDown } from 'lucide-react';

const FinancialReport = () => {
  const [reportType, setReportType] = useState('income');

  const incomeStatementData = [
    { month: 'يناير', revenue: 90000, expenses: 65000, profit: 25000 },
    { month: 'فبراير', revenue: 95000, expenses: 68000, profit: 27000 },
    { month: 'مارس', revenue: 88000, expenses: 62000, profit: 26000 },
    { month: 'أبريل', revenue: 102000, expenses: 72000, profit: 30000 },
    { month: 'مايو', revenue: 98000, expenses: 70000, profit: 28000 },
    { month: 'يونيو', revenue: 110000, expenses: 75000, profit: 35000 },
  ];

  const balanceSheetData = {
    assets: 450000,
    liabilities: 200000,
    equity: 250000,
  };

  const expenseBreakdown = [
    { category: 'تكلفة البضائع', amount: 420000, percentage: 55 },
    { category: 'الرواتب والأجور', amount: 180000, percentage: 24 },
    { category: 'الإيجار والمرافق', amount: 90000, percentage: 12 },
    { category: 'التسويق والإعلان', amount: 45000, percentage: 6 },
    { category: 'أخرى', amount: 30000, percentage: 4 },
  ];

  const cashFlowData = [
    { month: 'يناير', inflow: 95000, outflow: 70000, net: 25000 },
    { month: 'فبراير', inflow: 100000, outflow: 72000, net: 28000 },
    { month: 'مارس', inflow: 92000, outflow: 68000, net: 24000 },
    { month: 'أبريل', inflow: 108000, outflow: 75000, net: 33000 },
    { month: 'مايو', inflow: 103000, outflow: 73000, net: 30000 },
    { month: 'يونيو', inflow: 115000, outflow: 78000, net: 37000 },
  ];

  const kpis = [
    { label: 'إجمالي الإيرادات', value: '583,000 ريال', change: '+8.5%', icon: TrendingUp },
    { label: 'إجمالي المصروفات', value: '422,000 ريال', change: '+5.2%', icon: TrendingDown },
    { label: 'صافي الربح', value: '171,000 ريال', change: '+12.3%', icon: TrendingUp },
    { label: 'نسبة الربح', value: '29.3%', change: '+2.1%', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">التقارير المالية</h1>
          <p className="text-gray-400 mt-1">تحليل شامل للأداء المالي والربحية</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition">
          <Download size={20} />
          تصدير PDF
        </button>
      </div>

      {/* Report Type Selector */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center gap-4">
        <Filter size={20} className="text-gray-400" />
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
        >
          <option value="income">بيان الدخل</option>
          <option value="balance">الميزانية العمومية</option>
          <option value="cashflow">بيان التدفقات النقدية</option>
          <option value="expenses">توزيع المصروفات</option>
        </select>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{kpi.label}</p>
                  <p className="text-2xl font-bold mt-2">{kpi.value}</p>
                  <p className="text-green-400 text-sm mt-2">{kpi.change}</p>
                </div>
                <Icon size={24} className="text-blue-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Income Statement Chart */}
      {reportType === 'income' && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">بيان الدخل الشهري</h2>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={incomeStatementData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" />
              <Area type="monotone" dataKey="expenses" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpenses)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Balance Sheet */}
      {reportType === 'balance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">الأصول</h3>
            <p className="text-3xl font-bold text-blue-400">{balanceSheetData.assets.toLocaleString()} ريال</p>
            <p className="text-gray-400 mt-2">إجمالي الأصول المتاحة</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">الخصوم</h3>
            <p className="text-3xl font-bold text-red-400">{balanceSheetData.liabilities.toLocaleString()} ريال</p>
            <p className="text-gray-400 mt-2">إجمالي الالتزامات</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4">حقوق الملكية</h3>
            <p className="text-3xl font-bold text-green-400">{balanceSheetData.equity.toLocaleString()} ريال</p>
            <p className="text-gray-400 mt-2">إجمالي حقوق الملكية</p>
          </div>
        </div>
      )}

      {/* Cash Flow Chart */}
      {reportType === 'cashflow' && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">بيان التدفقات النقدية</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
              <Legend />
              <Bar dataKey="inflow" fill="#10B981" name="التدفقات الداخلة" />
              <Bar dataKey="outflow" fill="#EF4444" name="التدفقات الخارجة" />
              <Bar dataKey="net" fill="#3B82F6" name="الصافي" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Expense Breakdown */}
      {reportType === 'expenses' && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">توزيع المصروفات</h2>
          <div className="space-y-4">
            {expenseBreakdown.map((expense, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{expense.category}</span>
                  <span className="text-gray-400">{expense.amount.toLocaleString()} ريال ({expense.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{width: `${expense.percentage * 2}%`}}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial Summary Table */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4">ملخص المؤشرات المالية</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="bg-gray-700/50 p-4 rounded">
            <p className="text-gray-400 text-sm">متوسط الإيرادات الشهرية</p>
            <p className="text-xl font-bold mt-2">97,167 ريال</p>
          </div>
          <div className="bg-gray-700/50 p-4 rounded">
            <p className="text-gray-400 text-sm">متوسط المصروفات الشهرية</p>
            <p className="text-xl font-bold mt-2">70,333 ريال</p>
          </div>
          <div className="bg-gray-700/50 p-4 rounded">
            <p className="text-gray-400 text-sm">متوسط الربح الشهري</p>
            <p className="text-xl font-bold mt-2">28,500 ريال</p>
          </div>
          <div className="bg-gray-700/50 p-4 rounded">
            <p className="text-gray-400 text-sm">نسبة الربح المتوسطة</p>
            <p className="text-xl font-bold mt-2">29.3%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialReport;

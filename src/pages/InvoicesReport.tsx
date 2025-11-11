import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Filter, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const InvoicesReport = () => {
  const [status, setStatus] = useState('all');

  const invoiceData = [
    { month: 'يناير', issued: 45, paid: 42, pending: 3, overdue: 0 },
    { month: 'فبراير', issued: 52, paid: 50, pending: 2, overdue: 0 },
    { month: 'مارس', issued: 48, paid: 46, pending: 2, overdue: 0 },
    { month: 'أبريل', issued: 60, paid: 57, pending: 3, overdue: 0 },
    { month: 'مايو', issued: 55, paid: 52, pending: 2, overdue: 1 },
    { month: 'يونيو', issued: 65, paid: 61, pending: 3, overdue: 1 },
  ];

  const paymentMethods = [
    { method: 'تحويل بنكي', count: 180, percentage: 55 },
    { method: 'الدفع عند الاستلام', count: 95, percentage: 29 },
    { method: 'شيك', count: 45, percentage: 14 },
    { method: 'بطاقة ائتمان', count: 10, percentage: 3 },
  ];

  const recentInvoices = [
    { id: 'INV-2024-001', customer: 'عميل أ', amount: 5000, date: '2024-11-10', dueDate: '2024-11-24', status: 'مدفوع', method: 'تحويل بنكي' },
    { id: 'INV-2024-002', customer: 'عميل ب', amount: 3500, date: '2024-11-09', dueDate: '2024-11-23', status: 'معلق', method: 'الدفع عند الاستلام' },
    { id: 'INV-2024-003', customer: 'عميل ج', amount: 4200, date: '2024-11-08', dueDate: '2024-11-22', status: 'مدفوع', method: 'تحويل بنكي' },
    { id: 'INV-2024-004', customer: 'عميل د', amount: 2800, date: '2024-11-07', dueDate: '2024-11-21', status: 'متأخر', method: 'شيك' },
  ];

  const paymentTimeline = [
    { date: '2024-11-10', received: 15000, pending: 5000 },
    { date: '2024-11-09', received: 12000, pending: 3500 },
    { date: '2024-11-08', received: 18000, pending: 4200 },
    { date: '2024-11-07', received: 10000, pending: 2800 },
    { date: '2024-11-06', received: 16000, pending: 3000 },
  ];

  const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#EF4444'];

  const kpis = [
    { label: 'إجمالي الفواتير', value: '325', change: '+12.5%' },
    { label: 'إجمالي المبلغ', value: '1,250,000 ريال', change: '+8.3%' },
    { label: 'معدل التحصيل', value: '94.2%', change: '+2.1%' },
    { label: 'الفواتير المتأخرة', value: '5', change: '-1' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تقرير الفواتير والدفعات</h1>
          <p className="text-gray-400 mt-1">تحليل شامل للفواتير والمدفوعات</p>
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
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
        >
          <option value="all">جميع الفواتير</option>
          <option value="paid">مدفوعة</option>
          <option value="pending">معلقة</option>
          <option value="overdue">متأخرة</option>
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
        {/* Invoice Status */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">حالة الفواتير الشهرية</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={invoiceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
              <Legend />
              <Bar dataKey="issued" fill="#3B82F6" name="المُصدرة" />
              <Bar dataKey="paid" fill="#10B981" name="المدفوعة" />
              <Bar dataKey="pending" fill="#F59E0B" name="المعلقة" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold mb-4">طرق الدفع</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethods}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ method, percentage }) => `${method}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {paymentMethods.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Payment Timeline */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4">جدول المدفوعات</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={paymentTimeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
            <XAxis dataKey="date" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
            <Legend />
            <Line type="monotone" dataKey="received" stroke="#10B981" strokeWidth={2} name="المستلمة" />
            <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={2} name="المعلقة" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Invoices */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-lg font-semibold mb-4">آخر الفواتير</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-right py-3 px-4">رقم الفاتورة</th>
                <th className="text-right py-3 px-4">العميل</th>
                <th className="text-right py-3 px-4">المبلغ</th>
                <th className="text-right py-3 px-4">تاريخ الاستحقاق</th>
                <th className="text-right py-3 px-4">طريقة الدفع</th>
                <th className="text-right py-3 px-4">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map((invoice, idx) => (
                <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50 transition">
                  <td className="py-3 px-4 font-mono text-xs">{invoice.id}</td>
                  <td className="py-3 px-4">{invoice.customer}</td>
                  <td className="py-3 px-4">{invoice.amount.toLocaleString()} ريال</td>
                  <td className="py-3 px-4">{invoice.dueDate}</td>
                  <td className="py-3 px-4">{invoice.method}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 w-fit ${
                      invoice.status === 'مدفوع'
                        ? 'bg-green-900/30 text-green-400'
                        : invoice.status === 'معلق'
                        ? 'bg-yellow-900/30 text-yellow-400'
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {invoice.status === 'مدفوع' && <CheckCircle size={14} />}
                      {invoice.status === 'معلق' && <Clock size={14} />}
                      {invoice.status === 'متأخر' && <AlertCircle size={14} />}
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">متوسط وقت الدفع</p>
          <p className="text-2xl font-bold mt-2">14 يوم</p>
          <p className="text-green-400 text-sm mt-2">↓ 2 يوم من الشهر الماضي</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">متوسط قيمة الفاتورة</p>
          <p className="text-2xl font-bold mt-2">3,846 ريال</p>
          <p className="text-green-400 text-sm mt-2">↑ 5.2% من الشهر الماضي</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">معدل الدفع في الوقت المحدد</p>
          <p className="text-2xl font-bold mt-2">92.3%</p>
          <p className="text-green-400 text-sm mt-2">↑ 3.1% من الشهر الماضي</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">إجمالي المتأخرات</p>
          <p className="text-2xl font-bold mt-2">45,000 ريال</p>
          <p className="text-red-400 text-sm mt-2">↑ 8,000 ريال</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicesReport;

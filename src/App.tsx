import { useState } from 'react';
import { Users, Package, ShoppingCart, AlertCircle, DollarSign } from 'lucide-react';
import SalesReport from './pages/SalesReport';
import PurchaseReport from './pages/PurchaseReport';
import InventoryReport from './pages/InventoryReport';
import FinancialReport from './pages/FinancialReport';
import CustomersReport from './pages/CustomersReport';
import InvoicesReport from './pages/InvoicesReport';
import SuppliersReport from './pages/SuppliersReport';
import ProductsReport from './pages/ProductsReport';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const kpis = [
    { title: 'إجمالي المبيعات', value: '90,000 ريال', icon: DollarSign, color: 'bg-blue-500' },
    { title: 'عدد الطلبات', value: '27,920', icon: ShoppingCart, color: 'bg-green-500' },
    { title: 'عدد العملاء', value: '3,377', icon: Users, color: 'bg-purple-500' },
    { title: 'المنتجات', value: '500+', icon: Package, color: 'bg-orange-500' },
  ];

  const navigationItems = [
    { id: 'dashboard', label: 'لوحة التحكم' },
    { id: 'sales', label: 'المبيعات' },
    { id: 'purchases', label: 'المشتريات' },
    { id: 'inventory', label: 'المخزون' },
    { id: 'customers', label: 'العملاء' },
    { id: 'accounting', label: 'المحاسبة' },
    { id: 'invoices', label: 'الفواتير' },
    { id: 'suppliers', label: 'الموردين' },
    { id: 'products', label: 'المنتجات' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center font-bold">
              SA
            </div>
            <h1 className="text-2xl font-bold">صيدلية سامي - منصة التقارير</h1>
          </div>
          <div className="text-sm text-gray-400">
            {new Date().toLocaleDateString('ar-SA')}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 flex gap-4 overflow-x-auto">
          {navigationItems.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.map((kpi, idx) => {
                const Icon = kpi.icon;
                return (
                  <div key={idx} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-gray-400 text-sm">{kpi.title}</p>
                        <p className="text-2xl font-bold mt-2">{kpi.value}</p>
                      </div>
                      <div className={`${kpi.color} p-3 rounded-lg`}>
                        <Icon size={24} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/30 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">🎉 مرحباً بك في منصة التقارير والإحصائيات</h2>
              <p className="text-gray-300 mb-4">
                هذه المنصة توفر تحليلاً شاملاً لجميع بيانات صيدلية سامي من نظام Odoo ERP. 
                يمكنك الوصول إلى جميع التقارير والإحصائيات من خلال القائمة العلوية.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h3 className="font-semibold mb-2">📊 التقارير المتاحة</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>✓ تقرير المبيعات الشامل</li>
                    <li>✓ تقرير المشتريات والموردين</li>
                    <li>✓ تقرير المخزون والمستودعات</li>
                    <li>✓ التقارير المالية والربحية</li>
                    <li>✓ تقرير العملاء والسلوك</li>
                  </ul>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                  <h3 className="font-semibold mb-2">🚀 المميزات</h3>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>✓ رسوم بيانية تفاعلية</li>
                    <li>✓ جداول بيانات شاملة</li>
                    <li>✓ مؤشرات الأداء الرئيسية</li>
                    <li>✓ تصدير إلى PDF</li>
                    <li>✓ تحديث فوري للبيانات</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-400">تنبيهات المخزون</h3>
                <p className="text-sm text-yellow-300 mt-1">هناك 5 منتجات بكمية منخفضة تحتاج إلى إعادة طلب</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-400 text-sm">متوسط المبيعات اليومية</p>
                <p className="text-2xl font-bold mt-2">3,000 ريال</p>
                <p className="text-green-400 text-sm mt-2">↑ 8.5% من أمس</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-400 text-sm">متوسط قيمة الطلب</p>
                <p className="text-2xl font-bold mt-2">173.5 ريال</p>
                <p className="text-green-400 text-sm mt-2">↑ 4.2% من الأسبوع الماضي</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <p className="text-gray-400 text-sm">معدل رضا العملاء</p>
                <p className="text-2xl font-bold mt-2">94.2%</p>
                <p className="text-green-400 text-sm mt-2">↑ 2.1% من الشهر الماضي</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sales' && <SalesReport />}
        {activeTab === 'purchases' && <PurchaseReport />}
        {activeTab === 'inventory' && <InventoryReport />}
        {activeTab === 'accounting' && <FinancialReport />}
        {activeTab === 'customers' && <CustomersReport />}
        {activeTab === 'invoices' && <InvoicesReport />}
        {activeTab === 'suppliers' && <SuppliersReport />}
        {activeTab === 'products' && <ProductsReport />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          <p>© 2024 منصة التقارير والإحصائيات - صيدلية سامي</p>
          <p className="mt-2">جميع البيانات محدثة تلقائياً من نظام Odoo ERP</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

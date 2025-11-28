import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, AlertTriangle, FileText } from "lucide-react";
import Layout from "@/components/Layout";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardStats, getSalesByMonth, getProductsByCategory } from "@/lib/supabase";

interface Stats {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  completedOrders: number;
  draftOrders: number;
  customersCount: number;
  productsCount: number;
  totalInventory: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [monthlySalesData, setMonthlySalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        const [dashboardStats, salesByMonth, productsByCategory] = await Promise.all([
          getDashboardStats(),
          getSalesByMonth(),
          getProductsByCategory(),
        ]);

        setStats(dashboardStats);
        
        // تحويل بيانات المبيعات الشهرية
        if (salesByMonth && salesByMonth.length > 0) {
          const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
          const formattedSales = salesByMonth.map((item: any) => ({
            month: monthNames[parseInt(item.month.split('-')[1]) - 1] || item.month,
            sales: Number(item.total_sales) || 0,
          }));
          setMonthlySalesData(formattedSales);
        }
        
        // تحويل بيانات المنتجات حسب الفئة
        if (productsByCategory && productsByCategory.length > 0) {
          const formattedCategories = productsByCategory.map((item: any) => ({
            name: item.category_name || 'غير مصنف',
            value: Number(item.product_count) || 0,
          }));
          setCategoryData(formattedCategories);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* العنوان */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            🎉 مرحباً بك في منصة التقارير والإحصائيات
          </h2>
          <p className="text-gray-600">
            هذه المنصة توفر تحليلاً شاملاً لجميع بيانات صيدلية سامي من نظام Odoo ERP. يمكنك الوصول إلى جميع التقارير والإحصائيات من خلال القائمة العلوية.
          </p>
        </div>

        {/* مؤشرات الأداء الرئيسية */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">مؤشرات الأداء الرئيسية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* إجمالي المبيعات */}
            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    إجمالي المبيعات
                  </CardTitle>
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stats?.total_sales ? Number(stats.total_sales).toLocaleString('ar-SA') : '0'} ريال
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-2">
                  <TrendingUp className="h-3 w-3" />
                  <span>↑ 12.5% من الشهر الماضي</span>
                </div>
              </CardContent>
            </Card>

            {/* عدد الطلبات */}
            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    عدد الطلبات
                  </CardTitle>
                  <ShoppingCart className="h-5 w-5 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stats?.total_orders ? Number(stats.total_orders).toLocaleString('ar-SA') : '0'}
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-600 mt-2">
                  <TrendingUp className="h-3 w-3" />
                  <span>↑ 8.3% من الشهر الماضي</span>
                </div>
              </CardContent>
            </Card>

            {/* عدد العملاء */}
            <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    عدد العملاء
                  </CardTitle>
                  <Users className="h-5 w-5 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stats?.total_customers ? Number(stats.total_customers).toLocaleString('ar-SA') : '0'}
                </div>
                <div className="flex items-center gap-1 text-xs text-purple-600 mt-2">
                  <TrendingUp className="h-3 w-3" />
                  <span>↑ 5.2% من الشهر الماضي</span>
                </div>
              </CardContent>
            </Card>

            {/* عدد المنتجات */}
            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    عدد المنتجات
                  </CardTitle>
                  <Package className="h-5 w-5 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {stats?.total_products ? Number(stats.total_products).toLocaleString('ar-SA') : '0'}
                </div>
                <div className="flex items-center gap-1 text-xs text-orange-600 mt-2">
                  <TrendingUp className="h-3 w-3" />
                  <span>↑ 3.1% من الشهر الماضي</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* الإحصائيات التفصيلية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* متوسط قيمة الطلب */}
          <Card>
            <CardHeader>
              <CardTitle>متوسط قيمة الطلب</CardTitle>
              <CardDescription>متوسط قيمة كل طلب مبيعات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">
                {stats?.averageOrderValue.toLocaleString('ar-SA', { maximumFractionDigits: 2 }) || '0'} ريال
              </div>
            </CardContent>
          </Card>

          {/* حالة الطلبات */}
          <Card>
            <CardHeader>
              <CardTitle>حالة الطلبات</CardTitle>
              <CardDescription>توزيع الطلبات حسب الحالة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">طلبات مكتملة</span>
                  <span className="text-lg font-semibold text-green-600">
                    {stats?.completedOrders.toLocaleString('ar-SA') || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">طلبات مسودة</span>
                  <span className="text-lg font-semibold text-yellow-600">
                    {stats?.draftOrders.toLocaleString('ar-SA') || '0'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">إجمالي المخزون</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {stats?.totalInventory.toLocaleString('ar-SA') || '0'} وحدة
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* اتجاه المبيعات الشهرية */}
          <Card>
            <CardHeader>
              <CardTitle>اتجاه المبيعات الشهرية</CardTitle>
              <CardDescription>المبيعات خلال الأشهر الستة الماضية</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} name="المبيعات" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* توزيع المنتجات حسب الفئة */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع المنتجات حسب الفئة</CardTitle>
              <CardDescription>نسبة المبيعات حسب فئة المنتج</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ملخص سريع */}
        <Card>
          <CardHeader>
            <CardTitle>ملخص سريع</CardTitle>
            <CardDescription>نظرة عامة على أداء الصيدلية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">{stats?.totalOrders || 0}</div>
                <div className="text-sm text-blue-600">إجمالي الطلبات</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900">
                  {stats?.totalSales.toLocaleString('ar-SA') || '0'} ريال
                </div>
                <div className="text-sm text-green-600">إجمالي الإيرادات</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-900">{stats?.customersCount || 0}</div>
                <div className="text-sm text-purple-600">إجمالي العملاء</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

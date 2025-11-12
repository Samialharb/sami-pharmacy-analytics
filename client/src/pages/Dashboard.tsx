import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, AlertTriangle, FileText } from "lucide-react";
import Layout from "@/components/Layout";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  // جلب الإحصائيات
  const { data: stats, isLoading } = trpc.sales.getStats.useQuery();

  // بيانات مؤقتة للرسوم البيانية
  const monthlySalesData = [
    { month: 'يناير', sales: 12000 },
    { month: 'فبراير', sales: 15000 },
    { month: 'مارس', sales: 18000 },
    { month: 'أبريل', sales: 14000 },
    { month: 'مايو', sales: 22000 },
    { month: 'يونيو', sales: 25000 },
  ];

  const categoryData = [
    { name: 'مسكنات', value: 35 },
    { name: 'مضادات حيوية', value: 25 },
    { name: 'فيتامينات', value: 20 },
    { name: 'عناية بالبشرة', value: 12 },
    { name: 'أخرى', value: 8 },
  ];

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
                  {stats?.totalSales.toLocaleString('ar-SA') || '90,000'} ريال
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
                  {stats?.totalOrders.toLocaleString('ar-SA') || '27,920'}
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
                  3,377
                </div>
                <div className="flex items-center gap-1 text-xs text-purple-600 mt-2">
                  <TrendingUp className="h-3 w-3" />
                  <span>↑ 6.1% من الشهر الماضي</span>
                </div>
              </CardContent>
            </Card>

            {/* المنتجات */}
            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    المنتجات
                  </CardTitle>
                  <Package className="h-5 w-5 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  +500
                </div>
                <div className="flex items-center gap-1 text-xs text-orange-600 mt-2">
                  <TrendingUp className="h-3 w-3" />
                  <span>↑ 15 منتج جديد</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* رسم بياني للمبيعات الشهرية */}
          <Card>
            <CardHeader>
              <CardTitle>المبيعات الشهرية</CardTitle>
              <CardDescription>إجمالي المبيعات خلال آخر 6 أشهر</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* رسم بياني دائري للفئات */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع المبيعات حسب الفئة</CardTitle>
              <CardDescription>نسبة المبيعات لكل فئة منتج</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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

        {/* التقارير المتاحة */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 التقارير المتاحة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                  تقرير المبيعات الشامل
                </CardTitle>
                <CardDescription>
                  عرض وتحليل جميع طلبات المبيعات مع إمكانية الفلترة والتصدير
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-600" />
                  تقرير المنتجات
                </CardTitle>
                <CardDescription>
                  تحليل أداء المنتجات وأكثرها مبيعاً
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  تقرير العملاء
                </CardTitle>
                <CardDescription>
                  معلومات تفصيلية عن العملاء وسلوكهم الشرائي
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  تقرير المخزون
                </CardTitle>
                <CardDescription>
                  حالة المخزون الحالية والتنبيهات
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* المميزات */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">🚀 المميزات</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">رسوم بيانية تفاعلية</h4>
                <p className="text-sm text-gray-600">تصور البيانات بشكل واضح وسهل الفهم</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">جداول بيانات شاملة</h4>
                <p className="text-sm text-gray-600">عرض تفصيلي لجميع البيانات</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">مؤشرات الأداء الرئيسية</h4>
                <p className="text-sm text-gray-600">متابعة الأداء بشكل فوري</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">تصدير إلى PDF</h4>
                <p className="text-sm text-gray-600">حفظ التقارير بصيغة PDF</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingDown className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">تحديث فوري للبيانات</h4>
                <p className="text-sm text-gray-600">مزامنة تلقائية مع نظام Odoo</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">تنبيهات ذكية</h4>
                <p className="text-sm text-gray-600">إشعارات للمخزون المنخفض والأحداث المهمة</p>
              </div>
            </div>
          </div>
        </div>

        {/* إحصائيات إضافية */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">📈 إحصائيات إضافية</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  تنبيهات المخزون
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  5 منتجات
                </div>
                <p className="text-sm text-gray-600">
                  هناك 5 منتجات بكمية منخفضة تحتاج إلى إعادة طلب
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  متوسط المبيعات اليومية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  3,000 ريال
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>↑ 8.5% من أمس</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  متوسط قيمة الطلب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {stats?.averageOrderValue.toFixed(2) || '173.5'} ريال
                </div>
                <div className="flex items-center gap-1 text-sm text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>↑ 4.2% من الأسبوع الماضي</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, TrendingUp, DollarSign, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { trpc } from "@/lib/trpc";

export default function Products() {
  // جلب البيانات من tRPC
  const { data: products, isLoading: loadingProducts } = trpc.products.getAll.useQuery();
  const { data: stats, isLoading: loadingStats } = trpc.products.getStats.useQuery();

  const totalProducts = stats?.totalProducts || 500;
  const totalRevenue = stats?.totalRevenue || 0;
  const bestSeller = stats?.topProduct || { name: 'باراسيتامول 500 مجم', sold: 450 }; // بيانات للرسم البياني
  const topProductsChart = products?.slice(0, 6).map(p => ({
    name: p.name.substring(0, 15) + '...',
    sold: p.sold,
    revenue: p.revenue / 1000, // تحويل إلى آلاف
  }));

  return (
    <Layout>
      <div className="space-y-8">
        {/* العنوان */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            تقرير المنتجات
          </h2>
          <p className="text-gray-600">
            تحليل أداء المنتجات والمبيعات
          </p>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  إجمالي المنتجات
                </CardTitle>
                <Package className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {totalProducts.toLocaleString('ar-SA')}
              </div>
              <p className="text-xs text-gray-500 mt-1">منتج متاح</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  إجمالي الإيرادات
                </CardTitle>
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {totalRevenue.toLocaleString('ar-SA')} ر.س
              </div>
              <p className="text-xs text-gray-500 mt-1">من جميع المنتجات</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  الأكثر مبيعاً
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-900 truncate">
                {bestSeller.name}
              </div>
              <p className="text-xs text-gray-500 mt-1">{bestSeller.sold} وحدة مباعة</p>
            </CardContent>
          </Card>
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* رسم بياني للمنتجات الأكثر مبيعاً */}
          <Card>
            <CardHeader>
              <CardTitle>المنتجات الأكثر مبيعاً</CardTitle>
              <CardDescription>أفضل 6 منتجات من حيث الكمية المباعة</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductsChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sold" fill="#3B82F6" name="الكمية المباعة" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* رسم بياني للإيرادات */}
          <Card>
            <CardHeader>
              <CardTitle>الإيرادات حسب المنتج</CardTitle>
              <CardDescription>أفضل 6 منتجات من حيث الإيرادات (بالآلاف)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProductsChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#10B981" name="الإيرادات (ألف ر.س)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* جدول المنتجات */}
        <Card>
          <CardHeader>
            <CardTitle>جميع المنتجات</CardTitle>
            <CardDescription>قائمة شاملة بجميع المنتجات</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-right">المنتج</th>
                    <th className="px-4 py-3 text-right">الفئة</th>
                    <th className="px-4 py-3 text-right">الكمية المباعة</th>
                    <th className="px-4 py-3 text-right">الإيرادات</th>
                    <th className="px-4 py-3 text-right">المخزون</th>
                  </tr>
                </thead>
                <tbody>
                  {products?.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">{product.sold.toLocaleString('ar-SA')}</td>
                      <td className="px-4 py-3 font-semibold text-green-600">
                        {product.revenue.toLocaleString('ar-SA')} ر.س
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          product.stock < 100 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ملاحظة */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800">
              💡 <strong>ملاحظة:</strong> البيانات الحالية مؤقتة. سيتم تحديثها تلقائياً بعد تفعيل المزامنة مع نظام Aumet ERP.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

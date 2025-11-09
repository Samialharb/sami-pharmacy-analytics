import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const dashboardQuery = trpc.analytics.dashboard.useQuery();
  const topProductsQuery = trpc.analytics.topProducts.useQuery({ limit: 5 });
  const topCustomersQuery = trpc.analytics.topCustomers.useQuery({ limit: 5 });
  const recentOrdersQuery = trpc.analytics.recentOrders.useQuery({ limit: 5 });
  const lowInventoryQuery = trpc.analytics.lowInventory.useQuery({ threshold: 100 });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">صيدلية سامي أوميت</h1>
          <p className="text-xl text-gray-600 mb-8">منصة التقارير والإحصائيات المتقدمة</p>
          <Button onClick={() => window.location.href = getLoginUrl()} size="lg">
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  const stats = dashboardQuery.data;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">لوحة التحكم</h1>
            <p className="text-gray-500 mt-2">نظرة عامة على أداء الصيدلية</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">إجمالي المبيعات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{typeof stats?.totalRevenue === 'number' ? (stats.totalRevenue / 100).toFixed(2) : '0'} ريال</div>
              <p className="text-xs text-gray-500 mt-1">من أوامر البيع</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{typeof stats?.totalCustomers === 'number' ? stats.totalCustomers : 0}</div>
              <p className="text-xs text-gray-500 mt-1">عميل مسجل</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">المنتجات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{typeof stats?.totalProducts === 'number' ? stats.totalProducts : 0}</div>
              <p className="text-xs text-gray-500 mt-1">منتج نشط</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">الطلبات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{typeof stats?.totalOrders === 'number' ? stats.totalOrders : 0}</div>
              <p className="text-xs text-gray-500 mt-1">إجمالي الطلبات</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">قيمة المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{typeof stats?.totalInventoryValue === 'number' ? (stats.totalInventoryValue / 100).toFixed(2) : '0'} ريال</div>
              <p className="text-xs text-gray-500 mt-1">إجمالي المخزون</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders and Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>أحدث الطلبات</CardTitle>
              <CardDescription>آخر 5 طلبات</CardDescription>
            </CardHeader>
            <CardContent>
              {recentOrdersQuery.isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin" />
                </div>
              ) : recentOrdersQuery.data && recentOrdersQuery.data.length > 0 ? (
                <div className="space-y-2">
                  {recentOrdersQuery.data.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium">{order.orderId}</span>
                      <span className="text-sm text-gray-600">{typeof order.totalAmount === 'number' ? (order.totalAmount / 100).toFixed(2) : '0'} ريال</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">لا توجد طلبات</p>
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>أفضل المنتجات</CardTitle>
              <CardDescription>حسب السعر</CardDescription>
            </CardHeader>
            <CardContent>
              {topProductsQuery.isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin" />
                </div>
              ) : topProductsQuery.data && topProductsQuery.data.length > 0 ? (
                <div className="space-y-2">
                  {topProductsQuery.data.map((product) => (
                    <div key={product.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium text-sm truncate">{product.productName}</span>
                      <span className="text-sm text-gray-600">{typeof product.salePrice === 'number' ? (product.salePrice / 100).toFixed(2) : '0'} ريال</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">لا توجد منتجات</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Low Inventory Alert */}
        {lowInventoryQuery.data && lowInventoryQuery.data.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <AlertTriangle className="w-5 h-5" />
                تنبيه: مخزون منخفض
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-orange-800 mb-3">
                يوجد {lowInventoryQuery.data.length} منتج بمخزون منخفض
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

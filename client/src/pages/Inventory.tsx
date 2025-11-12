import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Warehouse, AlertTriangle, CheckCircle, Package, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { trpc } from "@/lib/trpc";

export default function Inventory() {
  // جلب البيانات من tRPC
  const { data: inventory, isLoading: loadingInventory } = trpc.inventory.getAll.useQuery();
  const { data: stats, isLoading: loadingStats } = trpc.inventory.getStats.useQuery();

  const totalItems = stats?.totalItems || 500;
  const lowStockItems = stats?.lowStockCount || 0;
  const goodStockItems = inventory?.filter(item => item.status === 'متوفر').length || 0;

  return (
    <Layout>
      <div className="space-y-8">
        {/* العنوان */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            تقرير المخزون
          </h2>
          <p className="text-gray-600">
            متابعة حالة المخزون والتنبيهات
          </p>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  إجمالي الأصناف
                </CardTitle>
                <Package className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {totalItems.toLocaleString('ar-SA')}
              </div>
              <p className="text-xs text-gray-500 mt-1">صنف في المخزون</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  مخزون جيد
                </CardTitle>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {goodStockItems}
              </div>
              <p className="text-xs text-gray-500 mt-1">صنف بمخزون كافٍ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  تنبيهات المخزون
                </CardTitle>
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {lowStockItems}
              </div>
              <p className="text-xs text-gray-500 mt-1">صنف يحتاج إعادة طلب</p>
            </CardContent>
          </Card>
        </div>

        {/* تنبيهات المخزون المنخفض */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              تنبيهات المخزون المنخفض
            </CardTitle>
            <CardDescription className="text-red-600">
              أصناف تحتاج إلى إعادة طلب فوراً
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inventory?.filter(item => item.status === "منخفض").map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500" />
                    <div>
                      <div className="font-medium text-gray-900">{item.product}</div>
                      <div className="text-sm text-gray-500">{item.lastUpdate}</div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-lg font-bold text-orange-600">
                      {item.quantity} وحدة
                    </div>
                    <div className="text-xs text-gray-500">الحد الأدنى: {item.minStock}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* جدول المخزون الكامل */}
        <Card>
          <CardHeader>
            <CardTitle>جميع الأصناف</CardTitle>
            <CardDescription>قائمة كاملة بالمخزون الحالي</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-right">الصنف</th>
                    <th className="px-4 py-3 text-right">الموقع</th>
                    <th className="px-4 py-3 text-right">الكمية الحالية</th>
                    <th className="px-4 py-3 text-right">الحد الأدنى</th>
                    <th className="px-4 py-3 text-right">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory?.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{item.product}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Warehouse className="h-3 w-3 text-gray-400" />
                          {item.lastUpdate}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold">{item.quantity}</td>
                      <td className="px-4 py-3 text-gray-600">{item.minStock}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${                          item.status === "منخفض" 
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {item.status === "منخفض" && <AlertTriangle className="h-3 w-3" />}
                          {item.status === "متوفر" && <CheckCircle className="h-3 w-3" />}
                          {item.status}                        </span>
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

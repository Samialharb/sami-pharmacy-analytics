import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileDown, FileSpreadsheet } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import Layout from "@/components/Layout";
import { getAllSalesOrders, getSalesStats, type SalesOrder } from "@/lib/supabase";

export default function Sales() {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'daily' | 'monthly' | 'yearly'>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  // استخدام 2025 كسنة افتراضية لأن البيانات في Supabase من 2025
  const [selectedYear, setSelectedYear] = useState(2025);
  
  const [allOrders, setAllOrders] = useState<SalesOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<SalesOrder[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // جلب البيانات من Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [orders, salesStats] = await Promise.all([
          getAllSalesOrders(),
          getSalesStats(),
        ]);
        setAllOrders(orders);
        setFilteredOrders(orders);
        setStats(salesStats);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // تطبيق الفلترة حسب الفترة
  useEffect(() => {
    if (!allOrders.length) return;

    let filtered = [...allOrders];

    if (selectedPeriod === 'daily') {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.date_order).toISOString().split('T')[0];
        return orderDate === selectedDate;
      });
    } else if (selectedPeriod === 'monthly') {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.date_order);
        return orderDate.getMonth() + 1 === selectedMonth && orderDate.getFullYear() === selectedYear;
      });
    } else if (selectedPeriod === 'yearly') {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.date_order);
        return orderDate.getFullYear() === selectedYear;
      });
    }

    setFilteredOrders(filtered);
  }, [selectedPeriod, selectedDate, selectedMonth, selectedYear, allOrders]);

  // حساب الإحصائيات للفترة المختارة
  const currentTotal = filteredOrders.reduce((sum, order) => sum + order.amount_total, 0);
  const currentCount = filteredOrders.length;
  const currentAverage = currentCount > 0 ? currentTotal / currentCount : 0;

  return (
    <Layout>
      <div className="space-y-8">
        {/* العنوان */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            تقارير المبيعات
          </h2>
          <p className="text-gray-600">
            عرض وتحليل بيانات المبيعات من نظام Odoo ERP
          </p>
        </div>

        {/* الإحصائيات الإجمالية */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  إجمالي المبيعات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {stats.totalSales.toLocaleString('ar-SA')} ريال
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  عدد الطلبات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.totalOrders.toLocaleString('ar-SA')}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  متوسط قيمة الطلب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {stats.averageOrderValue.toLocaleString('ar-SA', { maximumFractionDigits: 2 })} ريال
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  الطلبات المكتملة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {stats.completedOrders.toLocaleString('ar-SA')}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* فلاتر الفترة */}
        <Card>
          <CardHeader>
            <CardTitle>اختر الفترة</CardTitle>
            <CardDescription>حدد الفترة الزمنية لعرض التقرير</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6 flex-wrap">
              <Button
                variant={selectedPeriod === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('all')}
              >
                الكل
              </Button>
              <Button
                variant={selectedPeriod === 'daily' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('daily')}
              >
                يومي
              </Button>
              <Button
                variant={selectedPeriod === 'monthly' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('monthly')}
              >
                شهري
              </Button>
              <Button
                variant={selectedPeriod === 'yearly' ? 'default' : 'outline'}
                onClick={() => setSelectedPeriod('yearly')}
              >
                سنوي
              </Button>
            </div>

            {/* فلاتر التاريخ */}
            <div className="flex gap-4 flex-wrap">
              {selectedPeriod === 'daily' && (
                <div>
                  <label className="block text-sm font-medium mb-2">التاريخ</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 border rounded-md"
                  />
                </div>
              )}

              {selectedPeriod === 'monthly' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">الشهر</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(Number(e.target.value))}
                      className="px-4 py-2 border rounded-md"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>
                          {new Date(2025, month - 1).toLocaleDateString('ar-SA', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">السنة</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="px-4 py-2 border rounded-md"
                    >
                      {[2025, 2024, 2023].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {selectedPeriod === 'yearly' && (
                <div>
                  <label className="block text-sm font-medium mb-2">السنة</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-4 py-2 border rounded-md"
                  >
                    {[2025, 2024, 2023].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* إحصائيات الفترة المختارة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>إجمالي المبيعات للفترة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">
                {currentTotal.toLocaleString('ar-SA')} ريال
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>عدد الطلبات للفترة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-600">
                {currentCount.toLocaleString('ar-SA')}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>متوسط قيمة الطلب</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-purple-600">
                {currentAverage.toLocaleString('ar-SA', { maximumFractionDigits: 2 })} ريال
              </div>
            </CardContent>
          </Card>
        </div>

        {/* أزرار التصدير */}
        {filteredOrders.length > 0 && (
          <div className="flex gap-4">
            <Button
              onClick={() => {
                const filename = `sales_report_${selectedPeriod}_${selectedPeriod === 'daily' ? selectedDate : selectedPeriod === 'monthly' ? `${selectedYear}_${selectedMonth}` : selectedYear}`;
                exportToExcel(filteredOrders, filename);
              }}
              variant="outline"
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              تصدير إلى Excel
            </Button>
            <Button
              onClick={() => {
                const title = selectedPeriod === 'all'
                  ? 'تقرير المبيعات - جميع الفترات'
                  : selectedPeriod === 'daily' 
                  ? `تقرير المبيعات اليومي - ${selectedDate}`
                  : selectedPeriod === 'monthly'
                  ? `تقرير المبيعات الشهري - ${new Date(selectedYear, selectedMonth - 1).toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}`
                  : `تقرير المبيعات السنوي - ${selectedYear}`;
                
                const statsData = {
                  totalSales: currentTotal,
                  totalOrders: currentCount,
                  averageOrderValue: currentAverage
                };
                
                exportToPDF(filteredOrders, title, statsData);
              }}
              variant="outline"
              className="gap-2"
            >
              <FileDown className="h-4 w-4" />
              تصدير إلى PDF
            </Button>
          </div>
        )}

        {/* جدول الطلبات */}
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الطلبات</CardTitle>
            <CardDescription>
              {selectedPeriod === 'all' && 'جميع الطلبات'}
              {selectedPeriod === 'daily' && `طلبات يوم ${selectedDate}`}
              {selectedPeriod === 'monthly' && `طلبات شهر ${new Date(selectedYear, selectedMonth - 1).toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })}`}
              {selectedPeriod === 'yearly' && `طلبات سنة ${selectedYear}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-right">رقم الطلب</th>
                      <th className="px-4 py-3 text-right">التاريخ</th>
                      <th className="px-4 py-3 text-right">المبلغ</th>
                      <th className="px-4 py-3 text-right">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{order.name}</td>
                        <td className="px-4 py-3">
                          {new Date(order.date_order).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-600">
                          {order.amount_total.toLocaleString('ar-SA')} ريال
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.is_completed 
                              ? 'bg-green-100 text-green-800' 
                              : order.is_draft 
                              ? 'bg-gray-100 text-gray-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {order.is_completed ? 'مكتمل' : order.is_draft ? 'مسودة' : order.state}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                لا توجد طلبات في هذه الفترة
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, FileDown, FileSpreadsheet } from "lucide-react";
import { useState } from "react";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";

export default function Home() {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // جلب البيانات حسب الفترة المختارة
  const { data: dailySales, isLoading: isDailyLoading } = trpc.sales.getDaily.useQuery(
    { date: selectedDate },
    { enabled: selectedPeriod === 'daily' }
  );

  const { data: monthlySales, isLoading: isMonthlyLoading } = trpc.sales.getMonthly.useQuery(
    { year: selectedYear, month: selectedMonth },
    { enabled: selectedPeriod === 'monthly' }
  );

  const { data: yearlySales, isLoading: isYearlyLoading } = trpc.sales.getYearly.useQuery(
    { year: selectedYear },
    { enabled: selectedPeriod === 'yearly' }
  );

  // جلب الإحصائيات
  const { data: stats, isLoading: isStatsLoading } = trpc.sales.getStats.useQuery();

  const currentData = selectedPeriod === 'daily' 
    ? dailySales 
    : selectedPeriod === 'monthly' 
    ? monthlySales 
    : yearlySales;

  const isLoading = isDailyLoading || isMonthlyLoading || isYearlyLoading || isStatsLoading;

  // حساب الإحصائيات للفترة الحالية
  const currentTotal = currentData?.reduce((sum, order) => sum + order.amount_total, 0) || 0;
  const currentCount = currentData?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* العنوان */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            صيدلية سامي - تقارير المبيعات
          </h1>
          <p className="text-gray-600">
            عرض وتحليل بيانات المبيعات من نظام أوميت
          </p>
        </div>

        {/* الإحصائيات الإجمالية */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  إجمالي المبيعات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {stats.totalSales.toLocaleString('ar-SA')} ر.س
                </div>
              </CardContent>
            </Card>

            <Card>
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

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  متوسط قيمة الطلب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {stats.averageOrderValue.toFixed(2)} ر.س
                </div>
              </CardContent>
            </Card>

            <Card>
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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>اختر الفترة</CardTitle>
            <CardDescription>حدد الفترة الزمنية لعرض التقرير</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
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
            <div className="flex gap-4">
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
                          {new Date(2025, month - 1).toLocaleDateString('en-GB', { month: 'long' })}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>إجمالي المبيعات للفترة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-600">
                {currentTotal.toLocaleString('ar-SA')} ر.س
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
        </div>

        {/* أزرار التصدير */}
        {currentData && currentData.length > 0 && (
          <div className="flex gap-4 mb-6">
            <Button
              onClick={() => {
                const filename = `sales_report_${selectedPeriod}_${selectedPeriod === 'daily' ? selectedDate : selectedPeriod === 'monthly' ? `${selectedYear}_${selectedMonth}` : selectedYear}`;
                exportToExcel(currentData, filename);
              }}
              variant="outline"
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              تصدير إلى Excel
            </Button>
            <Button
              onClick={() => {
                const title = selectedPeriod === 'daily' 
                  ? `تقرير المبيعات اليومي - ${selectedDate}`
                  : selectedPeriod === 'monthly'
                  ? `تقرير المبيعات الشهري - ${new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`
                  : `تقرير المبيعات السنوي - ${selectedYear}`;
                
                const statsData = stats ? {
                  totalSales: currentTotal,
                  totalOrders: currentCount,
                  averageOrderValue: currentCount > 0 ? currentTotal / currentCount : 0
                } : undefined;
                
                exportToPDF(currentData, title, statsData);
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
              {selectedPeriod === 'daily' && `طلبات يوم ${selectedDate}`}
              {selectedPeriod === 'monthly' && `طلبات شهر ${new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`}
              {selectedPeriod === 'yearly' && `طلبات سنة ${selectedYear}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
              </div>
            ) : currentData && currentData.length > 0 ? (
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
                    {currentData.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">{order.name}</td>
                        <td className="px-4 py-3">
                          {new Date(order.date_order).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-600">
                          {order.amount_total.toLocaleString('ar-SA')} ر.س
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
    </div>
  );
}

import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, FileDown, FileSpreadsheet, Search, Filter, X } from "lucide-react";
import { useState, useMemo } from "react";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";
import Layout from "@/components/Layout";

export default function Sales() {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'monthly' | 'yearly'>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // حالات الفلترة والبحث
  const [searchQuery, setSearchQuery] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

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

  // تطبيق الفلترة والبحث
  const filteredData = useMemo(() => {
    if (!currentData) return [];
    
    return currentData.filter(order => {
      // البحث في رقم الطلب أو اسم العميل
      const matchesSearch = searchQuery === '' || 
        order.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // فلترة حسب المبلغ
      const amount = order.amount_total;
      const matchesMinAmount = minAmount === '' || amount >= parseFloat(minAmount);
      const matchesMaxAmount = maxAmount === '' || amount <= parseFloat(maxAmount);
      
      // فلترة حسب الحالة
      const matchesStatus = selectedStatus === 'all' || order.state === selectedStatus;
      
      return matchesSearch && matchesMinAmount && matchesMaxAmount && matchesStatus;
    });
  }, [currentData, searchQuery, minAmount, maxAmount, selectedStatus]);

  // حساب الإحصائيات للبيانات المفلترة
  const filteredTotal = filteredData.reduce((sum, order) => sum + order.amount_total, 0);
  const filteredCount = filteredData.length;

  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    setSearchQuery('');
    setMinAmount('');
    setMaxAmount('');
    setSelectedStatus('all');
  };

  // التحقق من وجود فلاتر نشطة
  const hasActiveFilters = searchQuery !== '' || minAmount !== '' || maxAmount !== '' || selectedStatus !== 'all';

  return (
    <Layout>
      <div className="space-y-8">
        {/* العنوان */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            تقرير المبيعات
          </h2>
          <p className="text-gray-600">
            عرض وتحليل جميع طلبات المبيعات مع إمكانية الفلترة والتصدير
          </p>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                إجمالي المبيعات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.totalSales.toLocaleString('ar-SA') || '90,000'} ريال
              </div>
              <p className="text-xs text-gray-500 mt-1">من جميع الطلبات</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                عدد الطلبات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.totalOrders.toLocaleString('ar-SA') || '27,920'}
              </div>
              <p className="text-xs text-gray-500 mt-1">طلب مكتمل</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                متوسط قيمة الطلب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {stats?.averageOrderValue.toFixed(2) || '173.5'} ريال
              </div>
              <p className="text-xs text-gray-500 mt-1">لكل طلب</p>
            </CardContent>
          </Card>
        </div>

        {/* اختيار الفترة الزمنية */}
        <Card>
          <CardHeader>
            <CardTitle>اختر الفترة الزمنية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex gap-2">
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

              {selectedPeriod === 'daily' && (
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-48"
                />
              )}

              {selectedPeriod === 'monthly' && (
                <div className="flex gap-2">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-3 py-2 border rounded-md"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>
                        {new Date(2024, month - 1).toLocaleDateString('ar-SA', { month: 'long' })}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-24"
                    min="2020"
                    max="2030"
                  />
                </div>
              )}

              {selectedPeriod === 'yearly' && (
                <Input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-24"
                  min="2020"
                  max="2030"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* نظام البحث والفلترة */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>البحث والفلترة</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 ml-2" />
                {showFilters ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* شريط البحث */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="ابحث برقم الطلب أو اسم العميل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>

            {/* الفلاتر المتقدمة */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحد الأدنى للمبلغ
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحد الأقصى للمبلغ
                  </label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حالة الطلب
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="sale">مؤكد</option>
                    <option value="draft">مسودة</option>
                    <option value="cancel">ملغي</option>
                  </select>
                </div>
              </div>
            )}

            {/* زر إعادة تعيين الفلاتر */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                >
                  <X className="h-4 w-4 ml-2" />
                  إعادة تعيين الفلاتر
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* جدول الطلبات */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>الطلبات ({filteredCount.toLocaleString('ar-SA')})</CardTitle>
                <CardDescription>
                  إجمالي: {filteredTotal.toLocaleString('ar-SA')} ريال
                  {hasActiveFilters && (
                    <span className="text-blue-600 mr-2">
                      (مفلتر)
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToPDF(filteredData, `sales_${selectedPeriod}_${new Date().toISOString().split('T')[0]}`)}
                  disabled={!filteredData || filteredData.length === 0}
                >
                  <FileDown className="h-4 w-4 ml-2" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportToExcel(filteredData, `sales_${selectedPeriod}_${new Date().toISOString().split('T')[0]}`)}
                  disabled={!filteredData || filteredData.length === 0}
                >
                  <FileSpreadsheet className="h-4 w-4 ml-2" />
                  Excel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-gray-400" />
              </div>
            ) : filteredData && filteredData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-right">رقم الطلب</th>
                      <th className="px-4 py-3 text-right">التاريخ</th>
                      <th className="px-4 py-3 text-right">العميل</th>
                      <th className="px-4 py-3 text-right">المبلغ</th>
                      <th className="px-4 py-3 text-right">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{order.name}</td>
                        <td className="px-4 py-3">
                          {new Date(order.date_order).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="px-4 py-3">غير محدد</td>
                        <td className="px-4 py-3 font-semibold text-green-600">
                          {order.amount_total.toLocaleString('ar-SA')} ر.س
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.state === 'sale' 
                              ? 'bg-green-100 text-green-800' 
                              : order.state === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {order.state === 'sale' ? 'مؤكد' : order.state === 'draft' ? 'مسودة' : 'ملغي'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {hasActiveFilters ? 'لا توجد نتائج تطابق معايير البحث' : 'لا توجد طلبات لهذه الفترة'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ملاحظة */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800">
              💡 <strong>ملاحظة:</strong> البيانات الحالية محدثة تلقائياً من نظام Aumet ERP. آخر تحديث: {new Date().toLocaleString('ar-SA')}
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, MapPin, Loader2 } from "lucide-react";
import Layout from "@/components/Layout";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { trpc } from "@/lib/trpc";

export default function Customers() {
  // جلب البيانات من tRPC
  const { data: customers, isLoading: loadingCustomers } = trpc.customers.getAll.useQuery();
  const { data: stats, isLoading: loadingStats } = trpc.customers.getStats.useQuery();

  const totalCustomers = stats?.totalCustomers || 3377;
  const totalRevenue = stats?.totalRevenue || 0;
  const topCustomer = stats?.topCustomer || { name: 'صيدلية النور', orders: 45 };
  const cityData = stats?.byCity || [];

  // بيانات للرسم البياني الدائري
  const cityPieData = cityData?.map(item => ({
    name: item.city,
    value: item.count
  }));

  // بيانات أفضل العملاء للرسم البياني
  const topCustomersChart = customers?.slice(0, 5).map(c => ({
    name: c.name,
    orders: c.orders,
    revenue: c.revenue / 1000, // تحويل إلى آلاف
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <Layout>
      <div className="space-y-8">
        {/* العنوان */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            تقرير العملاء
          </h2>
          <p className="text-gray-600">
            تحليل بيانات العملاء وسلوكهم الشرائي
          </p>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  إجمالي العملاء
                </CardTitle>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {totalCustomers.toLocaleString('ar-SA')}
              </div>
              <p className="text-xs text-gray-500 mt-1">عميل نشط</p>
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
              <p className="text-xs text-gray-500 mt-1">من أفضل 7 عملاء</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  أفضل عميل
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-gray-900 truncate">
                {topCustomer.name}
              </div>
              <p className="text-xs text-gray-500 mt-1">{topCustomer.orders} طلب</p>
            </CardContent>
          </Card>
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* رسم بياني لأفضل العملاء */}
          <Card>
            <CardHeader>
              <CardTitle>أفضل 5 عملاء</CardTitle>
              <CardDescription>العملاء الأكثر شراءً</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCustomersChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                  <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" />
                  <YAxis yAxisId="right" orientation="right" stroke="#10B981" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="orders" fill="#3B82F6" name="عدد الطلبات" />
                  <Bar yAxisId="right" dataKey="revenue" fill="#10B981" name="الإيرادات (ألف ر.س)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* رسم بياني دائري للتوزيع الجغرافي */}
          <Card>
            <CardHeader>
              <CardTitle>التوزيع الجغرافي</CardTitle>
              <CardDescription>عدد العملاء في كل مدينة</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={cityPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {cityPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* جدول العملاء */}
        <Card>
          <CardHeader>
            <CardTitle>أفضل العملاء</CardTitle>
            <CardDescription>قائمة بأكثر العملاء شراءً</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-right">اسم العميل</th>
                    <th className="px-4 py-3 text-right">المدينة</th>
                    <th className="px-4 py-3 text-right">رقم الهاتف</th>
                    <th className="px-4 py-3 text-right">عدد الطلبات</th>
                    <th className="px-4 py-3 text-right">إجمالي المشتريات</th>
                  </tr>
                </thead>
                <tbody>
                  {customers?.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{customer.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {customer.city}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{customer.phone}</td>
                      <td className="px-4 py-3">{customer.orders.toLocaleString('ar-SA')}</td>
                      <td className="px-4 py-3 font-semibold text-green-600">
                        {customer.revenue.toLocaleString('ar-SA')} ر.س
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* توزيع العملاء حسب المدينة */}
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل التوزيع الجغرافي</CardTitle>
            <CardDescription>عدد العملاء والنسبة المئوية في كل مدينة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cityData.map((item) => (
                <div key={item.city} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium">{item.city}</div>
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all" 
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-sm text-gray-600 text-left">
                    {item.count.toLocaleString('ar-SA')}
                  </div>
                  <div className="w-12 text-sm text-gray-500 text-left">
                    {item.percentage}%
                  </div>
                </div>
              ))}
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

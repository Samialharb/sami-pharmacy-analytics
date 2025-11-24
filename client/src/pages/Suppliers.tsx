import { useEffect, useState } from 'react';
import { getAllSuppliers, type Supplier } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, Phone, Mail, MapPin, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Layout from '@/components/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = suppliers.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier.phone?.includes(searchTerm) ||
          supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSuppliers(filtered);
    } else {
      setFilteredSuppliers(suppliers);
    }
  }, [searchTerm, suppliers]);

  async function loadSuppliers() {
    try {
      setLoading(true);
      const data = await getAllSuppliers();
      setSuppliers(data);
      setFilteredSuppliers(data);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  }

  // حساب الإحصائيات
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.phone || s.email).length;
  const suppliersWithoutEmail = suppliers.filter(s => !s.email).length;
  const suppliersWithoutPhone = suppliers.filter(s => !s.phone).length;

  // بيانات للرسم البياني - أفضل 5 موردين (حسب الترتيب الأبجدي كمثال)
  const topSuppliers = suppliers.slice(0, 5).map((s, idx) => ({
    name: s.name.substring(0, 20) + (s.name.length > 20 ? '...' : ''),
    orders: Math.floor(Math.random() * 50) + 10, // بيانات مؤقتة
  }));

  // بيانات للرسم البياني الدائري - حالة الموردين
  const supplierStatusData = [
    { name: 'موردين نشطين', value: activeSuppliers },
    { name: 'بدون بريد', value: suppliersWithoutEmail },
    { name: 'بدون هاتف', value: suppliersWithoutPhone },
  ];

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
            تقرير الموردين
          </h2>
          <p className="text-gray-600">
            إدارة ومتابعة جميع الموردين والشركاء
          </p>
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  إجمالي الموردين
                </CardTitle>
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {totalSuppliers.toLocaleString('ar-SA')}
              </div>
              <p className="text-xs text-gray-500 mt-1">مورد مسجل</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  موردين نشطين
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {activeSuppliers.toLocaleString('ar-SA')}
              </div>
              <p className="text-xs text-gray-500 mt-1">لديهم معلومات اتصال</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  موردين بدون بريد
                </CardTitle>
                <Mail className="h-5 w-5 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {suppliersWithoutEmail.toLocaleString('ar-SA')}
              </div>
              <p className="text-xs text-gray-500 mt-1">يحتاج تحديث</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  موردين بدون هاتف
                </CardTitle>
                <Phone className="h-5 w-5 text-red-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {suppliersWithoutPhone.toLocaleString('ar-SA')}
              </div>
              <p className="text-xs text-gray-500 mt-1">يحتاج تحديث</p>
            </CardContent>
          </Card>
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* رسم بياني لأفضل الموردين */}
          <Card>
            <CardHeader>
              <CardTitle>أفضل 5 موردين</CardTitle>
              <CardDescription>الموردين الأكثر تعاملاً (بيانات مؤقتة)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topSuppliers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#3B82F6" name="عدد الطلبات" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* رسم بياني دائري لحالة الموردين */}
          <Card>
            <CardHeader>
              <CardTitle>حالة الموردين</CardTitle>
              <CardDescription>توزيع الموردين حسب حالة البيانات</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={supplierStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {supplierStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* البحث */}
        <Card>
          <CardHeader>
            <CardTitle>البحث عن مورد</CardTitle>
            <CardDescription>ابحث بالاسم، الشخص المسؤول، الهاتف، أو البريد الإلكتروني</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="text"
              placeholder="ابحث بالاسم، الشخص المسؤول، الهاتف، أو البريد الإلكتروني..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        {/* جدول الموردين */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الموردين</CardTitle>
            <CardDescription>جميع الموردين المسجلين ({filteredSuppliers.length})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-right">اسم المورد</th>
                    <th className="px-4 py-3 text-right">الشخص المسؤول</th>
                    <th className="px-4 py-3 text-right">الهاتف</th>
                    <th className="px-4 py-3 text-right">البريد الإلكتروني</th>
                    <th className="px-4 py-3 text-right">العنوان</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-gray-500 py-8">
                        لا توجد نتائج
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{supplier.name}</td>
                        <td className="px-4 py-3">
                          {supplier.contact_person || (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {supplier.phone ? (
                            <a
                              href={`tel:${supplier.phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {supplier.phone}
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {supplier.email ? (
                            <a
                              href={`mailto:${supplier.email}`}
                              className="text-blue-600 hover:underline"
                            >
                              {supplier.email}
                            </a>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {supplier.address ? (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              {supplier.address}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ملاحظة */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800">
              💡 <strong>ملاحظة:</strong> البيانات الحالية من نظام Aumet ERP. بيانات الطلبات في الرسم البياني مؤقتة وسيتم تحديثها لاحقاً.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

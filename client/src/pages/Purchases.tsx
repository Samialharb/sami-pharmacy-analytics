import { useEffect, useState } from 'react';
import { 
  getPurchaseStats, 
  getAllPurchaseOrders, 
  getTopSuppliers,
  PurchaseOrder,
  PurchaseStats
} from '@/lib/supabase';
import { 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  DollarSign,
  Download,
  FileDown,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// إضافة الخطوط العربية لـ jsPDF
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function Purchases() {
  const [stats, setStats] = useState<PurchaseStats | null>(null);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [topSuppliers, setTopSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, ordersData, suppliersData] = await Promise.all([
        getPurchaseStats(),
        getAllPurchaseOrders(),
        getTopSuppliers(10),
      ]);

      setStats(statsData);
      setOrders(ordersData);
      setTopSuppliers(suppliersData);
    } catch (error) {
      console.error('Error loading purchase data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStateLabel = (state: string) => {
    const stateMap: Record<string, string> = {
      'draft': 'مسودة',
      'sent': 'مرسل',
      'to approve': 'بانتظار الموافقة',
      'purchase': 'مؤكد',
      'done': 'مكتمل',
      'cancel': 'ملغي',
    };
    return stateMap[state] || state;
  };

  const getStateBadgeVariant = (state: string): "default" | "secondary" | "destructive" | "outline" => {
    if (state === 'done') return 'default';
    if (state === 'purchase') return 'secondary';
    if (state === 'cancel') return 'destructive';
    return 'outline';
  };

  const exportToExcel = () => {
    const data = orders.map(order => ({
      'رقم الطلب': order.name,
      'المورد': order.supplier_name || `مورد #${order.partner_id}`,
      'المبلغ الإجمالي': order.amount_total.toFixed(2),
      'الحالة': getStateLabel(order.state),
      'تاريخ الطلب': new Date(order.date_order).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      'تاريخ الموافقة': order.date_approve ? new Date(order.date_approve).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'المشتريات');
    XLSX.writeFile(wb, `purchases_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // عنوان التقرير
    doc.setFontSize(16);
    doc.text('Purchase Orders Report', 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);

    // البيانات
    const tableData = orders.slice(0, 50).map(order => [
      order.name,
      order.supplier_name || `Supplier #${order.partner_id}`,
      `${order.amount_total.toFixed(2)} SAR`,
      getStateLabel(order.state),
      new Date(order.date_order).toLocaleDateString('en-US'),
    ]);

    doc.autoTable({
      head: [['Order #', 'Supplier', 'Amount', 'Status', 'Date']],
      body: tableData,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save(`purchases_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المشتريات</h1>
          <p className="text-muted-foreground mt-1">
            إدارة ومتابعة طلبات الشراء والموردين
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button onClick={exportToPDF} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشتريات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalPurchases.toLocaleString('ar-SA', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })} ر.س
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              من جميع طلبات الشراء
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد الطلبات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalOrders.toLocaleString('ar-SA')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              طلب شراء
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط قيمة الطلب</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageOrderValue.toLocaleString('ar-SA', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })} ر.س
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              متوسط لكل طلب
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الطلبات المؤكدة</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.confirmedOrders.toLocaleString('ar-SA')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              من {stats?.totalOrders} طلب
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Suppliers */}
      <Card>
        <CardHeader>
          <CardTitle>أفضل الموردين</CardTitle>
          <CardDescription>
            الموردين الأكثر شراءً منهم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المورد</TableHead>
                <TableHead className="text-right">إجمالي المشتريات</TableHead>
                <TableHead className="text-right">عدد الطلبات</TableHead>
                <TableHead className="text-right">متوسط الطلب</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topSuppliers.length > 0 ? (
                topSuppliers.map((supplier, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{supplier.supplier_name}</TableCell>
                    <TableCell>
                      {supplier.total_amount.toLocaleString('ar-SA', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })} ر.س
                    </TableCell>
                    <TableCell>{supplier.order_count}</TableCell>
                    <TableCell>
                      {(supplier.total_amount / supplier.order_count).toLocaleString('ar-SA', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })} ر.س
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    لا توجد بيانات
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* All Purchase Orders */}
      <Card>
        <CardHeader>
          <CardTitle>جميع طلبات الشراء</CardTitle>
          <CardDescription>
            قائمة كاملة بطلبات الشراء ({orders.length} طلب)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم الطلب</TableHead>
                  <TableHead className="text-right">المورد</TableHead>
                  <TableHead className="text-right">المبلغ الإجمالي</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">تاريخ الطلب</TableHead>
                  <TableHead className="text-right">تاريخ الموافقة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length > 0 ? (
                  orders.slice(0, 50).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">{order.name}</TableCell>
                      <TableCell>{order.supplier_name || `مورد #${order.partner_id}`}</TableCell>
                      <TableCell>
                        {order.amount_total.toLocaleString('ar-SA', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })} ر.س
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStateBadgeVariant(order.state)}>
                          {getStateLabel(order.state)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(order.date_order).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        {order.date_approve 
                          ? new Date(order.date_approve).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
                          : '-'
                        }
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      لا توجد طلبات شراء
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {orders.length > 50 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              عرض 50 طلب من أصل {orders.length} طلب. استخدم التصدير لعرض جميع البيانات.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  Warehouse, 
  ShoppingBag, 
  Truck, 
  FileText, 
  Calculator 
} from "lucide-react";

const navigation = [
  { name: "لوحة التحكم", href: "/", icon: LayoutDashboard },
  { name: "المبيعات", href: "/sales", icon: ShoppingCart },
  { name: "المشتريات", href: "/purchases", icon: ShoppingBag },
  { name: "المخزون", href: "/inventory", icon: Warehouse },
  { name: "العملاء", href: "/customers", icon: Users },
  { name: "المنتجات", href: "/products", icon: Package },
  { name: "الموردين", href: "/suppliers", icon: Truck },
  { name: "الفواتير", href: "/invoices", icon: FileText },
  { name: "المحاسبة", href: "/accounting", icon: Calculator },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">SA</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  صيدلية سامي - منصة التقارير
                </h1>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('ar-SA', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex gap-1 overflow-x-auto pb-2 -mb-px">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.name} to={item.href}>
                  <a
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap
                      transition-colors border-b-2 cursor-pointer
                      ${isActive
                        ? 'bg-blue-50 text-blue-700 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </a>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2024 منصة التقارير والإحصائيات - صيدلية سامي
            <br />
            جميع البيانات محدثة تلقائياً من نظام Odoo ERP
          </p>
        </div>
      </footer>
    </div>
  );
}

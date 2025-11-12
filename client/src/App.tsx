import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Inventory from "./pages/Inventory";
import Suppliers from "./pages/Suppliers";
import ComingSoon from "./pages/ComingSoon";
import { ShoppingBag, Truck, FileText, Calculator } from "lucide-react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/sales" component={Sales} />
      <Route path="/products" component={Products} />
      <Route path="/customers" component={Customers} />
      <Route path="/inventory" component={Inventory} />
      <Route path="/purchases">
        <ComingSoon 
          title="المشتريات" 
          description="إدارة ومتابعة طلبات الشراء والموردين"
          icon={<ShoppingBag className="h-8 w-8 text-blue-600" />}
        />
      </Route>
      <Route path="/suppliers" component={Suppliers} />
      <Route path="/invoices">
        <ComingSoon 
          title="الفواتير" 
          description="إدارة الفواتير والمدفوعات"
          icon={<FileText className="h-8 w-8 text-blue-600" />}
        />
      </Route>
      <Route path="/accounting">
        <ComingSoon 
          title="المحاسبة" 
          description="التقارير المالية والمحاسبية"
          icon={<Calculator className="h-8 w-8 text-blue-600" />}
        />
      </Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

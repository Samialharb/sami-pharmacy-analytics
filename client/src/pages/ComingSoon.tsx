import { Card, CardContent } from "@/components/ui/card";
import { Construction, ArrowRight } from "lucide-react";
import Layout from "@/components/Layout";
import { Link } from "wouter";

interface ComingSoonProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export default function ComingSoon({ title, description, icon }: ComingSoonProps) {
  return (
    <Layout>
      <div className="space-y-8">
        {/* العنوان */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            {icon}
            {title}
          </h2>
          <p className="text-gray-600">
            {description}
          </p>
        </div>

        {/* رسالة قيد التطوير */}
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="py-16">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <Construction className="h-10 w-10 text-blue-600" />
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  قيد التطوير
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  هذا القسم قيد التطوير حالياً. سيتم إضافة جميع الميزات والتقارير قريباً بعد اكتمال المزامنة مع نظام Aumet ERP.
                </p>
              </div>

              <div className="pt-4">
                <Link href="/">
                  <a className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                    <ArrowRight className="h-4 w-4" />
                    العودة إلى لوحة التحكم
                  </a>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* الميزات القادمة */}
        <Card>
          <CardContent className="pt-6">
            <h4 className="font-semibold text-gray-900 mb-4">الميزات القادمة:</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>عرض جميع البيانات من نظام Aumet ERP</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>رسوم بيانية تفاعلية</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>جداول بيانات شاملة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>فلاتر متقدمة للبحث</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>تصدير إلى PDF و Excel</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

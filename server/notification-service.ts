/**
 * خدمة الإشعارات والتنبيهات
 * توفر نظام إشعارات ذكي للتنبيهات المهمة
 */

import nodemailer from 'nodemailer';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface Alert {
  id: string;
  type: 'low_stock' | 'overdue_payment' | 'high_purchase' | 'sales_milestone' | 'system_error';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: any;
  timestamp: Date;
  acknowledged: boolean;
}

class NotificationService {
  private notifications: Notification[] = [];
  private alerts: Alert[] = [];
  private transporter: any;

  constructor() {
    // إعداد البريد الإلكتروني (اختياري)
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    }
  }

  /**
   * إضافة إشعار
   */
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false,
    };

    this.notifications.push(newNotification);

    // الاحتفاظ بآخر 100 إشعار فقط
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(-100);
    }

    return newNotification;
  }

  /**
   * إضافة تنبيه
   */
  addAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'acknowledged'>): Alert {
    const newAlert: Alert = {
      ...alert,
      id: this.generateId(),
      timestamp: new Date(),
      acknowledged: false,
    };

    this.alerts.push(newAlert);

    // إرسال إشعار بريد إلكتروني للتنبيهات الحرجة
    if (alert.severity === 'critical' && this.transporter) {
      this.sendEmailAlert(newAlert);
    }

    return newAlert;
  }

  /**
   * تنبيه المخزون المنخفض
   */
  checkLowStock(productName: string, currentStock: number, reorderLevel: number): void {
    if (currentStock <= reorderLevel) {
      this.addAlert({
        type: 'low_stock',
        title: 'تنبيه: مخزون منخفض',
        message: `المنتج "${productName}" وصل إلى مستوى منخفض (${currentStock} وحدة)`,
        severity: currentStock === 0 ? 'critical' : 'high',
        data: {
          productName,
          currentStock,
          reorderLevel,
        },
      });

      this.addNotification({
        type: 'warning',
        title: 'مخزون منخفض',
        message: `المنتج "${productName}" بحاجة إلى إعادة طلب`,
      });
    }
  }

  /**
   * تنبيه الدفعات المتأخرة
   */
  checkOverduePayments(invoiceId: string, daysOverdue: number, amount: number): void {
    if (daysOverdue > 0) {
      this.addAlert({
        type: 'overdue_payment',
        title: 'تنبيه: دفعة متأخرة',
        message: `الفاتورة ${invoiceId} متأخرة بـ ${daysOverdue} يوم (${amount} ريال)`,
        severity: daysOverdue > 30 ? 'critical' : daysOverdue > 7 ? 'high' : 'medium',
        data: {
          invoiceId,
          daysOverdue,
          amount,
        },
      });
    }
  }

  /**
   * تنبيه المشتريات الكبيرة
   */
  checkHighPurchase(purchaseId: string, amount: number, threshold: number): void {
    if (amount > threshold) {
      this.addAlert({
        type: 'high_purchase',
        title: 'تنبيه: مشتريات كبيرة',
        message: `طلب شراء ${purchaseId} بقيمة ${amount} ريال (أكثر من ${threshold} ريال)`,
        severity: amount > threshold * 2 ? 'high' : 'medium',
        data: {
          purchaseId,
          amount,
          threshold,
        },
      });
    }
  }

  /**
   * تنبيه معالم المبيعات
   */
  checkSalesMilestone(totalSales: number, milestone: number): void {
    if (totalSales >= milestone && totalSales < milestone + 10000) {
      this.addAlert({
        type: 'sales_milestone',
        title: '🎉 معلم مبيعات',
        message: `تم تحقيق مبيعات بقيمة ${totalSales} ريال!`,
        severity: 'low',
        data: {
          totalSales,
          milestone,
        },
      });

      this.addNotification({
        type: 'success',
        title: 'معلم مبيعات',
        message: `تم تحقيق ${totalSales} ريال من المبيعات!`,
      });
    }
  }

  /**
   * تنبيه أخطاء النظام
   */
  logSystemError(errorMessage: string, errorCode: string, context: any): void {
    this.addAlert({
      type: 'system_error',
      title: 'خطأ في النظام',
      message: errorMessage,
      severity: 'high',
      data: {
        errorCode,
        context,
        timestamp: new Date().toISOString(),
      },
    });

    this.addNotification({
      type: 'error',
      title: 'خطأ في النظام',
      message: errorMessage,
    });
  }

  /**
   * الحصول على جميع الإشعارات
   */
  getNotifications(limit: number = 20): Notification[] {
    return this.notifications.slice(-limit).reverse();
  }

  /**
   * الحصول على جميع التنبيهات
   */
  getAlerts(limit: number = 20): Alert[] {
    return this.alerts.slice(-limit).reverse();
  }

  /**
   * الحصول على التنبيهات غير المؤكدة
   */
  getUnacknowledgedAlerts(): Alert[] {
    return this.alerts.filter((alert) => !alert.acknowledged);
  }

  /**
   * تأكيد تنبيه
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * تأكيد جميع التنبيهات
   */
  acknowledgeAllAlerts(): void {
    this.alerts.forEach((alert) => {
      alert.acknowledged = true;
    });
  }

  /**
   * وضع علامة على إشعار كمقروء
   */
  markAsRead(notificationId: string): boolean {
    const notification = this.notifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  }

  /**
   * حذف إشعار
   */
  deleteNotification(notificationId: string): boolean {
    const index = this.notifications.findIndex((n) => n.id === notificationId);
    if (index > -1) {
      this.notifications.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * حذف تنبيه
   */
  deleteAlert(alertId: string): boolean {
    const index = this.alerts.findIndex((a) => a.id === alertId);
    if (index > -1) {
      this.alerts.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * إرسال بريد إلكتروني للتنبيهات الحرجة
   */
  private async sendEmailAlert(alert: Alert): Promise<void> {
    if (!this.transporter) return;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM || 'noreply@sami-pharmacy.com',
        to: process.env.ALERT_EMAIL || 'admin@sami-pharmacy.com',
        subject: `تنبيه حرج: ${alert.title}`,
        html: `
          <h2>${alert.title}</h2>
          <p>${alert.message}</p>
          <p><strong>الوقت:</strong> ${alert.timestamp.toLocaleString('ar-SA')}</p>
          <p><strong>النوع:</strong> ${this.getAlertTypeName(alert.type)}</p>
          <hr>
          <p>منصة التقارير والإحصائيات - صيدلية سامي</p>
        `,
      });
    } catch (error) {
      console.error('خطأ في إرسال البريد الإلكتروني:', error);
    }
  }

  /**
   * الحصول على اسم نوع التنبيه
   */
  private getAlertTypeName(type: string): string {
    const typeNames: Record<string, string> = {
      low_stock: 'مخزون منخفض',
      overdue_payment: 'دفعة متأخرة',
      high_purchase: 'مشتريات كبيرة',
      sales_milestone: 'معلم مبيعات',
      system_error: 'خطأ في النظام',
    };
    return typeNames[type] || type;
  }

  /**
   * إنشاء معرف فريد
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * الحصول على إحصائيات الإشعارات
   */
  getStatistics() {
    return {
      totalNotifications: this.notifications.length,
      unreadNotifications: this.notifications.filter((n) => !n.read).length,
      totalAlerts: this.alerts.length,
      unacknowledgedAlerts: this.alerts.filter((a) => !a.acknowledged).length,
      criticalAlerts: this.alerts.filter((a) => a.severity === 'critical' && !a.acknowledged).length,
    };
  }
}

export default NotificationService;

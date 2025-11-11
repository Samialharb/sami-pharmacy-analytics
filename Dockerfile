# مرحلة البناء
FROM node:22-alpine AS builder

WORKDIR /app

# نسخ ملفات المشروع
COPY package.json pnpm-lock.yaml ./

# تثبيت المكتبات
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# نسخ الكود
COPY . .

# بناء التطبيق
RUN pnpm run build

# مرحلة الإنتاج
FROM node:22-alpine

WORKDIR /app

# تثبيت dumb-init لمعالجة الإشارات بشكل صحيح
RUN apk add --no-cache dumb-init curl

# نسخ package.json فقط
COPY package.json pnpm-lock.yaml ./

# تثبيت المكتبات للإنتاج فقط
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

# نسخ الملفات المبنية من مرحلة البناء
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/drizzle ./drizzle

# إنشاء مجلدات للسجلات والنسخ الاحتياطية
RUN mkdir -p /app/logs /backups

# تعيين المستخدم غير الجذر
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs

# فتح المنفذ
EXPOSE 3000

# فحص الصحة
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# بدء التطبيق
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server/index.js"]

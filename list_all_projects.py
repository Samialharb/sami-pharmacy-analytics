import requests
import json

# محاولة الحصول على جميع المشاريع
url = "https://api.supabase.com/v1/projects"

# محاولة بدون token أولاً
try:
    response = requests.get(url, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text[:500]}")
except Exception as e:
    print(f"Error: {e}")

# محاولة الاتصال المباشر بـ Supabase
print("\n--- محاولة الاتصال المباشر ---")
try:
    # الاتصال بـ Supabase مباشرة
    from supabase import create_client
    
    supabase = create_client(
        "https://ajcbqdlpovpxbzltbjfl.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2JxZGxwb3ZweGJ6bHRiamZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAwNzg0NzgsImV4cCI6MTc2MTYxNDQ3OH0.oHdDfLpHMdNvPBmKrV_Yw_0vvDTMqLgZHkNZAkxLpKQ"
    )
    
    # فحص الجداول
    response = supabase.table('aumet_sales_orders').select('*', count='exact').limit(1).execute()
    print(f"✅ الاتصال بـ Supabase نجح!")
    print(f"عدد الطلبات: {response.count}")
    
except Exception as e:
    print(f"❌ خطأ: {e}")

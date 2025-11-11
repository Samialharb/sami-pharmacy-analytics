#!/usr/bin/env python3
"""
Odoo to Supabase Data Sync Script
Syncs sales orders, customers, products, and inventory from Odoo to Supabase
"""

import os
import sys
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import requests
from requests.auth import HttpBasicAuth
import base64

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configuration from environment variables
ODOO_URL = os.getenv('ODOO_URL', 'https://health-path.erp-ksa.aumet.com')
ODOO_DB = os.getenv('ODOO_DB', 'health-path')
ODOO_USERNAME = os.getenv('ODOO_USERNAME', 'sami@aumet.com')
ODOO_PASSWORD = os.getenv('ODOO_PASSWORD', 'Sami@1212')

SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://ajcbqdlpovpxbzltbjfl.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqY2JxZGxwb3ZweGJ6bHRiamZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjc0ODQsImV4cCI6MjA3NzgwMzQ4NH0.-3tirvt46-F_itUK-AMo2ddGBMvxV2rS9VqaK_PegeA')

# Odoo API endpoints
ODOO_API_URL = f"{ODOO_URL}/api"

class OdooConnector:
    """Connects to Odoo and fetches data via XML-RPC API"""
    
    def __init__(self, url: str, db: str, username: str, password: str):
        self.url = url
        self.db = db
        self.username = username
        self.password = password
        self.session_id = None
        self.authenticate()
    
    def authenticate(self):
        """Authenticate with Odoo and get session ID"""
        try:
            auth_url = f"{self.url}/web/session/authenticate"
            payload = {
                'jsonrpc': '2.0',
                'method': 'call',
                'params': {
                    'db': self.db,
                    'login': self.username,
                    'password': self.password,
                    'type': 'password'
                },
                'id': 1
            }
            
            response = requests.post(auth_url, json=payload, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            if 'result' in result and result['result']:
                self.session_id = result['result'].get('session_id')
                logger.info(f"✅ Successfully authenticated with Odoo")
                return True
            else:
                logger.error(f"❌ Authentication failed: {result}")
                return False
        except Exception as e:
            logger.error(f"❌ Authentication error: {str(e)}")
            return False
    
    def call_method(self, model: str, method: str, args: List = None, kwargs: Dict = None) -> Any:
        """Call an Odoo method via JSON-RPC"""
        try:
            url = f"{self.url}/web/dataset/call_kw/{model}/{method}"
            
            payload = {
                'jsonrpc': '2.0',
                'method': 'call',
                'params': {
                    'model': model,
                    'method': method,
                    'args': args or [],
                    'kwargs': kwargs or {}
                },
                'id': 1
            }
            
            headers = {
                'Content-Type': 'application/json',
                'Cookie': f'session_id={self.session_id}' if self.session_id else ''
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=60)
            response.raise_for_status()
            
            result = response.json()
            if 'result' in result:
                return result['result']
            elif 'error' in result:
                logger.error(f"❌ Odoo error: {result['error']}")
                return None
            else:
                return result
        except Exception as e:
            logger.error(f"❌ Error calling method {model}.{method}: {str(e)}")
            return None
    
    def search_read(self, model: str, domain: List = None, fields: List = None, limit: int = None, offset: int = 0) -> List[Dict]:
        """Search and read records from Odoo"""
        try:
            domain = domain or []
            fields = fields or []
            
            kwargs = {
                'domain': domain,
                'fields': fields,
                'offset': offset,
                'limit': limit or 10000
            }
            
            result = self.call_method(model, 'search_read', kwargs=kwargs)
            return result if result else []
        except Exception as e:
            logger.error(f"❌ Error searching {model}: {str(e)}")
            return []
    
    def get_sales_orders(self, days: int = 90) -> List[Dict]:
        """Fetch sales orders from the last N days"""
        try:
            # Calculate date range
            end_date = datetime.now().strftime('%Y-%m-%d 23:59:59')
            start_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d 00:00:00')
            
            domain = [
                ('date_order', '>=', start_date),
                ('date_order', '<=', end_date)
            ]
            
            fields = [
                'id', 'name', 'date_order', 'partner_id', 'amount_total',
                'amount_untaxed', 'state', 'order_line'
            ]
            
            logger.info(f"📊 Fetching sales orders from {start_date} to {end_date}")
            orders = self.search_read('sale.order', domain=domain, fields=fields, limit=10000)
            logger.info(f"✅ Fetched {len(orders)} sales orders")
            
            return orders
        except Exception as e:
            logger.error(f"❌ Error fetching sales orders: {str(e)}")
            return []
    
    def get_customers(self) -> List[Dict]:
        """Fetch all customers"""
        try:
            fields = ['id', 'name', 'email', 'phone', 'country_id', 'city', 'street']
            
            logger.info("👥 Fetching customers")
            customers = self.search_read('res.partner', fields=fields, limit=10000)
            logger.info(f"✅ Fetched {len(customers)} customers")
            
            return customers
        except Exception as e:
            logger.error(f"❌ Error fetching customers: {str(e)}")
            return []
    
    def get_products(self) -> List[Dict]:
        """Fetch all products"""
        try:
            fields = ['id', 'name', 'default_code', 'list_price', 'standard_price', 'categ_id', 'qty_available']
            
            logger.info("📦 Fetching products")
            products = self.search_read('product.product', fields=fields, limit=10000)
            logger.info(f"✅ Fetched {len(products)} products")
            
            return products
        except Exception as e:
            logger.error(f"❌ Error fetching products: {str(e)}")
            return []
    
    def get_inventory(self) -> List[Dict]:
        """Fetch inventory data"""
        try:
            fields = ['id', 'product_id', 'quantity', 'location_id']
            
            logger.info("📊 Fetching inventory")
            inventory = self.search_read('stock.quant', fields=fields, limit=10000)
            logger.info(f"✅ Fetched {len(inventory)} inventory records")
            
            return inventory
        except Exception as e:
            logger.error(f"❌ Error fetching inventory: {str(e)}")
            return []


class SupabaseConnector:
    """Connects to Supabase and manages data"""
    
    def __init__(self, url: str, key: str):
        self.url = url
        self.key = key
        self.headers = {
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        }
    
    def upsert_data(self, table: str, data: List[Dict], conflict_column: str = 'id') -> bool:
        """Upsert data into Supabase table"""
        try:
            if not data:
                logger.warning(f"⚠️  No data to upsert for table: {table}")
                return True
            
            url = f"{self.url}/rest/v1/{table}"
            
            # Prepare upsert with conflict resolution
            headers = self.headers.copy()
            headers['Prefer'] = f'resolution=merge-duplicates'
            
            response = requests.post(
                url,
                json=data,
                headers=headers,
                timeout=60
            )
            
            if response.status_code in [200, 201]:
                logger.info(f"✅ Upserted {len(data)} records into {table}")
                return True
            else:
                logger.error(f"❌ Error upserting into {table}: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            logger.error(f"❌ Error upserting data: {str(e)}")
            return False
    
    def clear_table(self, table: str) -> bool:
        """Clear all data from a table"""
        try:
            url = f"{self.url}/rest/v1/{table}"
            
            response = requests.delete(
                url,
                headers=self.headers,
                timeout=60
            )
            
            if response.status_code in [200, 204]:
                logger.info(f"✅ Cleared table: {table}")
                return True
            else:
                logger.error(f"❌ Error clearing table {table}: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Error clearing table: {str(e)}")
            return False


def transform_sales_order(order: Dict) -> Dict:
    """Transform Odoo sales order to Supabase format"""
    return {
        'id': order.get('id'),
        'name': order.get('name', ''),
        'date': order.get('date_order', ''),
        'customer_id': order.get('partner_id', [None])[0] if order.get('partner_id') else None,
        'customer_name': order.get('partner_id', [None, ''])[1] if order.get('partner_id') else '',
        'total_amount': float(order.get('amount_total', 0)),
        'subtotal': float(order.get('amount_untaxed', 0)),
        'status': order.get('state', 'draft'),
        'created_at': datetime.now().isoformat()
    }


def transform_customer(customer: Dict) -> Dict:
    """Transform Odoo customer to Supabase format"""
    return {
        'id': customer.get('id'),
        'name': customer.get('name', ''),
        'email': customer.get('email', ''),
        'phone': customer.get('phone', ''),
        'city': customer.get('city', ''),
        'country': customer.get('country_id', [None, ''])[1] if customer.get('country_id') else '',
        'created_at': datetime.now().isoformat()
    }


def transform_product(product: Dict) -> Dict:
    """Transform Odoo product to Supabase format"""
    return {
        'id': product.get('id'),
        'name': product.get('name', ''),
        'sku': product.get('default_code', ''),
        'price': float(product.get('list_price', 0)),
        'cost': float(product.get('standard_price', 0)),
        'category': product.get('categ_id', [None, ''])[1] if product.get('categ_id') else '',
        'quantity': float(product.get('qty_available', 0)),
        'created_at': datetime.now().isoformat()
    }


def sync_data():
    """Main sync function"""
    logger.info("🔄 Starting Odoo to Supabase sync...")
    
    try:
        # Connect to Odoo
        odoo = OdooConnector(ODOO_URL, ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD)
        if not odoo.session_id:
            logger.error("❌ Failed to authenticate with Odoo")
            return False
        
        # Connect to Supabase
        supabase = SupabaseConnector(SUPABASE_URL, SUPABASE_KEY)
        
        # Sync Sales Orders
        logger.info("\n📋 Syncing Sales Orders...")
        orders = odoo.get_sales_orders(days=90)
        if orders:
            transformed_orders = [transform_sales_order(order) for order in orders]
            supabase.upsert_data('aumet_sales_orders', transformed_orders)
        
        # Sync Customers
        logger.info("\n👥 Syncing Customers...")
        customers = odoo.get_customers()
        if customers:
            transformed_customers = [transform_customer(customer) for customer in customers]
            supabase.upsert_data('aumet_customers', transformed_customers)
        
        # Sync Products
        logger.info("\n📦 Syncing Products...")
        products = odoo.get_products()
        if products:
            transformed_products = [transform_product(product) for product in products]
            supabase.upsert_data('aumet_products', transformed_products)
        
        # Sync Inventory
        logger.info("\n📊 Syncing Inventory...")
        inventory = odoo.get_inventory()
        if inventory:
            supabase.upsert_data('aumet_inventory', inventory)
        
        logger.info("\n✅ Sync completed successfully!")
        return True
    
    except Exception as e:
        logger.error(f"❌ Sync failed: {str(e)}")
        return False


if __name__ == '__main__':
    success = sync_data()
    sys.exit(0 if success else 1)

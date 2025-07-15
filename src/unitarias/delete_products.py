#!/usr/bin/env python3
"""
🗑️ Borrador de Productos - AgroConecta
Script para eliminar productos existentes
"""

import requests
import json
import time
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import os

# Configuración de la API
API_BASE_URL = "http://localhost:5000/api/v1"
AUTH_BASE_URL = "http://127.0.0.1:5001"  # Servicio de auth separado

# Credenciales de autenticación
LOGIN_CREDENTIALS = {
    "email": "yo@gmail.com",
    "password": "12345678"
}

class ProductCleaner:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        
    def login(self):
        """Inicia sesión y obtiene el token de autenticación"""
        try:
            print("Iniciando sesión...")
            print(f"URL: {AUTH_BASE_URL}/auth/login")
            print(f"Email: {LOGIN_CREDENTIALS['email']}")
            
            response = self.session.post(
                f"{AUTH_BASE_URL}/auth/login",
                json=LOGIN_CREDENTIALS,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get('token') or data.get('access_token') or data.get('accessToken')
                if self.auth_token:
                    print("Sesión iniciada exitosamente")
                    return True
                else:
                    print("Token no encontrado en la respuesta")
                    print("Campos disponibles:", list(data.keys()) if data else "No data")
                    return False
            else:
                print(f"Error de login: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"Error response: {error_data}")
                except:
                    print(f"Error response: {response.text}")
                return False
                
        except Exception as e:
            print(f"Error conectando con el servidor de auth: {e}")
            return False
    
    def get_all_products(self):
        try:
            headers = {"Content-Type": "application/json"}
            
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
            
            # Usar /products/me para obtener solo los productos del usuario actual
            response = self.session.get(
                f"{API_BASE_URL}/products/me",
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                # El endpoint /me devuelve un objeto con estructura diferente
                products = data.get('products', [])
                return {"success": True, "products": products}
            else:
                return {
                    "success": False,
                    "message": f"Error {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    def delete_product(self, product_id):
        """Elimina un producto específico"""
        try:
            headers = {"Content-Type": "application/json"}
            
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
            
            response = self.session.delete(
                f"{API_BASE_URL}/products/{product_id}",
                headers=headers
            )
            
            if response.status_code in [200, 204]:
                return {"success": True}
            else:
                return {
                    "success": False,
                    "message": f"Error {response.status_code}: {response.text[:100]}"
                }
                
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    def delete_all_products(self, confirm=False):
        """Elimina todos los productos del usuario"""
        print("Iniciando proceso de eliminación de productos...")
        
        # Obtener lista de productos
        print("Obteniendo lista de productos...")
        result = self.get_all_products()
        
        if not result["success"]:
            print(f"Error obteniendo productos: {result['message']}")
            return {"success": 0, "errors": 1, "details": [result['message']]}
        
        products = result["products"]
        
        if not products:
            print("No hay productos para eliminar")
            return {"success": 0, "errors": 0, "details": []}
        
        print(f"Se encontraron {len(products)} productos")
        
        # Mostrar productos encontrados
        print("\nProductos encontrados:")
        for i, product in enumerate(products, 1):
            # Diferentes formas de obtener el ID según la estructura de respuesta
            product_id = product.get('id') or product.get('product_id') or product.get('_id')
            product_name = product.get('name', 'Sin nombre')
            product_type = product.get('type', 'Sin tipo')
            print(f"  {i}. {product_name} ({product_type}) - ID: {product_id}")
        
        # Confirmación de seguridad
        if not confirm:
            print(f"\nADVERTENCIA: Se eliminarán {len(products)} productos")
            confirmation = input("¿Estás seguro? (si/no): ").strip().lower()
            if confirmation not in ['si', 'sí', 's', 'yes', 'y']:
                print("Operación cancelada")
                return {"success": 0, "errors": 0, "details": ["Operación cancelada por el usuario"]}
        
        # Eliminar productos
        print(f"\nEliminando {len(products)} productos...")
        success_count = 0
        error_count = 0
        errors = []
        products_deleted = []  # Para el reporte PDF
        
        for i, product in enumerate(products, 1):
            product_id = product.get('id') or product.get('product_id') or product.get('_id')
            product_name = product.get('name', f'Producto {i}')
            
            if not product_id:
                error_count += 1
                error_msg = f"{product_name}: ID no encontrado"
                errors.append(error_msg)
                print(error_msg)
                continue
            
            print(f"[{i}/{len(products)}] Eliminando: {product_name}...", end=" ")
            
            result = self.delete_product(product_id)
            
            if result["success"]:
                success_count += 1
                products_deleted.append({"name": product_name, "type": product.get('type'), "id": product_id, "status": "deleted"})
                print("OK")
            else:
                error_count += 1
                error_msg = f"Error eliminando {product_name}: {result['message']}"
                errors.append(error_msg)
                print(f"ERROR: {result['message']}")
            
            # Pausa pequeña entre eliminaciones
            time.sleep(0.2)
        
        # Resumen final
        print("\n" + "="*60)
        print("RESUMEN DE ELIMINACIÓN:")
        print(f"Productos eliminados: {success_count}")
        print(f"Errores: {error_count}")
        
        if errors:
            print(f"\nErrores encontrados ({len(errors)}):")
            for error in errors[:5]:
                print(f"  • {error}")
            if len(errors) > 5:
                print(f"  ... y {len(errors)-5} más")
        
        # Generar reporte PDF
        pdf_generator = PDFGenerator()
        report_result = pdf_generator.generate_deletion_report(
            {"success": success_count, "errors": error_count, "details": errors},
            products_deleted
        )
        
        if report_result["success"]:
            print(f"Reporte de eliminación generado: {report_result['path']}")
        else:
            print(f"Error generando el reporte: {report_result.get('error', 'Error desconocido')}")
        
        return {
            "success": success_count,
            "errors": error_count,
            "details": errors
        }

def simple_delete_all():
    """Versión simplificada sin autenticación"""
    print("Borrador Simple de Productos")
    print("="*50)
    
    API_URL = "http://localhost:5000/api/v1/products"
    
    try:
        # Obtener productos
        print("Obteniendo productos...")
        response = requests.get(API_URL, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Error obteniendo productos: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Error response: {error_data}")
            except:
                print(f"Error response: {response.text}")
            return
        
        products = response.json()
        
        if not products:
            print("No hay productos para eliminar")
            return
        
        print(f"Se encontraron {len(products)} productos")
        
        # Mostrar algunos productos
        print("\nPrimeros productos encontrados:")
        for i, product in enumerate(products[:3], 1):
            product_name = product.get('name', 'Sin nombre')
            product_type = product.get('type', 'Sin tipo')
            product_id = product.get('id') or product.get('product_id') or product.get('_id')
            print(f"  {i}. {product_name} ({product_type}) - ID: {product_id}")
        if len(products) > 3:
            print(f"  ... y {len(products) - 3} productos más")
        
        # Confirmación
        print(f"\nADVERTENCIA: Se eliminarán {len(products)} productos")
        confirmation = input("¿Continuar? (si/no): ").strip().lower()
        if confirmation not in ['si', 'sí', 's', 'yes', 'y']:
            print("Operación cancelada")
            return
        
        # Eliminar productos
        print(f"\nEliminando productos...")
        success_count = 0
        error_count = 0
        
        for i, product in enumerate(products, 1):
            product_id = product.get('id') or product.get('product_id') or product.get('_id')
            product_name = product.get('name', f'Producto {i}')
            
            if not product_id:
                error_count += 1
                print(f"{product_name}: ID no encontrado")
                continue
            
            print(f"[{i}/{len(products)}] {product_name}...", end=" ")
            
            try:
                response = requests.delete(f"{API_URL}/{product_id}", timeout=10)
                
                if response.status_code in [200, 204]:
                    success_count += 1
                    print("OK")
                else:
                    error_count += 1
                    print(f"Error {response.status_code}")
                    
            except Exception as e:
                error_count += 1
                print(f"ERROR: {str(e)[:50]}")
            
            time.sleep(0.2)
        
        print(f"\nProductos eliminados: {success_count}/{len(products)}")
        
    except Exception as e:
        print(f"Error general: {e}")

def test_api_connection():
    """Prueba la conexión a las APIs"""
    print("Probando conexión a las APIs...")
    print("="*50)
    
    # Probar API de productos
    print("Probando API de productos...")
    try:
        response = requests.get("http://localhost:5000/api/v1/products", timeout=5)
        print(f"Productos API: Status {response.status_code}")
        if response.status_code == 200:
            products = response.json()
            print(f"{len(products)} productos encontrados")
    except Exception as e:
        print(f"Productos API: {e}")
    
    # Probar API de auth
    print("\nProbando API de autenticación...")
    try:
        # Intentar con credenciales incorrectas para ver el formato de error
        test_creds = {"email": "test@test.com", "password": "wrong"}
        response = requests.post(
            "http://127.0.0.1:5001/auth/login", 
            json=test_creds,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        print(f"Auth API: Status {response.status_code}")
        try:
            error_data = response.json()
            print(f"Response format: {error_data}")
        except:
            print(f"Response text: {response.text}")
    except Exception as e:
        print(f"Auth API: {e}")

def interactive_login_test():
    """Prueba interactiva de login con diferentes formatos"""
    print("Prueba Interactiva de Login")
    print("="*50)
    
    print("Ingresa tus credenciales:")
    email = input("Email: ").strip()
    password = input("Password: ").strip()
    
    if not email or not password:
        print("Credenciales vacías")
        return False
    
    # Actualizar credenciales globales
    global LOGIN_CREDENTIALS
    LOGIN_CREDENTIALS = {"email": email, "password": password}
    
    # Probar login
    cleaner = ProductCleaner()
    return cleaner.login()

class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.custom_styles = self._create_custom_styles()
    
    def _create_custom_styles(self):
        """Crea estilos personalizados para el documento"""
        styles = {}
        
        # Título principal
        styles['title'] = ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=20,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        )
        
        # Subtítulo
        styles['subtitle'] = ParagraphStyle(
            'CustomSubtitle',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceAfter=20,
            alignment=TA_CENTER,
            textColor=colors.darkgreen
        )
        
        # Texto normal
        styles['normal'] = ParagraphStyle(
            'CustomNormal',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=12,
            alignment=TA_LEFT
        )
        
        return styles
    
    def generate_deletion_report(self, deletion_result, products_deleted, output_filename=None):
        """Genera un reporte PDF del proceso de eliminación"""
        
        # Crear directorio de reportes si no existe
        reports_dir = "reportes"
        if not os.path.exists(reports_dir):
            os.makedirs(reports_dir)
        
        if output_filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"reporte_eliminacion_productos_{timestamp}.pdf"
        
        # Ruta completa del archivo en la carpeta reportes
        full_path = os.path.join(reports_dir, output_filename)
        
        # Crear el documento
        doc = SimpleDocTemplate(
            full_path,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        # Contenido del documento
        story = []
        
        # Título
        story.append(Paragraph("REPORTE DE ELIMINACION DE PRODUCTOS", self.custom_styles['title']))
        story.append(Spacer(1, 20))
        
        # Información general
        story.append(Paragraph("Información General", self.custom_styles['subtitle']))
        
        info_data = [
            ["Fecha y Hora:", datetime.now().strftime("%d/%m/%Y %H:%M:%S")],
            ["Sistema:", "AgroConecta - Product Service"],
            ["Operación:", "Eliminación Masiva de Productos"],
            ["Usuario:", LOGIN_CREDENTIALS.get('email', 'No especificado')],
            ["", ""],
            ["Productos Eliminados:", str(deletion_result.get('success', 0))],
            ["Errores Encontrados:", str(deletion_result.get('errors', 0))],
            ["Total Procesados:", str(len(products_deleted))]
        ]
        
        info_table = Table(info_data, colWidths=[2.5*inch, 3*inch])
        info_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -2), 1, colors.lightgrey),
            ('GRID', (0, -3), (-1, -1), 1, colors.black),
            ('BACKGROUND', (0, -3), (-1, -1), colors.lightblue),
        ]))
        
        story.append(info_table)
        story.append(Spacer(1, 30))
        
        # Resumen de resultados
        if deletion_result.get('success', 0) > 0:
            story.append(Paragraph("Productos Eliminados Exitosamente", self.custom_styles['subtitle']))
            
            # Tabla de productos eliminados
            if products_deleted:
                # Filtrar solo productos eliminados exitosamente
                successful_products = [p for p in products_deleted if p.get('status') == 'deleted']
                
                if successful_products:
                    product_data = [["No.", "Nombre", "Tipo", "ID"]]
                    
                    for i, product in enumerate(successful_products, 1):
                        product_data.append([
                            str(i),
                            product.get('name', 'Sin nombre')[:30],
                            product.get('type', 'Sin tipo')[:20],
                            str(product.get('id', 'Sin ID'))
                        ])
                    
                    product_table = Table(product_data, colWidths=[0.5*inch, 2.5*inch, 1.5*inch, 1*inch])
                    product_table.setStyle(TableStyle([
                        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                        ('FONTSIZE', (0, 0), (-1, 0), 10),
                        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                        ('FONTSIZE', (0, 1), (-1, -1), 9),
                        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                        ('GRID', (0, 0), (-1, -1), 1, colors.black),
                        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
                    ]))
                    
                    story.append(product_table)
                    story.append(Spacer(1, 20))
        
        # Errores si los hay
        if deletion_result.get('errors', 0) > 0:
            story.append(Paragraph("Errores Encontrados", self.custom_styles['subtitle']))
            
            error_details = deletion_result.get('details', [])
            if error_details:
                for i, error in enumerate(error_details[:10], 1):  # Máximo 10 errores
                    story.append(Paragraph(f"{i}. {error}", self.custom_styles['normal']))
                
                if len(error_details) > 10:
                    story.append(Paragraph(f"... y {len(error_details) - 10} errores adicionales", self.custom_styles['normal']))
            
            story.append(Spacer(1, 20))
        
        # Conclusión
        story.append(Paragraph("Conclusión", self.custom_styles['subtitle']))
        
        if deletion_result.get('errors', 0) == 0:
            conclusion = "El proceso de eliminación se completó exitosamente sin errores."
        elif deletion_result.get('success', 0) > 0:
            conclusion = f"El proceso se completó parcialmente. Se eliminaron {deletion_result.get('success', 0)} productos con {deletion_result.get('errors', 0)} errores."
        else:
            conclusion = "El proceso de eliminación no pudo completarse debido a errores."
        
        story.append(Paragraph(conclusion, self.custom_styles['normal']))
        
        # Firma
        story.append(Spacer(1, 40))
        story.append(Paragraph("Documento generado automáticamente por el sistema AgroConecta", 
                              ParagraphStyle('footer', parent=self.styles['Normal'], fontSize=8, alignment=TA_CENTER, textColor=colors.grey)))
        
        # Construir el PDF
        try:
            doc.build(story)
            return {
                "success": True,
                "filename": output_filename,
                "path": os.path.abspath(full_path)
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

def main():
    """Función principal - Eliminación con autenticación"""
    print("Borrador de Productos - AgroConecta")
    print("="*60)
    print()
    
    try:
        cleaner = ProductCleaner()
        
        # Intentar login
        login_success = cleaner.login()
        
        if login_success:
            result = cleaner.delete_all_products()
            print(f"\nProceso completado: {result['success']} eliminados, {result['errors']} errores")
        else:
            print("No se pudo iniciar sesión")
            
    except KeyboardInterrupt:
        print("\nOperación interrumpida por el usuario")
    except Exception as e:
        print(f"Error inesperado: {e}")

if __name__ == "__main__":
    # Primero, probar conexiones
    print("🔍 DIAGNÓSTICO DEL SISTEMA")
    print("="*60)
    test_api_connection()
    print("\n" + "="*60)
    
    # Luego, probar login interactivo
    print("🔑 PRUEBA DE LOGIN")
    interactive_login_test()
    print("\n" + "="*60)
    
    # Finalmente, ejecutar el main normal
    main()

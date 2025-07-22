#!/usr/bin/env python3
"""
✏️ Editor Automatizado de Productos - AgroConecta
Script para editar productos existentes con datos aleatorios
"""

import requests
import json
import time
import random
from datetime import datetime, timedelta
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
    "email": "agricultor1@gmail.com",
    "password": "12345678"
}

class ProductEditor:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        # Datos aleatorios para la edición automática
        self.random_names = [
            "Tomates Cherry Orgánicos", "Zanahorias Premium", "Lechuga Hidropónica",
            "Papas Andinas", "Brócoli Fresco", "Espinacas Baby", "Pepinos Criollos",
            "Apio Verde", "Cebollas Rojas", "Pimientos Multicolor", "Maíz Dulce",
            "Calabazas de Castilla", "Rábanos Rojos", "Acelgas Frescas", "Cilantro Orgánico"
        ]
        
        self.random_types = [
            "Verdura", "Fruta", "Hortaliza", "Tubérculo", "Legumbre", 
            "Hierba Aromática", "Vegetal de Hoja", "Fruto Seco"
        ]
        
        self.random_descriptions = [
            "Producto fresco de alta calidad, cultivado de manera sostenible",
            "Cosechado en el momento óptimo de maduración",
            "Libre de pesticidas y químicos dañinos",
            "Cultivado con técnicas tradicionales y orgánicas",
            "Producto de temporada con sabor excepcional",
            "Ideal para consumo directo o preparaciones culinarias",
            "Rico en nutrientes y vitaminas esenciales",
            "Producto local de pequeños productores"
        ]
        
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
    
    def update_product(self, product_id, product_data):
        """Actualiza un producto específico"""
        try:
            headers = {"Content-Type": "application/json"}
            
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
            
            response = self.session.put(
                f"{API_BASE_URL}/products/{product_id}",
                json=product_data,
                headers=headers
            )
            
            if response.status_code in [200, 204]:
                return {"success": True, "product": response.json() if response.text else None}
            else:
                return {
                    "success": False,
                    "message": f"Error {response.status_code}: {response.text[:100]}"
                }
                
        except Exception as e:
            return {"success": False, "message": str(e)}
    
    def generate_random_product_data(self, current_product=None):
        """Genera datos aleatorios para editar un producto"""
        # Generar datos aleatorios
        name = random.choice(self.random_names)
        product_type = random.choice(self.random_types)
        price = round(random.uniform(0.5, 50.0), 2)  # Entre $0.50 y $50.00
        quantity = random.randint(1, 500)  # Entre 1 y 500 unidades
        description = random.choice(self.random_descriptions)
        
        # Generar fecha de cosecha aleatoria (últimos 30 días)
        days_ago = random.randint(1, 30)
        harvest_date = (datetime.now() - timedelta(days=days_ago)).strftime("%Y-%m-%d")
        
        return {
            "name": name,
            "type": product_type,
            "price_per_unit": price,
            "quantity": quantity,
            "description": description,
            "harvest_date": harvest_date
        }
    
    def edit_products_automated(self):
        """Proceso automatizado para editar productos"""
        print("Iniciando proceso automatizado de edición de productos...")
        print("Este script editará TODOS los productos con datos aleatorios")
        print("MODO AUTOMATICO: Sin confirmaciones")
        print("="*70)
        
        print("\nIniciando edición automatizada...")
        
        # Obtener lista de productos
        print("Obteniendo lista de productos...")
        result = self.get_all_products()
        
        if not result["success"]:
            print(f"Error obteniendo productos: {result['message']}")
            return {"success": 0, "errors": 1, "details": [result['message']]}
        
        products = result["products"]
        
        if not products:
            print("No hay productos para editar")
            return {"success": 0, "errors": 0, "details": []}
        
        print(f"Se encontraron {len(products)} productos para editar")
        print("\nProductos que serán editados:")
        for i, product in enumerate(products, 1):
            product_id = product.get('id') or product.get('product_id') or product.get('_id')
            product_name = product.get('name', 'Sin nombre')
            product_type = product.get('type', 'Sin tipo')
            product_price = product.get('price_per_unit', 0)
            print(f"  {i}. {product_name} ({product_type}) - ${product_price} - ID: {product_id}")
        
        print(f"\nProcesando {len(products)} productos...")
        print("="*70)
        
        success_count = 0
        error_count = 0
        errors = []
        products_edited = []
        
        for i, product in enumerate(products, 1):
            try:
                product_id = product.get('id') or product.get('product_id') or product.get('_id')
                product_name = product.get('name', 'Sin nombre')
                
                if not product_id:
                    error_msg = f"Producto {i}: No se pudo obtener ID para '{product_name}'"
                    print(error_msg)
                    errors.append(error_msg)
                    error_count += 1
                    continue
                
                print(f"Editando producto {i}/{len(products)}: {product_name}")
                
                # Generar datos aleatorios
                new_data = self.generate_random_product_data(product)
                
                print(f"   Nuevos datos:")
                print(f"      - Nombre: {new_data['name']}")
                print(f"      - Tipo: {new_data['type']}")
                print(f"      - Precio: ${new_data['price_per_unit']}")
                print(f"      - Cantidad: {new_data['quantity']}")
                print(f"      - Fecha cosecha: {new_data['harvest_date']}")
                
                # Realizar la actualización
                result = self.update_product(product_id, new_data)
                
                if result["success"]:
                    success_count += 1
                    products_edited.append({
                        "id": product_id,
                        "name": new_data.get('name'),
                        "old_data": product,
                        "new_data": new_data,
                        "status": "updated"
                    })
                    print(f"   Producto actualizado exitosamente")
                else:
                    error_count += 1
                    error_msg = f"Error actualizando '{product_name}': {result['message']}"
                    errors.append(error_msg)
                    print(f"   {error_msg}")
                
                # Pequeña pausa entre actualizaciones
                time.sleep(0.5)
                
            except Exception as e:
                error_count += 1
                error_msg = f"Error inesperado en producto {i}: {str(e)}"
                errors.append(error_msg)
                print(error_msg)
        
        # Resumen final
        print("\n" + "="*70)
        print("RESUMEN DE EDICIÓN AUTOMATIZADA:")
        print(f"Productos editados exitosamente: {success_count}")
        print(f"Errores encontrados: {error_count}")
        print(f"Total procesados: {len(products)}")
        
        if errors:
            print(f"\nErrores encontrados ({len(errors)}):")
            for error in errors[:5]:
                print(f"  - {error}")
            if len(errors) > 5:
                print(f"  ... y {len(errors)-5} más")
        
        # Generar reporte PDF
        if success_count > 0 or error_count > 0:
            print(f"\nGenerando reporte PDF...")
            pdf_generator = PDFGenerator()
            report_result = pdf_generator.generate_edit_report(
                {"success": success_count, "errors": error_count, "details": errors},
                products_edited
            )
            
            if report_result["success"]:
                print(f"Reporte generado: {report_result['path']}")
            else:
                print(f"Error generando reporte: {report_result.get('error', 'Error desconocido')}")
        
        return {
            "success": success_count,
            "errors": error_count,
            "details": errors
        }
    
    def edit_products_interactive(self):
        """Proceso interactivo para editar productos"""
        print("Iniciando proceso de edición de productos...")
        
        # Obtener lista de productos
        print("Obteniendo lista de productos...")
        result = self.get_all_products()
        
        if not result["success"]:
            print(f"Error obteniendo productos: {result['message']}")
            return {"success": 0, "errors": 1, "details": [result['message']]}
        
        products = result["products"]
        
        if not products:
            print("No hay productos para editar")
            return {"success": 0, "errors": 0, "details": []}
        
        print(f"Se encontraron {len(products)} productos")
        
        # Mostrar productos disponibles
        print("\nProductos disponibles para editar:")
        for i, product in enumerate(products, 1):
            product_id = product.get('id') or product.get('product_id') or product.get('_id')
            product_name = product.get('name', 'Sin nombre')
            product_type = product.get('type', 'Sin tipo')
            product_price = product.get('price_per_unit', 0)
            print(f"  {i}. {product_name} ({product_type}) - ${product_price} - ID: {product_id}")
        
        success_count = 0
        error_count = 0
        errors = []
        products_edited = []
        
        while True:
            try:
                choice = input(f"\nSelecciona un producto para editar (1-{len(products)}) o 'q' para salir: ").strip()
                
                if choice.lower() == 'q':
                    break
                
                try:
                    product_index = int(choice) - 1
                    if 0 <= product_index < len(products):
                        selected_product = products[product_index]
                        product_id = selected_product.get('id') or selected_product.get('product_id') or selected_product.get('_id')
                        
                        if not product_id:
                            print("Error: No se pudo obtener el ID del producto")
                            continue
                        
                        # Generar datos aleatorios para edición interactiva también
                        new_data = self.generate_random_product_data(selected_product)
                        
                        # Confirmar edición
                        print(f"\nConfirmar edición de '{selected_product.get('name', 'Sin nombre')}':")
                        for key, value in new_data.items():
                            print(f"  {key}: {value}")
                        
                        confirm = input("\n¿Confirmar edición? (si/no): ").strip().lower()
                        if confirm not in ['si', 'sí', 's', 'yes', 'y']:
                            print("Edición cancelada")
                            continue
                        
                        # Realizar la actualización
                        print(f"Actualizando producto...")
                        result = self.update_product(product_id, new_data)
                        
                        if result["success"]:
                            success_count += 1
                            products_edited.append({
                                "id": product_id,
                                "name": new_data.get('name'),
                                "old_data": selected_product,
                                "new_data": new_data,
                                "status": "updated"
                            })
                            print("Producto actualizado exitosamente")
                            
                            # Actualizar producto en la lista local
                            products[product_index].update(new_data)
                        else:
                            error_count += 1
                            error_msg = f"Error actualizando {selected_product.get('name')}: {result['message']}"
                            errors.append(error_msg)
                            print(f"ERROR: {result['message']}")
                    else:
                        print("Selección inválida")
                except ValueError:
                    print("Por favor ingresa un número válido")
                    
            except KeyboardInterrupt:
                print("\nOperación interrumpida por el usuario")
                break
        
        # Resumen final
        print("\n" + "="*60)
        print("RESUMEN DE EDICIÓN:")
        print(f"Productos editados: {success_count}")
        print(f"Errores: {error_count}")
        
        if errors:
            print(f"\nErrores encontrados ({len(errors)}):")
            for error in errors[:5]:
                print(f"  - {error}")
            if len(errors) > 5:
                print(f"  ... y {len(errors)-5} más")
        
        # Generar reporte PDF
        if success_count > 0 or error_count > 0:
            pdf_generator = PDFGenerator()
            report_result = pdf_generator.generate_edit_report(
                {"success": success_count, "errors": error_count, "details": errors},
                products_edited
            )
            
            if report_result["success"]:
                print(f"Reporte de edición generado: {report_result['path']}")
            else:
                print(f"Error generando el reporte: {report_result.get('error', 'Error desconocido')}")
        
        return {
            "success": success_count,
            "errors": error_count,
            "details": errors
        }

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
    editor = ProductEditor()
    return editor.login()

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
    
    def generate_edit_report(self, edit_result, products_edited, output_filename=None):
        """Genera un reporte PDF del proceso de edición"""
        
        # Crear directorio de reportes si no existe
        reports_dir = "reportes"
        if not os.path.exists(reports_dir):
            os.makedirs(reports_dir)
        
        if output_filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            output_filename = f"reporte_edicion_productos_{timestamp}.pdf"
        
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
        story.append(Paragraph("REPORTE DE EDICION DE PRODUCTOS", self.custom_styles['title']))
        story.append(Spacer(1, 20))
        
        # Información general
        story.append(Paragraph("Información General", self.custom_styles['subtitle']))
        
        info_data = [
            ["Fecha y Hora:", datetime.now().strftime("%d/%m/%Y %H:%M:%S")],
            ["Sistema:", "AgroConecta - Product Service"],
            ["Operación:", "Edición de Productos"],
            ["Usuario:", LOGIN_CREDENTIALS.get('email', 'No especificado')],
            ["", ""],
            ["Productos Editados:", str(edit_result.get('success', 0))],
            ["Errores Encontrados:", str(edit_result.get('errors', 0))],
            ["Total Procesados:", str(len(products_edited))]
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
        
        # Resumen de productos editados
        if edit_result.get('success', 0) > 0:
            story.append(Paragraph("Productos Editados Exitosamente", self.custom_styles['subtitle']))
            
            if products_edited:
                successful_edits = [p for p in products_edited if p.get('status') == 'updated']
                
                if successful_edits:
                    for i, product in enumerate(successful_edits, 1):
                        story.append(Paragraph(f"Producto {i}: {product.get('name', 'Sin nombre')}", 
                                             ParagraphStyle('product_title', parent=self.styles['Heading3'], fontSize=12, spaceAfter=10)))
                        
                        # Tabla de cambios
                        changes_data = [["Campo", "Valor Anterior", "Valor Nuevo"]]
                        old_data = product.get('old_data', {})
                        new_data = product.get('new_data', {})
                        
                        for field in ['name', 'type', 'price_per_unit', 'quantity', 'description', 'harvest_date']:
                            old_val = str(old_data.get(field, 'N/A'))[:25]
                            new_val = str(new_data.get(field, 'N/A'))[:25]
                            if old_val != new_val:
                                changes_data.append([field.replace('_', ' ').title(), old_val, new_val])
                        
                        if len(changes_data) > 1:  # Si hay cambios
                            changes_table = Table(changes_data, colWidths=[1.5*inch, 2*inch, 2*inch])
                            changes_table.setStyle(TableStyle([
                                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                                ('FONTSIZE', (0, 0), (-1, 0), 9),
                                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                                ('FONTSIZE', (0, 1), (-1, -1), 8),
                                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey])
                            ]))
                            
                            story.append(changes_table)
                            story.append(Spacer(1, 15))
        
        # Errores si los hay
        if edit_result.get('errors', 0) > 0:
            story.append(Paragraph("Errores Encontrados", self.custom_styles['subtitle']))
            
            error_details = edit_result.get('details', [])
            if error_details:
                for i, error in enumerate(error_details[:10], 1):
                    story.append(Paragraph(f"{i}. {error}", self.custom_styles['normal']))
                
                if len(error_details) > 10:
                    story.append(Paragraph(f"... y {len(error_details) - 10} errores adicionales", self.custom_styles['normal']))
            
            story.append(Spacer(1, 20))
        
        # Conclusión
        story.append(Paragraph("Conclusión", self.custom_styles['subtitle']))
        
        if edit_result.get('errors', 0) == 0:
            conclusion = "El proceso de edición se completó exitosamente sin errores."
        elif edit_result.get('success', 0) > 0:
            conclusion = f"El proceso se completó parcialmente. Se editaron {edit_result.get('success', 0)} productos con {edit_result.get('errors', 0)} errores."
        else:
            conclusion = "El proceso de edición no pudo completarse debido a errores."
        
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
    """Función principal - Edición automatizada con autenticación"""
    print("EDITOR AUTOMATIZADO DE PRODUCTOS - AgroConecta")
    print("="*60)
    print("Email configurado:", LOGIN_CREDENTIALS['email'])
    print("Usando credenciales del archivo")
    print("="*60)
    print()
    
    try:
        editor = ProductEditor()
        
        # Intentar login automático
        print("Iniciando sesión automática...")
        login_success = editor.login()
        
        if login_success:
            print("Sesión iniciada correctamente")
            print()
            result = editor.edit_products_automated()
            print(f"\nPROCESO COMPLETADO:")
            print(f"   Productos editados: {result['success']}")
            print(f"   Errores: {result['errors']}")
        else:
            print("No se pudo iniciar sesión con las credenciales configuradas")
            print("   Verifica que las credenciales en LOGIN_CREDENTIALS sean correctas")
            
    except KeyboardInterrupt:
        print("\nOperación interrumpida por el usuario")
    except Exception as e:
        print(f"Error inesperado: {e}")

if __name__ == "__main__":
    main()

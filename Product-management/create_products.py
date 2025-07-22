#!/usr/bin/env python3
"""
Creador Automatizado de Productos - AgroConecta
Script para crear múltiples productos con datos aleatorios de manera automática
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

class ProductCreator:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.created_products = []
        
        # Datos para generar productos aleatorios
        self.product_names = [
            "Tomates Cherry Orgánicos", "Zanahorias Premium", "Lechuga Hidropónica",
            "Papas Andinas", "Brócoli Fresco", "Espinacas Baby", "Pepinos Criollos",
            "Apio Verde", "Cebollas Rojas", "Pimientos Multicolor", "Maíz Dulce",
            "Calabazas de Castilla", "Rábanos Rojos", "Acelgas Frescas", "Cilantro Orgánico",
            "Perejil Crespo", "Romero Fresco", "Albahaca Aromática", "Menta Verde",
            "Aguacates Hass", "Mangos Criollos", "Papayas Dulces", "Plátanos Maduros",
            "Yuca Fresca", "Ñame Blanco", "Malanga Criolla", "Batata Dulce",
            "Frijoles Rojos", "Lentejas Verdes", "Garbanzos Secos", "Habas Tiernas"
        ]
        
        self.product_types = [
            "Verdura", "Fruta", "Hortaliza", "Tubérculo", "Legumbre", 
            "Hierba Aromática", "Vegetal de Hoja", "Fruto", "Raíz"
        ]
        
        self.descriptions = [
            "Producto fresco de alta calidad, cultivado de manera sostenible en tierras fértiles",
            "Cosechado en el momento óptimo de maduración para garantizar el mejor sabor",
            "Libre de pesticidas y químicos dañinos, 100% natural y orgánico",
            "Cultivado con técnicas tradicionales respetando el medio ambiente",
            "Producto de temporada con sabor excepcional y textura perfecta",
            "Ideal para consumo directo o preparaciones culinarias variadas",
            "Rico en nutrientes, vitaminas y minerales esenciales para la salud",
            "Producto local de pequeños productores comprometidos con la calidad",
            "Cultivado bajo estrictos controles de calidad y buenas prácticas agrícolas",
            "Cosecha fresca entregada directamente del campo a tu mesa"
        ]
        
        self.units = ["kg", "lb", "gramo", "unidad", "manojo", "caja", "canasta"]
        
        # Configuración automática - SIN CONFIRMACIONES
        self.products_to_create = random.randint(5, 15)  # Entre 5 y 15 productos
        
    def login(self):
        """Inicia sesión y obtiene el token de autenticación"""
        try:
            print("Iniciando sesión automática...")
            print(f"Email: {LOGIN_CREDENTIALS['email']}")
            
            response = self.session.post(
                f"{AUTH_BASE_URL}/auth/login",
                json=LOGIN_CREDENTIALS,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get('token') or data.get('access_token') or data.get('accessToken')
                if self.auth_token:
                    print("Sesión iniciada exitosamente")
                    print(f"Token obtenido (primeros 20 chars): {self.auth_token[:20]}...")
                    return True
                else:
                    print("Token no encontrado en la respuesta")
                    return False
            else:
                print(f"Error de login: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"Error conectando con el servidor: {e}")
            return False
    
    def generate_random_product(self):
        """Genera datos aleatorios para un nuevo producto"""
        name = random.choice(self.product_names)
        
        # Asegurar que el nombre sea único agregando un sufijo
        timestamp = datetime.now().strftime("%H%M%S")
        name = f"{name} #{timestamp}"
        
        product_data = {
            "name": name,
            "type": random.choice(self.product_types),
            "description": random.choice(self.descriptions),
            "price_per_unit": round(random.uniform(0.5, 25.0), 2),  # Precio por unidad entre $0.50 y $25.00
            "quantity": random.randint(1, 100),  # Cantidad entre 1 y 100
            "unit": random.choice(self.units),
            "category": random.choice(["Orgánico", "Convencional", "Premium", "Económico"]),
            "location": random.choice([
                "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena",
                "Bucaramanga", "Pereira", "Manizales", "Ibagué", "Pasto"
            ])
        }
        
        return product_data
    
    def create_single_product(self, product_data):
        """Crea un solo producto"""
        try:
            headers = {"Content-Type": "application/json"}
            
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"
            
            print(f"Creando producto: {product_data['name']}")
            
            response = self.session.post(
                f"{API_BASE_URL}/products",
                json=product_data,
                headers=headers
            )
            
            if response.status_code in [200, 201]:
                created_product = response.json()
                print(f"Producto creado exitosamente - ID: {created_product.get('id', 'N/A')}")
                return created_product
            else:
                print(f"Error creando producto: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"Error details: {error_data}")
                except:
                    print(f"Error response: {response.text}")
                return None
                
        except Exception as e:
            print(f"Error en la solicitud: {e}")
            return None
    
    def create_multiple_products(self):
        """Crea múltiples productos automáticamente"""
        print("\n" + "="*60)
        print("CREADOR AUTOMATIZADO DE PRODUCTOS - MODO AUTOMÁTICO")
        print("="*60)
        print(f"Creando {self.products_to_create} productos automáticamente...")
        print("Sin confirmaciones requeridas - Ejecución completamente automática")
        print("="*60)
        
        success_count = 0
        error_count = 0
        
        for i in range(self.products_to_create):
            print(f"\nProducto {i+1}/{self.products_to_create}")
            print("-" * 40)
            
            # Generar datos aleatorios
            product_data = self.generate_random_product()
            
            # Mostrar datos del producto
            print(f"Nombre: {product_data['name']}")
            print(f"Tipo: {product_data['type']}")
            print(f"Precio: ${product_data['price_per_unit']} por {product_data['unit']}")
            print(f"Cantidad: {product_data['quantity']} {product_data['unit']}")
            print(f"Ubicación: {product_data['location']}")
            
            # Crear el producto
            result = self.create_single_product(product_data)
            
            if result:
                self.created_products.append({
                    'id': result.get('id'),
                    'name': product_data['name'],
                    'type': product_data['type'],
                    'price_per_unit': product_data['price_per_unit'],
                    'quantity': product_data['quantity'],
                    'unit': product_data['unit'],
                    'location': product_data['location'],
                    'created_at': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })
                success_count += 1
            else:
                error_count += 1
            
            # Pausa breve entre creaciones
            time.sleep(0.5)
        
        print("\n" + "="*60)
        print("RESUMEN DE CREACIÓN DE PRODUCTOS")
        print("="*60)
        print(f"Productos creados exitosamente: {success_count}")
        print(f"Errores en la creación: {error_count}")
        print(f"Tasa de éxito: {(success_count/self.products_to_create)*100:.1f}%")
        print("="*60)
        
        return success_count, error_count

class PDFGenerator:
    def __init__(self, created_products, success_count, error_count):
        self.created_products = created_products
        self.success_count = success_count
        self.error_count = error_count
        self.total_attempted = success_count + error_count
        
    def generate_report(self):
        """Genera el reporte PDF de creación de productos"""
        try:
            # Crear directorio de reportes si no existe
            reports_dir = "reportes"
            if not os.path.exists(reports_dir):
                os.makedirs(reports_dir)
            
            # Nombre del archivo
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{reports_dir}/reporte_creacion_productos_{timestamp}.pdf"
            
            # Crear documento
            doc = SimpleDocTemplate(filename, pagesize=A4, topMargin=0.5*inch)
            styles = getSampleStyleSheet()
            story = []
            
            # Estilos personalizados
            title_style = ParagraphStyle(
                'CustomTitle',
                parent=styles['Heading1'],
                fontSize=18,
                spaceAfter=30,
                alignment=TA_CENTER,
                textColor=colors.darkgreen
            )
            
            subtitle_style = ParagraphStyle(
                'CustomSubtitle',
                parent=styles['Heading2'],
                fontSize=14,
                spaceAfter=20,
                textColor=colors.darkblue
            )
            
            # Título
            story.append(Paragraph("REPORTE DE CREACIÓN DE PRODUCTOS", title_style))
            story.append(Paragraph("Sistema AgroConecta - Creación Automatizada", styles['Normal']))
            story.append(Spacer(1, 20))
            
            # Información general
            current_time = datetime.now().strftime("%d/%m/%Y a las %H:%M:%S")
            story.append(Paragraph("INFORMACIÓN GENERAL", subtitle_style))
            
            general_info = [
                ["Fecha y hora:", current_time],
                ["Total intentos:", str(self.total_attempted)],
                ["Productos creados:", str(self.success_count)],
                ["Errores:", str(self.error_count)],
                ["Tasa de éxito:", f"{(self.success_count/self.total_attempted)*100:.1f}%" if self.total_attempted > 0 else "0%"]
            ]
            
            general_table = Table(general_info, colWidths=[2*inch, 3*inch])
            general_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(general_table)
            story.append(Spacer(1, 30))
            
            # Detalles de productos creados
            if self.created_products:
                story.append(Paragraph("PRODUCTOS CREADOS", subtitle_style))
                
                # Tabla de productos
                product_data = [
                    ["ID", "Nombre", "Tipo", "Precio", "Cantidad", "Ubicación", "Fecha Creación"]
                ]
                
                for product in self.created_products:
                    product_data.append([
                        str(product.get('id', 'N/A')),
                        product.get('name', 'N/A')[:25] + "..." if len(product.get('name', '')) > 25 else product.get('name', 'N/A'),
                        product.get('type', 'N/A'),
                        f"${product.get('price_per_unit', 0):.2f}",
                        f"{product.get('quantity', 0)} {product.get('unit', '')}",
                        product.get('location', 'N/A'),
                        product.get('created_at', 'N/A')
                    ])
                
                product_table = Table(product_data, colWidths=[0.7*inch, 1.8*inch, 1*inch, 0.8*inch, 1*inch, 1*inch, 1.2*inch])
                product_table.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.darkgreen),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                    ('BACKGROUND', (0, 1), (-1, -1), colors.lightgreen),
                    ('ALTERNATEROWSBACKGROUND', (0, 1), (-1, -1), [colors.lightgreen, colors.white]),
                    ('GRID', (0, 0), (-1, -1), 1, colors.black),
                    ('FONTSIZE', (0, 1), (-1, -1), 8)
                ]))
                
                story.append(product_table)
                story.append(Spacer(1, 20))
            
            # Estadísticas adicionales
            story.append(Paragraph("ESTADÍSTICAS DETALLADAS", subtitle_style))
            
            if self.created_products:
                # Análisis por tipo
                type_count = {}
                location_count = {}
                total_value = 0
                
                for product in self.created_products:
                    product_type = product.get('type', 'Desconocido')
                    location = product.get('location', 'Desconocido')
                    price = product.get('price_per_unit', 0)
                    quantity = product.get('quantity', 0)
                    
                    type_count[product_type] = type_count.get(product_type, 0) + 1
                    location_count[location] = location_count.get(location, 0) + 1
                    total_value += price * quantity
                
                stats_text = f"""
                <b>Valor total del inventario creado:</b> ${total_value:.2f}<br/>
                <b>Precio promedio por producto:</b> ${sum(p.get('price_per_unit', 0) for p in self.created_products) / len(self.created_products):.2f}<br/>
                <b>Cantidad promedio por producto:</b> {sum(p.get('quantity', 0) for p in self.created_products) / len(self.created_products):.1f}<br/>
                <b>Tipos más creados:</b> {', '.join([f"{k}: {v}" for k, v in sorted(type_count.items(), key=lambda x: x[1], reverse=True)[:3]])}<br/>
                <b>Ubicaciones principales:</b> {', '.join([f"{k}: {v}" for k, v in sorted(location_count.items(), key=lambda x: x[1], reverse=True)[:3]])}
                """
                story.append(Paragraph(stats_text, styles['Normal']))
            
            # Pie de página
            story.append(Spacer(1, 30))
            story.append(Paragraph("Reporte generado automáticamente por el Sistema AgroConecta", styles['Normal']))
            story.append(Paragraph(f"Script de Creación Automatizada - {current_time}", styles['Normal']))
            
            # Construir PDF
            doc.build(story)
            
            print(f"\nReporte PDF generado: {filename}")
            print(f"El reporte contiene {len(self.created_products)} productos creados")
            
            return filename
            
        except Exception as e:
            print(f"Error generando reporte PDF: {e}")
            return None

def main():
    """Función principal - EJECUCIÓN COMPLETAMENTE AUTOMÁTICA"""
    print("\n" + "="*50)
    print("CREADOR AUTOMATIZADO DE PRODUCTOS - AGROCONECTA")
    print("="*50)
    print("MODO AUTOMÁTICO: Sin confirmaciones ni interrupciones")
    print("El script creará productos automáticamente...")
    print("\n")
    
    creator = ProductCreator()
    
    # Login automático
    if not creator.login():
        print("No se pudo iniciar sesión. Abortando...")
        return
    
    # Crear productos automáticamente
    success_count, error_count = creator.create_multiple_products()
    
    # Generar reporte PDF automáticamente
    if creator.created_products:
        print("\nGenerando reporte PDF automáticamente...")
        pdf_generator = PDFGenerator(creator.created_products, success_count, error_count)
        pdf_file = pdf_generator.generate_report()
        
        if pdf_file:
            print(f"Reporte guardado en: {pdf_file}")
    
    print("\n" + "="*50)
    print("CREACIÓN AUTOMATIZADA COMPLETADA")
    print("="*50)
    print(f"{success_count} productos creados exitosamente")
    if error_count > 0:
        print(f"{error_count} productos con errores")
    print("Reporte PDF generado automáticamente")
    print("Ejecución completamente automática - Sin confirmaciones")
    print("="*50)

if __name__ == "__main__":
    main()

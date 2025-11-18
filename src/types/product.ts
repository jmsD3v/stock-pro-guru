export interface Product {
  id: string;
  nombre: string;
  sku?: string;
  codigo_ean?: string;
  codigo_interno_proveedor?: string;
  codigo_fabrica?: string;
  marca?: string;
  modelo?: string;
  dimensiones?: string;
  material?: string;
  compatibilidad?: string;
  descripcion?: string;
  descuento_porcentaje?: number;
  imagen_url?: string;
  categoria_id?: string;
  subcategoria_id?: string;
  stock_actual: number;
  stock_minimo?: number;
  stock_maximo?: number;
  precio_venta?: number;
  ultimo_costo?: number;
  ubicacion_fisica?: string;
  activo: boolean;
  fecha_ultima_entrada?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFormData {
  nombre: string;
  sku: string;
  codigo_ean: string;
  marca: string;
  modelo: string;
  stock_minimo: string;
  stock_maximo: string;
  precio_venta: string;
  ubicacion_fisica: string;
  imagen_url: string;
}

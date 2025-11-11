export interface ProductoProveedor {
  id: string;
  producto_id: string;
  proveedor_id: string;
  precio_costo: number;
  codigo_proveedor?: string;
  es_proveedor_principal: boolean;
  created_at?: string;
  updated_at?: string;
  proveedores?: {
    nombre: string;
  };
}

export interface ProductoProveedorFormData {
  proveedor_id: string;
  precio_costo: string;
  codigo_proveedor: string;
  es_proveedor_principal: boolean;
}

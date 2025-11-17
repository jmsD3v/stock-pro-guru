export interface MovimientoStock {
  id: string;
  producto_id: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'INVENTARIO';
  cantidad: number;
  fecha_movimiento: string;
  precio_costo?: number;
  proveedor_id?: string;
  referencia?: string;
  observaciones?: string;
  created_at?: string;
  productos?: {
    nombre: string;
    sku?: string;
  };
  proveedores?: {
    nombre: string;
  };
}

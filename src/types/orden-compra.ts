export interface OrdenCompra {
  id: string;
  numero_orden: string;
  proveedor_id: string;
  fecha_orden: string;
  fecha_entrega_estimada?: string;
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'EN_TRANSITO' | 'RECIBIDA' | 'CANCELADA';
  subtotal: number;
  impuestos: number;
  total: number;
  observaciones?: string;
  created_at?: string;
  updated_at?: string;
  proveedores?: {
    nombre: string;
  };
}

export interface OrdenCompraDetalle {
  id: string;
  orden_compra_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  created_at?: string;
  productos?: {
    nombre: string;
    sku?: string;
  };
}

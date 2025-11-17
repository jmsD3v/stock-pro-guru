-- Agregar campo de imagen a productos
ALTER TABLE public.productos ADD COLUMN imagen_url TEXT;

-- Crear tabla de órdenes de compra
CREATE TABLE public.ordenes_compra (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_orden TEXT NOT NULL,
  proveedor_id UUID REFERENCES public.proveedores(id),
  fecha_orden TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  fecha_entrega_estimada TIMESTAMP WITH TIME ZONE,
  estado TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'CONFIRMADA', 'EN_TRANSITO', 'RECIBIDA', 'CANCELADA')),
  subtotal NUMERIC DEFAULT 0,
  impuestos NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de detalle de órdenes de compra
CREATE TABLE public.orden_compra_detalle (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  orden_compra_id UUID NOT NULL REFERENCES public.ordenes_compra(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES public.productos(id),
  cantidad INTEGER NOT NULL,
  precio_unitario NUMERIC NOT NULL,
  subtotal NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en órdenes de compra
ALTER TABLE public.ordenes_compra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orden_compra_detalle ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para órdenes_compra
CREATE POLICY "Permitir lectura de órdenes de compra"
  ON public.ordenes_compra FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserción de órdenes de compra"
  ON public.ordenes_compra FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir actualización de órdenes de compra"
  ON public.ordenes_compra FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir eliminación de órdenes de compra"
  ON public.ordenes_compra FOR DELETE
  USING (auth.role() = 'authenticated');

-- Políticas RLS para orden_compra_detalle
CREATE POLICY "Permitir lectura de detalle de órdenes"
  ON public.orden_compra_detalle FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir inserción de detalle de órdenes"
  ON public.orden_compra_detalle FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir actualización de detalle de órdenes"
  ON public.orden_compra_detalle FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir eliminación de detalle de órdenes"
  ON public.orden_compra_detalle FOR DELETE
  USING (auth.role() = 'authenticated');

-- Trigger para actualizar updated_at en órdenes de compra
CREATE TRIGGER update_ordenes_compra_updated_at
  BEFORE UPDATE ON public.ordenes_compra
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para mejor rendimiento
CREATE INDEX idx_ordenes_compra_proveedor ON public.ordenes_compra(proveedor_id);
CREATE INDEX idx_orden_compra_detalle_orden ON public.orden_compra_detalle(orden_compra_id);
CREATE INDEX idx_orden_compra_detalle_producto ON public.orden_compra_detalle(producto_id);
-- Crear tabla de categorías
CREATE TABLE public.categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de subcategorías
CREATE TABLE public.subcategorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  categoria_id UUID REFERENCES public.categorias(id) ON DELETE CASCADE,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de proveedores
CREATE TABLE public.proveedores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  contacto TEXT,
  telefono TEXT,
  email TEXT,
  condiciones_pago TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de productos
CREATE TABLE public.productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  sku TEXT UNIQUE,
  codigo_ean TEXT,
  codigo_interno_proveedor TEXT,
  codigo_fabrica TEXT,
  marca TEXT,
  modelo TEXT,
  dimensiones TEXT,
  material TEXT,
  compatibilidad TEXT,
  categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
  subcategoria_id UUID REFERENCES public.subcategorias(id) ON DELETE SET NULL,
  ubicacion_fisica TEXT,
  stock_actual INTEGER DEFAULT 0 NOT NULL,
  stock_minimo INTEGER DEFAULT 0,
  stock_maximo INTEGER,
  precio_venta DECIMAL(10,2),
  ultimo_costo DECIMAL(10,2),
  fecha_ultima_entrada TIMESTAMPTZ,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Crear tabla de relación producto-proveedor con precios
CREATE TABLE public.producto_proveedor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID REFERENCES public.productos(id) ON DELETE CASCADE,
  proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE CASCADE,
  codigo_proveedor TEXT,
  precio_costo DECIMAL(10,2) NOT NULL,
  es_proveedor_principal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(producto_id, proveedor_id)
);

-- Crear enum para tipos de movimiento
CREATE TYPE tipo_movimiento AS ENUM ('ENTRADA', 'SALIDA', 'AJUSTE', 'INVENTARIO');

-- Crear tabla de movimientos de stock
CREATE TABLE public.movimientos_stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id UUID REFERENCES public.productos(id) ON DELETE CASCADE,
  tipo tipo_movimiento NOT NULL,
  cantidad INTEGER NOT NULL,
  precio_costo DECIMAL(10,2),
  proveedor_id UUID REFERENCES public.proveedores(id) ON DELETE SET NULL,
  referencia TEXT,
  observaciones TEXT,
  fecha_movimiento TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producto_proveedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos_stock ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para lectura pública (todos los usuarios autenticados pueden leer)
CREATE POLICY "Permitir lectura de categorías" ON public.categorias FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir lectura de subcategorías" ON public.subcategorias FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir lectura de proveedores" ON public.proveedores FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir lectura de productos" ON public.productos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir lectura de producto_proveedor" ON public.producto_proveedor FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir lectura de movimientos" ON public.movimientos_stock FOR SELECT USING (auth.role() = 'authenticated');

-- Políticas para inserción (todos los usuarios autenticados pueden insertar)
CREATE POLICY "Permitir inserción de categorías" ON public.categorias FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Permitir inserción de subcategorías" ON public.subcategorias FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Permitir inserción de proveedores" ON public.proveedores FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Permitir inserción de productos" ON public.productos FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Permitir inserción de producto_proveedor" ON public.producto_proveedor FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Permitir inserción de movimientos" ON public.movimientos_stock FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas para actualización
CREATE POLICY "Permitir actualización de categorías" ON public.categorias FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir actualización de subcategorías" ON public.subcategorias FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir actualización de proveedores" ON public.proveedores FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir actualización de productos" ON public.productos FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir actualización de producto_proveedor" ON public.producto_proveedor FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para eliminación
CREATE POLICY "Permitir eliminación de categorías" ON public.categorias FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir eliminación de subcategorías" ON public.subcategorias FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir eliminación de proveedores" ON public.proveedores FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir eliminación de productos" ON public.productos FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir eliminación de producto_proveedor" ON public.producto_proveedor FOR DELETE USING (auth.role() = 'authenticated');

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_proveedores_updated_at BEFORE UPDATE ON public.proveedores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON public.productos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_producto_proveedor_updated_at BEFORE UPDATE ON public.producto_proveedor FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_productos_sku ON public.productos(sku);
CREATE INDEX idx_productos_ean ON public.productos(codigo_ean);
CREATE INDEX idx_productos_categoria ON public.productos(categoria_id);
CREATE INDEX idx_productos_stock ON public.productos(stock_actual);
CREATE INDEX idx_movimientos_producto ON public.movimientos_stock(producto_id);
CREATE INDEX idx_movimientos_fecha ON public.movimientos_stock(fecha_movimiento DESC);
CREATE INDEX idx_producto_proveedor_producto ON public.producto_proveedor(producto_id);
CREATE INDEX idx_producto_proveedor_proveedor ON public.producto_proveedor(proveedor_id);
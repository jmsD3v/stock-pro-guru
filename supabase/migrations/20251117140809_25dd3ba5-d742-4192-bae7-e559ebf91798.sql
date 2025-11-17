-- Agregar campos de descripción y descuento a la tabla productos
ALTER TABLE public.productos 
ADD COLUMN IF NOT EXISTS descripcion TEXT,
ADD COLUMN IF NOT EXISTS descuento_porcentaje NUMERIC DEFAULT 0 CHECK (descuento_porcentaje >= 0 AND descuento_porcentaje <= 100);
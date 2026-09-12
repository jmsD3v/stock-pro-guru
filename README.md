# StockPro — Gestión de Inventario

Sistema de gestión de inventario: catálogo de productos, proveedores, órdenes de compra, movimientos de stock y alertas.

## Qué hace

- **Productos y catálogo** — categorías y subcategorías, ficha por producto.
- **Proveedores** — relación producto-proveedor (`producto_proveedor`).
- **Órdenes de compra** — cabecera + detalle (`ordenes_compra` / `orden_compra_detalle`).
- **Movimientos de stock** — entradas y salidas (`movimientos_stock`).
- **Alertas** — quiebres/bajo stock.
- **Reportes** — vista consolidada de movimientos y compras.
- **Auth** — login con roles (`profiles` + `user_roles`).

## Stack

React 18 + TypeScript + Vite, shadcn/ui sobre Radix, Tailwind, React Router, React Query, React Hook Form + Zod, Supabase (Postgres + Auth) como backend.

## Estado actual

Esquema completo y migrado (`categorias`, `productos`, `proveedores`, `movimientos_stock`, `ordenes_compra`, etc.), pero es el que menos terminado llegó de la tanda: nunca se le escribió ni una descripción propia. **La instancia de Supabase original no está conectada** — para levantarlo hay que crear un proyecto nuevo, correr las migraciones de `supabase/migrations/` y completar `.env` a partir de `.env.example`.

## Desarrollo local

```sh
npm install
cp .env.example .env   # completar con las credenciales del proyecto Supabase
npm run dev
```

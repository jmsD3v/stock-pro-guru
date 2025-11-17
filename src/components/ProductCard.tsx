import { Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types/product";
import { ProductoProveedor } from "@/types/producto-proveedor";

interface ProductCardProps {
  product: Product;
  suppliers?: ProductoProveedor[];
}

export const ProductCard = ({ product, suppliers = [] }: ProductCardProps) => {
  const precioOriginal = product.precio_venta || 0;
  const descuento = product.descuento_porcentaje || 0;
  const precioFinal = precioOriginal - (precioOriginal * descuento / 100);
  const tieneDescuento = descuento > 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{product.nombre}</CardTitle>
            <CardDescription className="text-xs">
              {product.marca && product.modelo 
                ? `${product.marca} - ${product.modelo}` 
                : product.marca || product.modelo || 'Sin marca'}
            </CardDescription>
          </div>
          <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-md">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Precio */}
        <div className="space-y-1">
          {tieneDescuento ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">
                  ${precioFinal.toFixed(2)}
                </span>
                <Badge variant="destructive" className="text-xs">
                  -{descuento}%
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground line-through">
                Antes: ${precioOriginal.toFixed(2)}
              </div>
            </>
          ) : (
            <span className="text-2xl font-bold text-foreground">
              ${precioOriginal.toFixed(2)}
            </span>
          )}
        </div>

        {/* Descripción */}
        {product.descripcion && (
          <div className="text-sm text-muted-foreground">
            {product.descripcion}
          </div>
        )}

        {/* Stock */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Stock:</span>
          <Badge 
            variant={product.stock_actual > (product.stock_minimo || 0) ? "default" : "destructive"}
            className="text-xs"
          >
            {product.stock_actual} unidades
          </Badge>
        </div>

        {/* Proveedores */}
        {suppliers.length > 0 && (
          <div className="pt-2 border-t">
            <span className="text-xs font-medium text-muted-foreground">
              Proveedores:
            </span>
            <div className="mt-2 space-y-1">
              {suppliers.map((supplier) => (
                <div 
                  key={supplier.id} 
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-foreground">
                    {supplier.proveedores?.nombre}
                    {supplier.es_proveedor_principal && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Principal
                      </Badge>
                    )}
                  </span>
                  <span className="text-muted-foreground">
                    ${supplier.precio_costo?.toFixed(2) || "0.00"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información adicional */}
        <div className="pt-2 border-t space-y-1">
          {product.sku && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">SKU:</span> {product.sku}
            </div>
          )}
          {product.codigo_ean && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Código EAN:</span> {product.codigo_ean}
            </div>
          )}
          {product.ubicacion_fisica && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Ubicación:</span> {product.ubicacion_fisica}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

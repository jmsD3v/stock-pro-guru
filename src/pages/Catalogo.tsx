import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { ProductoProveedor } from "@/types/producto-proveedor";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export default function Catalogo() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: productos, isLoading } = useQuery({
    queryKey: ["productos-catalogo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("productos")
        .select("*")
        .eq("activo", true)
        .order("nombre");

      if (error) throw error;
      return data as Product[];
    },
  });

  const { data: productosProveedores } = useQuery({
    queryKey: ["productos-proveedores-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("producto_proveedor")
        .select(`
          *,
          proveedores (
            nombre
          )
        `)
        .order("es_proveedor_principal", { ascending: false });

      if (error) throw error;
      return data as ProductoProveedor[];
    },
  });

  const filteredProductos = productos?.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.modelo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProductSuppliers = (productId: string) => {
    return productosProveedores?.filter(
      (pp) => pp.producto_id === productId
    ) || [];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Catálogo de Productos</h1>
        <p className="text-muted-foreground">
          Consulta rápida de precios y disponibilidad
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar por nombre, marca, modelo o SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProductos?.map((producto) => (
            <ProductCard
              key={producto.id}
              product={producto}
              suppliers={getProductSuppliers(producto.id)}
            />
          ))}
        </div>
      )}

      {!isLoading && filteredProductos?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron productos
        </div>
      )}
    </div>
  );
}

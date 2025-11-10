import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Productos() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: productos, isLoading } = useQuery({
    queryKey: ["productos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("productos")
        .select("*, categorias(nombre), subcategorias(nombre)")
        .order("nombre");
      
      if (error) throw error;
      return data;
    },
  });

  const filteredProductos = productos?.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo_ean?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Productos</h1>
          <p className="text-muted-foreground">Gestión completa de inventario</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Producto
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, SKU o código EAN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Precio Venta</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Cargando productos...
                </TableCell>
              </TableRow>
            ) : filteredProductos?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No se encontraron productos. Comienza agregando uno nuevo.
                </TableCell>
              </TableRow>
            ) : (
              filteredProductos?.map((producto) => (
                <TableRow key={producto.id}>
                  <TableCell className="font-medium">{producto.sku || "—"}</TableCell>
                  <TableCell>{producto.nombre}</TableCell>
                  <TableCell>{producto.categorias?.nombre || "—"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        producto.stock_actual <= producto.stock_minimo
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {producto.stock_actual}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    ${producto.precio_venta?.toFixed(2) || "0.00"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={producto.activo ? "default" : "secondary"}>
                      {producto.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

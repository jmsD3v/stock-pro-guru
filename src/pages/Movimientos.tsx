import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { MovimientoStockDialog } from "@/components/MovimientoStockDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Movimientos() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: movimientos, isLoading } = useQuery({
    queryKey: ["movimientos-stock"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("movimientos_stock")
        .select("*, productos(nombre, sku), proveedores(nombre)")
        .order("fecha_movimiento", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredMovimientos = movimientos?.filter((m) =>
    m.productos?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.productos?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.referencia?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "ENTRADA": return "default";
      case "SALIDA": return "destructive";
      case "AJUSTE": return "secondary";
      case "INVENTARIO": return "outline";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Movimientos de Stock</h1>
          <p className="text-muted-foreground">Registro de entradas, salidas y ajustes</p>
        </div>
        <MovimientoStockDialog />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por producto, SKU o referencia..."
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
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Cantidad</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead>Observaciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Cargando movimientos...
                </TableCell>
              </TableRow>
            ) : filteredMovimientos?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No se encontraron movimientos. Comienza registrando uno nuevo.
                </TableCell>
              </TableRow>
            ) : (
              filteredMovimientos?.map((movimiento) => (
                <TableRow key={movimiento.id}>
                  <TableCell>
                    {format(new Date(movimiento.fecha_movimiento), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getTipoColor(movimiento.tipo)}>
                      {movimiento.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {movimiento.productos?.nombre || "—"}
                  </TableCell>
                  <TableCell>{movimiento.productos?.sku || "—"}</TableCell>
                  <TableCell className="font-semibold">
                    {movimiento.tipo === "SALIDA" ? "-" : "+"}{movimiento.cantidad}
                  </TableCell>
                  <TableCell>{movimiento.proveedores?.nombre || "—"}</TableCell>
                  <TableCell>{movimiento.referencia || "—"}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {movimiento.observaciones || "—"}
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

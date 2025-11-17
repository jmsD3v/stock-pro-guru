import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
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

export default function OrdenesCompra() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: ordenes, isLoading } = useQuery({
    queryKey: ["ordenes-compra"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ordenes_compra")
        .select("*, proveedores(nombre)")
        .order("fecha_orden", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const filteredOrdenes = ordenes?.filter((o) =>
    o.numero_orden.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.proveedores?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "PENDIENTE": return "secondary";
      case "CONFIRMADA": return "default";
      case "EN_TRANSITO": return "outline";
      case "RECIBIDA": return "default";
      case "CANCELADA": return "destructive";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Órdenes de Compra</h1>
          <p className="text-muted-foreground">Gestión de pedidos a proveedores</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Orden
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número de orden o proveedor..."
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
              <TableHead>Número</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Fecha Orden</TableHead>
              <TableHead>Entrega Estimada</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Cargando órdenes...
                </TableCell>
              </TableRow>
            ) : filteredOrdenes?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No se encontraron órdenes. Comienza creando una nueva.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrdenes?.map((orden) => (
                <TableRow key={orden.id}>
                  <TableCell className="font-medium">{orden.numero_orden}</TableCell>
                  <TableCell>{orden.proveedores?.nombre || "—"}</TableCell>
                  <TableCell>{format(new Date(orden.fecha_orden), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    {orden.fecha_entrega_estimada 
                      ? format(new Date(orden.fecha_entrega_estimada), "dd/MM/yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell className="font-semibold">${orden.total?.toFixed(2) || "0.00"}</TableCell>
                  <TableCell>
                    <Badge variant={getEstadoColor(orden.estado)}>
                      {orden.estado}
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

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ProductoProveedor } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ProductoProveedoresListProps {
  productoId: string;
}

export function ProductoProveedoresList({ productoId }: ProductoProveedoresListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: asociaciones, isLoading } = useQuery({
    queryKey: ["producto-proveedores", productoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("producto_proveedor")
        .select(`
          *,
          proveedores (
            nombre
          )
        `)
        .eq("producto_id", productoId)
        .order("es_proveedor_principal", { ascending: false });
      
      if (error) throw error;
      return data as ProductoProveedor[];
    },
  });

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("producto_proveedor")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la asociación: " + error.message,
      });
    } else {
      toast({
        title: "Asociación eliminada",
        description: "La asociación con el proveedor se eliminó exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["producto-proveedores", productoId] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    }
  };

  const handleSetPrincipal = async (id: string) => {
    // Primero, quitar el flag de todos
    await supabase
      .from("producto_proveedor")
      .update({ es_proveedor_principal: false })
      .eq("producto_id", productoId);

    // Luego, marcar el seleccionado como principal
    const { error } = await supabase
      .from("producto_proveedor")
      .update({ es_proveedor_principal: true })
      .eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo marcar como principal: " + error.message,
      });
    } else {
      toast({
        title: "Proveedor principal actualizado",
        description: "El proveedor se marcó como principal exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["producto-proveedores", productoId] });
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando proveedores...</div>;
  }

  if (!asociaciones || asociaciones.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No hay proveedores asociados a este producto
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Proveedor</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Precio de Costo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {asociaciones.map((asociacion) => (
            <TableRow key={asociacion.id}>
              <TableCell className="font-medium">
                {asociacion.proveedores?.nombre || "—"}
              </TableCell>
              <TableCell>{asociacion.codigo_proveedor || "—"}</TableCell>
              <TableCell>${asociacion.precio_costo?.toFixed(2) || "0.00"}</TableCell>
              <TableCell>
                {asociacion.es_proveedor_principal && (
                  <Badge variant="default">
                    <Star className="h-3 w-3 mr-1" />
                    Principal
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {!asociacion.es_proveedor_principal && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSetPrincipal(asociacion.id)}
                      title="Marcar como principal"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(asociacion.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

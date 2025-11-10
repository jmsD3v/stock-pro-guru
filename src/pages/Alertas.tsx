import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Alertas() {
  const { data: alertas, isLoading } = useQuery({
    queryKey: ["alertas-stock"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("productos")
        .select("*, categorias(nombre)")
        .eq("activo", true)
        .order("stock_actual");
      
      if (error) throw error;
      
      // Filtrar productos con stock bajo
      return data?.filter(p => p.stock_actual <= p.stock_minimo) || [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Alertas de Stock</h1>
        <p className="text-muted-foreground">Productos que requieren reposición</p>
      </div>

      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader className="flex flex-row items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive">
            {alertas?.length || 0} productos con stock bajo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Estos productos han alcanzado o están por debajo de su nivel mínimo de stock.
          </p>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Stock Actual</TableHead>
              <TableHead>Stock Mínimo</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Cargando alertas...
                </TableCell>
              </TableRow>
            ) : alertas?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  ¡Excelente! No hay productos con stock bajo.
                </TableCell>
              </TableRow>
            ) : (
              alertas?.map((producto) => (
                <TableRow key={producto.id}>
                  <TableCell className="font-medium">{producto.sku || "—"}</TableCell>
                  <TableCell>{producto.nombre}</TableCell>
                  <TableCell>{producto.categorias?.nombre || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">{producto.stock_actual}</Badge>
                  </TableCell>
                  <TableCell>{producto.stock_minimo}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-destructive border-destructive">
                      Requiere Reposición
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

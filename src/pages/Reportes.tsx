import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function Reportes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
        <p className="text-muted-foreground">Análisis y reportes del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <FileText className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Valorización de Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Reporte completo del valor total del inventario por categoría
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FileText className="h-8 w-8 text-accent mb-2" />
            <CardTitle>Rotación de Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Análisis de productos con mayor y menor rotación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FileText className="h-8 w-8 text-warning mb-2" />
            <CardTitle>Historial de Movimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Listado completo de entradas, salidas y ajustes
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

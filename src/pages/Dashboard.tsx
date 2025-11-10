import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, TrendingDown, DollarSign } from "lucide-react";

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [productos, proveedores] = await Promise.all([
        supabase.from("productos").select("id, stock_actual, precio_venta, ultimo_costo, stock_minimo", { count: "exact" }),
        supabase.from("proveedores").select("id", { count: "exact" }),
      ]);

      // Filtrar productos con stock bajo en el cliente
      const alertas = productos.data?.filter(p => p.stock_actual <= p.stock_minimo) || [];

      const valorInventario =
        productos.data?.reduce((sum, p) => sum + (p.stock_actual * (p.ultimo_costo || 0)), 0) || 0;

      return {
        totalProductos: productos.count || 0,
        totalProveedores: proveedores.count || 0,
        alertasStock: alertas.length,
        valorInventario: valorInventario,
      };
    },
  });

  const cards = [
    {
      title: "Total Productos",
      value: stats?.totalProductos || 0,
      icon: Package,
      color: "text-primary",
    },
    {
      title: "Proveedores",
      value: stats?.totalProveedores || 0,
      icon: Users,
      color: "text-accent",
    },
    {
      title: "Alertas Stock Bajo",
      value: stats?.alertasStock || 0,
      icon: TrendingDown,
      color: "text-destructive",
    },
    {
      title: "Valor Total Inventario",
      value: `$${(stats?.valorInventario || 0).toLocaleString("es-AR", { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-primary",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Resumen general del inventario</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Productos con Stock Bajo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {stats?.alertasStock || 0} productos requieren reposición
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sistema listo para registrar movimientos
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, AlertCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [productos, proveedores] = await Promise.all([
        supabase.from("productos").select("id, stock_actual, precio_venta, ultimo_costo, stock_minimo", { count: "exact" }),
        supabase.from("proveedores").select("id", { count: "exact" }),
      ]);

      const alertas = productos.data?.filter(p => p.stock_actual <= (p.stock_minimo || 0)) || [];
      const valorInventario = productos.data?.reduce((sum, p) => sum + (p.stock_actual * (p.ultimo_costo || 0)), 0) || 0;

      return {
        totalProductos: productos.count || 0,
        totalProveedores: proveedores.count || 0,
        alertasStock: alertas.length,
        valorInventario: valorInventario,
      };
    },
  });

  const { data: productosStockBajo } = useQuery({
    queryKey: ["productos-stock-bajo"],
    queryFn: async () => {
      const { data } = await supabase
        .from("productos")
        .select("id, nombre, stock_actual, stock_minimo, precio_venta")
        .order("stock_actual", { ascending: true })
        .limit(10);
      
      return data?.filter(p => p.stock_actual <= (p.stock_minimo || 0)) || [];
    },
  });

  const { data: movimientosRecientes } = useQuery({
    queryKey: ["movimientos-recientes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("movimientos_stock")
        .select(`
          id,
          tipo,
          cantidad,
          fecha_movimiento,
          productos (nombre)
        `)
        .order("fecha_movimiento", { ascending: false })
        .limit(10);
      
      return data || [];
    },
  });

  const { data: productosMasVendidos } = useQuery({
    queryKey: ["productos-mas-vendidos"],
    queryFn: async () => {
      const { data } = await supabase
        .from("movimientos_stock")
        .select(`
          producto_id,
          cantidad,
          productos (nombre, precio_venta)
        `)
        .eq("tipo", "SALIDA")
        .order("created_at", { ascending: false });
      
      if (!data) return [];

      const ventasPorProducto = data.reduce((acc: any, mov: any) => {
        const id = mov.producto_id;
        if (!acc[id]) {
          acc[id] = {
            id,
            nombre: mov.productos?.nombre || "Sin nombre",
            totalVendido: 0,
            precioVenta: mov.productos?.precio_venta || 0,
          };
        }
        acc[id].totalVendido += mov.cantidad;
        return acc;
      }, {});

      return Object.values(ventasPorProducto)
        .sort((a: any, b: any) => b.totalVendido - a.totalVendido)
        .slice(0, 5);
    },
  });

  const { data: tendenciasInventario } = useQuery({
    queryKey: ["tendencias-inventario"],
    queryFn: async () => {
      const { data } = await supabase
        .from("movimientos_stock")
        .select("fecha_movimiento, tipo, cantidad")
        .order("fecha_movimiento", { ascending: true })
        .gte("fecha_movimiento", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      if (!data) return [];

      const movimientosPorDia = data.reduce((acc: any, mov) => {
        const fecha = format(new Date(mov.fecha_movimiento), "dd/MM", { locale: es });
        if (!acc[fecha]) {
          acc[fecha] = { fecha, entradas: 0, salidas: 0 };
        }
        if (mov.tipo === "ENTRADA") {
          acc[fecha].entradas += mov.cantidad;
        } else if (mov.tipo === "SALIDA") {
          acc[fecha].salidas += mov.cantidad;
        }
        return acc;
      }, {});

      return Object.values(movimientosPorDia).slice(-14);
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
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Productos con Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {productosStockBajo && productosStockBajo.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Mínimo</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosStockBajo.map((producto) => (
                    <TableRow key={producto.id}>
                      <TableCell className="font-medium">{producto.nombre}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="destructive">{producto.stock_actual}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{producto.stock_minimo || 0}</TableCell>
                      <TableCell className="text-right">
                        ${producto.precio_venta?.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No hay productos con stock bajo</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {productosMasVendidos && productosMasVendidos.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Vendidos</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosMasVendidos.map((producto: any) => (
                    <TableRow key={producto.id}>
                      <TableCell className="font-medium">{producto.nombre}</TableCell>
                      <TableCell className="text-right">
                        <Badge>{producto.totalVendido}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${producto.precioVenta?.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No hay datos de ventas</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tendencias de Inventario (Últimos 14 días)</CardTitle>
        </CardHeader>
        <CardContent>
          {tendenciasInventario && tendenciasInventario.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={tendenciasInventario}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="fecha" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)"
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="entradas" stroke="hsl(var(--primary))" name="Entradas" strokeWidth={2} />
                <Line type="monotone" dataKey="salidas" stroke="hsl(var(--destructive))" name="Salidas" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">No hay datos de tendencias disponibles</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {movimientosRecientes && movimientosRecientes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientosRecientes.map((mov: any) => (
                  <TableRow key={mov.id}>
                    <TableCell className="font-medium">{mov.productos?.nombre || "Sin nombre"}</TableCell>
                    <TableCell>
                      <Badge variant={mov.tipo === "ENTRADA" ? "default" : mov.tipo === "SALIDA" ? "destructive" : "secondary"}>
                        {mov.tipo === "ENTRADA" && <ArrowUpRight className="h-3 w-3 mr-1" />}
                        {mov.tipo === "SALIDA" && <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {mov.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{mov.cantidad}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {format(new Date(mov.fecha_movimiento), "dd/MM/yyyy HH:mm", { locale: es })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No hay movimientos registrados</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

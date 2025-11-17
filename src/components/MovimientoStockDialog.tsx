import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

export function MovimientoStockDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    producto_id: "",
    tipo: "ENTRADA" as "ENTRADA" | "SALIDA" | "AJUSTE" | "INVENTARIO",
    cantidad: "",
    precio_costo: "",
    proveedor_id: "",
    referencia: "",
    observaciones: "",
  });

  const { data: productos } = useQuery({
    queryKey: ["productos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("productos")
        .select("id, nombre, sku")
        .order("nombre");
      if (error) throw error;
      return data;
    },
  });

  const { data: proveedores } = useQuery({
    queryKey: ["proveedores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proveedores")
        .select("id, nombre")
        .order("nombre");
      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Insertar movimiento
      const { error: movError } = await supabase.from("movimientos_stock").insert([
        {
          producto_id: formData.producto_id,
          tipo: formData.tipo,
          cantidad: parseInt(formData.cantidad),
          precio_costo: formData.precio_costo ? parseFloat(formData.precio_costo) : null,
          proveedor_id: formData.proveedor_id || null,
          referencia: formData.referencia || null,
          observaciones: formData.observaciones || null,
        },
      ]);

      if (movError) throw movError;

      // Actualizar stock del producto
      const cantidad = parseInt(formData.cantidad);
      const multiplicador = formData.tipo === "SALIDA" ? -1 : 1;

      const { data: producto } = await supabase
        .from("productos")
        .select("stock_actual")
        .eq("id", formData.producto_id)
        .single();

      if (producto) {
        const nuevoStock = producto.stock_actual + (cantidad * multiplicador);
        await supabase
          .from("productos")
          .update({ stock_actual: nuevoStock })
          .eq("id", formData.producto_id);
      }

      toast({
        title: "Movimiento registrado",
        description: "El movimiento de stock se registró exitosamente",
      });

      setOpen(false);
      setFormData({
        producto_id: "",
        tipo: "ENTRADA",
        cantidad: "",
        precio_costo: "",
        proveedor_id: "",
        referencia: "",
        observaciones: "",
      });

      queryClient.invalidateQueries({ queryKey: ["movimientos-stock"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo registrar el movimiento: " + error.message,
      });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Registrar Movimiento
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nuevo Movimiento de Stock</DialogTitle>
          <DialogDescription>
            Registra entradas, salidas o ajustes de inventario
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="producto_id">Producto *</Label>
              <Select
                value={formData.producto_id}
                onValueChange={(value) => setFormData({ ...formData, producto_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {productos?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre} {p.sku && `(${p.sku})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Movimiento *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ENTRADA">Entrada</SelectItem>
                  <SelectItem value="SALIDA">Salida</SelectItem>
                  <SelectItem value="AJUSTE">Ajuste</SelectItem>
                  <SelectItem value="INVENTARIO">Inventario</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad *</Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio_costo">Precio Costo</Label>
              <Input
                id="precio_costo"
                type="number"
                step="0.01"
                min="0"
                value={formData.precio_costo}
                onChange={(e) => setFormData({ ...formData, precio_costo: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proveedor_id">Proveedor</Label>
              <Select
                value={formData.proveedor_id}
                onValueChange={(value) => setFormData({ ...formData, proveedor_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Opcional" />
                </SelectTrigger>
                <SelectContent>
                  {proveedores?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referencia">Referencia</Label>
              <Input
                id="referencia"
                placeholder="Ej: OC-001, Factura #123"
                value={formData.referencia}
                onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                rows={3}
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Registrar Movimiento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
import { Plus } from "lucide-react";

export function ProductDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const nombre = formData.get("nombre") as string;
    const sku = formData.get("sku") as string;
    const codigo_ean = formData.get("codigo_ean") as string;
    const stock_actual = parseInt(formData.get("stock_actual") as string) || 0;
    const stock_minimo = parseInt(formData.get("stock_minimo") as string) || 0;
    const precio_venta = parseFloat(formData.get("precio_venta") as string) || 0;
    const ultimo_costo = parseFloat(formData.get("ultimo_costo") as string) || 0;

    const { error } = await supabase.from("productos").insert({
      nombre,
      sku: sku || null,
      codigo_ean: codigo_ean || null,
      stock_actual,
      stock_minimo,
      precio_venta,
      ultimo_costo: ultimo_costo || null,
    });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el producto: " + error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Producto creado",
        description: "El producto se ha agregado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setOpen(false);
      (e.target as HTMLFormElement).reset();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Producto
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Producto</DialogTitle>
          <DialogDescription>
            Completa la información del producto para agregarlo al inventario
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                name="nombre"
                required
                disabled={loading}
                placeholder="Nombre del producto"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                name="sku"
                disabled={loading}
                placeholder="Código SKU"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigo_ean">Código EAN/Barras</Label>
              <Input
                id="codigo_ean"
                name="codigo_ean"
                disabled={loading}
                placeholder="Código de barras"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock_actual">Stock Actual *</Label>
              <Input
                id="stock_actual"
                name="stock_actual"
                type="number"
                min="0"
                defaultValue="0"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock_minimo">Stock Mínimo *</Label>
              <Input
                id="stock_minimo"
                name="stock_minimo"
                type="number"
                min="0"
                defaultValue="0"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precio_venta">Precio Venta *</Label>
              <Input
                id="precio_venta"
                name="precio_venta"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ultimo_costo">Último Costo</Label>
              <Input
                id="ultimo_costo"
                name="ultimo_costo"
                type="number"
                step="0.01"
                min="0"
                disabled={loading}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Producto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

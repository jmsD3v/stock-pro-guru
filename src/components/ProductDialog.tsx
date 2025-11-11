import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ProductFormData } from "@/types";
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
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

export function ProductDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ProductFormData>({
    nombre: "",
    sku: "",
    codigo_ean: "",
    marca: "",
    modelo: "",
    stock_minimo: "",
    stock_maximo: "",
    precio_venta: "",
    ubicacion_fisica: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("productos").insert([
      {
        nombre: formData.nombre,
        sku: formData.sku,
        codigo_ean: formData.codigo_ean,
        marca: formData.marca,
        modelo: formData.modelo,
        stock_minimo: parseInt(formData.stock_minimo) || 0,
        stock_maximo: parseInt(formData.stock_maximo) || 0,
        precio_venta: parseFloat(formData.precio_venta) || 0,
        ubicacion_fisica: formData.ubicacion_fisica,
        stock_actual: 0,
      },
    ]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el producto: " + error.message,
      });
    } else {
      toast({
        title: "Producto creado",
        description: "El producto se creó exitosamente",
      });
      setOpen(false);
      setFormData({
        nombre: "",
        sku: "",
        codigo_ean: "",
        marca: "",
        modelo: "",
        stock_minimo: "",
        stock_maximo: "",
        precio_venta: "",
        ubicacion_fisica: "",
      });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
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
            Completa la información del producto
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigo_ean">Código EAN/Barras</Label>
              <Input
                id="codigo_ean"
                value={formData.codigo_ean}
                onChange={(e) => setFormData({ ...formData, codigo_ean: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="marca">Marca</Label>
              <Input
                id="marca"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelo">Modelo</Label>
              <Input
                id="modelo"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ubicacion_fisica">Ubicación Física</Label>
              <Input
                id="ubicacion_fisica"
                placeholder="P-3, E-B, Nivel-2"
                value={formData.ubicacion_fisica}
                onChange={(e) => setFormData({ ...formData, ubicacion_fisica: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock_minimo">Stock Mínimo</Label>
              <Input
                id="stock_minimo"
                type="number"
                value={formData.stock_minimo}
                onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock_maximo">Stock Máximo</Label>
              <Input
                id="stock_maximo"
                type="number"
                value={formData.stock_maximo}
                onChange={(e) => setFormData({ ...formData, stock_maximo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precio_venta">Precio de Venta</Label>
              <Input
                id="precio_venta"
                type="number"
                step="0.01"
                value={formData.precio_venta}
                onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
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

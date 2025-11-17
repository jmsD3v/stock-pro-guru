import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product, ProductFormData } from "@/types";
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
import { Plus, Pencil } from "lucide-react";

interface ProductDialogProps {
  product?: Product;
  trigger?: React.ReactNode;
}

export function ProductDialog({ product, trigger }: ProductDialogProps) {
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

  useEffect(() => {
    if (product) {
      setFormData({
        nombre: product.nombre,
        sku: product.sku || "",
        codigo_ean: product.codigo_ean || "",
        marca: product.marca || "",
        modelo: product.modelo || "",
        stock_minimo: product.stock_minimo?.toString() || "",
        stock_maximo: product.stock_maximo?.toString() || "",
        precio_venta: product.precio_venta?.toString() || "",
        ubicacion_fisica: product.ubicacion_fisica || "",
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const productData = {
      nombre: formData.nombre,
      sku: formData.sku,
      codigo_ean: formData.codigo_ean,
      marca: formData.marca,
      modelo: formData.modelo,
      stock_minimo: parseInt(formData.stock_minimo) || 0,
      stock_maximo: parseInt(formData.stock_maximo) || 0,
      precio_venta: parseFloat(formData.precio_venta) || 0,
      ubicacion_fisica: formData.ubicacion_fisica,
      ...(product ? {} : { stock_actual: 0 }),
    };

    const { error } = product
      ? await supabase.from("productos").update(productData).eq("id", product.id)
      : await supabase.from("productos").insert([productData]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el producto: " + error.message,
      });
    } else {
      toast({
        title: product ? "Producto actualizado" : "Producto creado",
        description: product 
          ? "El producto se actualizó exitosamente" 
          : "El producto se creó exitosamente",
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
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Producto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar" : "Nuevo"} Producto</DialogTitle>
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
                {loading ? "Guardando..." : (product ? "Actualizar" : "Guardar") + " Producto"}
              </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

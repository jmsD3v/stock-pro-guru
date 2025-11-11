import { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ProductoProveedorFormData } from "@/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface ProductoProveedorDialogProps {
  productoId: string;
}

export function ProductoProveedorDialog({ productoId }: ProductoProveedorDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ProductoProveedorFormData>({
    proveedor_id: "",
    precio_costo: "",
    codigo_proveedor: "",
    es_proveedor_principal: false,
  });

  const { data: proveedores } = useQuery({
    queryKey: ["proveedores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proveedores")
        .select("*")
        .eq("activo", true)
        .order("nombre");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: proveedoresAsociados } = useQuery({
    queryKey: ["producto-proveedores", productoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("producto_proveedor")
        .select("proveedor_id")
        .eq("producto_id", productoId);
      
      if (error) throw error;
      return data.map(p => p.proveedor_id);
    },
  });

  const proveedoresDisponibles = proveedores?.filter(
    p => !proveedoresAsociados?.includes(p.id)
  );

  useEffect(() => {
    if (!open) {
      setFormData({
        proveedor_id: "",
        precio_costo: "",
        codigo_proveedor: "",
        es_proveedor_principal: false,
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.es_proveedor_principal) {
      const { error: updateError } = await supabase
        .from("producto_proveedor")
        .update({ es_proveedor_principal: false })
        .eq("producto_id", productoId);

      if (updateError) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo actualizar el proveedor principal: " + updateError.message,
        });
        setLoading(false);
        return;
      }
    }

    const { error } = await supabase.from("producto_proveedor").insert([
      {
        producto_id: productoId,
        proveedor_id: formData.proveedor_id,
        precio_costo: parseFloat(formData.precio_costo) || 0,
        codigo_proveedor: formData.codigo_proveedor || null,
        es_proveedor_principal: formData.es_proveedor_principal,
      },
    ]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo asociar el proveedor: " + error.message,
      });
    } else {
      toast({
        title: "Proveedor asociado",
        description: "El proveedor se asoció exitosamente al producto",
      });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["producto-proveedores", productoId] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Asociar Proveedor
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Asociar Proveedor al Producto</DialogTitle>
          <DialogDescription>
            Vincula un proveedor con su precio de costo y código específico
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proveedor_id">Proveedor *</Label>
            <Select
              value={formData.proveedor_id}
              onValueChange={(value) => setFormData({ ...formData, proveedor_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un proveedor" />
              </SelectTrigger>
              <SelectContent>
                {proveedoresDisponibles?.map((proveedor) => (
                  <SelectItem key={proveedor.id} value={proveedor.id}>
                    {proveedor.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="precio_costo">Precio de Costo *</Label>
            <Input
              id="precio_costo"
              type="number"
              step="0.01"
              min="0"
              value={formData.precio_costo}
              onChange={(e) => setFormData({ ...formData, precio_costo: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigo_proveedor">Código del Proveedor</Label>
            <Input
              id="codigo_proveedor"
              value={formData.codigo_proveedor}
              onChange={(e) => setFormData({ ...formData, codigo_proveedor: e.target.value })}
              placeholder="Código interno del proveedor"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="es_proveedor_principal"
              checked={formData.es_proveedor_principal}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, es_proveedor_principal: checked as boolean })
              }
            />
            <Label htmlFor="es_proveedor_principal" className="cursor-pointer">
              Marcar como proveedor principal
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Asociando..." : "Asociar Proveedor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

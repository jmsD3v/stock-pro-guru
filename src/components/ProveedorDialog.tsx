import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Proveedor, ProveedorFormData } from "@/types";
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

interface ProveedorDialogProps {
  proveedor?: Proveedor;
  trigger?: React.ReactNode;
}

export function ProveedorDialog({ proveedor, trigger }: ProveedorDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ProveedorFormData>({
    nombre: "",
    contacto: "",
    telefono: "",
    email: "",
    condiciones_pago: "",
  });

  useEffect(() => {
    if (proveedor) {
      setFormData({
        nombre: proveedor.nombre,
        contacto: proveedor.contacto || "",
        telefono: proveedor.telefono || "",
        email: proveedor.email || "",
        condiciones_pago: proveedor.condiciones_pago || "",
      });
    }
  }, [proveedor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = proveedor
      ? await supabase.from("proveedores").update(formData).eq("id", proveedor.id)
      : await supabase.from("proveedores").insert([formData]);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el proveedor: " + error.message,
      });
    } else {
      toast({
        title: proveedor ? "Proveedor actualizado" : "Proveedor creado",
        description: proveedor 
          ? "El proveedor se actualizó exitosamente" 
          : "El proveedor se creó exitosamente",
      });
      setOpen(false);
      setFormData({
        nombre: "",
        contacto: "",
        telefono: "",
        email: "",
        condiciones_pago: "",
      });
      queryClient.invalidateQueries({ queryKey: ["proveedores"] });
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
            Agregar Proveedor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{proveedor ? "Editar" : "Nuevo"} Proveedor</DialogTitle>
          <DialogDescription>
            Completa la información del proveedor
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contacto">Persona de Contacto</Label>
              <Input
                id="contacto"
                value={formData.contacto}
                onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="condiciones_pago">Condiciones de Pago</Label>
              <Input
                id="condiciones_pago"
                placeholder="30 días, Contado, etc."
                value={formData.condiciones_pago}
                onChange={(e) => setFormData({ ...formData, condiciones_pago: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : (proveedor ? "Actualizar" : "Guardar") + " Proveedor"}
              </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

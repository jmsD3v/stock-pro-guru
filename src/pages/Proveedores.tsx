import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Proveedores() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: proveedores, isLoading } = useQuery({
    queryKey: ["proveedores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proveedores")
        .select("*")
        .order("nombre");
      
      if (error) throw error;
      return data;
    },
  });

  const filteredProveedores = proveedores?.filter((p) =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Proveedores</h1>
          <p className="text-muted-foreground">Gestión de proveedores y sus catálogos</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Proveedor
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Condiciones de Pago</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Cargando proveedores...
                </TableCell>
              </TableRow>
            ) : filteredProveedores?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No se encontraron proveedores. Comienza agregando uno nuevo.
                </TableCell>
              </TableRow>
            ) : (
              filteredProveedores?.map((proveedor) => (
                <TableRow key={proveedor.id}>
                  <TableCell className="font-medium">{proveedor.nombre}</TableCell>
                  <TableCell>{proveedor.contacto || "—"}</TableCell>
                  <TableCell>{proveedor.telefono || "—"}</TableCell>
                  <TableCell>{proveedor.email || "—"}</TableCell>
                  <TableCell>{proveedor.condiciones_pago || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={proveedor.activo ? "default" : "secondary"}>
                      {proveedor.activo ? "Activo" : "Inactivo"}
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

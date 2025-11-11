export interface Proveedor {
  id: string;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  condiciones_pago?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProveedorFormData {
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  condiciones_pago: string;
}

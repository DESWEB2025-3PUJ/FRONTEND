export interface IEmpresa {
  id?: number;
  nombre: string;
  nit: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  descripcion?: string;
  activo?: boolean;
  fechaCreacion?: Date;
}

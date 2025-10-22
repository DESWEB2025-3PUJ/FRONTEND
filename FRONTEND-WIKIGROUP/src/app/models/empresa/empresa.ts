import { IEmpresa } from './empresa.interface';

export class Empresa implements IEmpresa {
  id?: number;
  nombre: string;
  nit: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  descripcion?: string;
  activo?: boolean;
  fechaCreacion?: Date;

  constructor(data?: Partial<IEmpresa> | any) {
    this.id = data?.id;
    this.nombre = data?.nombre || data?.name || '';
    this.nit = data?.nit || '';
    // Acepta tanto 'correo' como 'correoContacto' o 'email'
    this.correo = data?.correo || data?.correoContacto || data?.email || '';
    this.telefono = data?.telefono || data?.phone || '';
    this.direccion = data?.direccion || data?.address || '';
    this.descripcion = data?.descripcion || data?.description || '';
    this.activo = data?.activo ?? true;
    this.fechaCreacion = data?.fechaCreacion ? new Date(data.fechaCreacion) : undefined;
  }
}

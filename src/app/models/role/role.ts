import { IRole } from './role.interface';

export class Role implements IRole {
  id?: number;
  nombre: string;
  descripcion: string;
  empresaId: number;
  activo?: boolean;
  fechaCreacion?: Date;

  constructor(data?: Partial<IRole>) {
    this.id = data?.id;
    this.nombre = data?.nombre || '';
    this.descripcion = data?.descripcion || '';
    this.empresaId = data?.empresaId || 0;
    this.activo = data?.activo ?? true;
    this.fechaCreacion = data?.fechaCreacion ? new Date(data.fechaCreacion) : undefined;
  }
}

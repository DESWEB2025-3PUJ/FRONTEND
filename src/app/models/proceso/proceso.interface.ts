import { ProcesoEstado } from '../enums/proceso-estado';

export interface IProceso {
  id?: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  estado: ProcesoEstado;
  empresaId: number;
  activo?: boolean;
  fechaCreacion?: Date;
  fechaModificacion?: Date;
}

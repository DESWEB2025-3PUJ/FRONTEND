import { TipoActividad } from '../enums/tipo-actividad';

export interface IActividad {
  id?: number;
  nombre: string;
  tipo: TipoActividad;
  descripcion: string;
  roleId: number;
  procesoId: number;
  duracionEstimada?: number;
  instrucciones?: string;
  posicionX?: number;
  posicionY?: number;
  activo?: boolean;
  fechaCreacion?: Date;
}

import { IActividad } from './actividad.interface';
import { TipoActividad } from '../enums/tipo-actividad';

export class Actividad implements IActividad {
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

  constructor(data?: Partial<IActividad> | any) {
    this.id = data?.id;
    // Acepta tanto 'nombre' (frontend) como 'name' (backend)
    this.nombre = data?.nombre || data?.name || '';
    // Acepta tanto 'tipo' directo como 'type' del backend
    this.tipo = data?.tipo || data?.type || TipoActividad.TAREA;
    // Acepta tanto 'descripcion' (frontend) como 'description' (backend)
    this.descripcion = data?.descripcion || data?.description || '';
    this.roleId = data?.roleId || 0;
    // Acepta tanto 'procesoId' como 'processId'
    this.procesoId = data?.procesoId || data?.processId || 0;
    this.duracionEstimada = data?.duracionEstimada || 30;
    this.instrucciones = data?.instrucciones || '';
    this.posicionX = data?.posicionX;
    this.posicionY = data?.posicionY;
    this.activo = data?.activo ?? true;
    this.fechaCreacion = data?.fechaCreacion ? new Date(data.fechaCreacion) : undefined;
  }
}

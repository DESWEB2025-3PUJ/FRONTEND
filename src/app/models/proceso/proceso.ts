import { IProceso } from './proceso.interface';
import { ProcesoEstado } from '../enums/proceso-estado';

export class Proceso implements IProceso {
  id?: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  estado: ProcesoEstado;
  empresaId: number;
  activo?: boolean;
  fechaCreacion?: Date;
  fechaModificacion?: Date;

  constructor(data?: Partial<IProceso> | any) {
    this.id = data?.id;
    // Acepta tanto 'nombre' (frontend) como 'name' (backend)
    this.nombre = data?.nombre || data?.name || '';
    // Acepta tanto 'descripcion' (frontend) como 'description' (backend)
    this.descripcion = data?.descripcion || data?.description || '';
    this.categoria = data?.categoria || '';
    // Acepta tanto 'estado' directo como 'status' del backend
    this.estado = data?.estado || data?.status || ProcesoEstado.BORRADOR;
    // El backend no envía empresaId directamente, lo tomamos del usuario actual
    this.empresaId = data?.empresaId || data?.roleId || 0;
    this.activo = data?.activo ?? true;
    this.fechaCreacion = data?.fechaCreacion ? new Date(data.fechaCreacion) : undefined;
    this.fechaModificacion = data?.fechaModificacion ? new Date(data.fechaModificacion) : undefined;
  }
}

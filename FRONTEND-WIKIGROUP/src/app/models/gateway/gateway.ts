import { IGateway } from './gateway.interface';
import { TipoGateway } from '../enums/tipo-gateway';

export class Gateway implements IGateway {
  id?: number;
  nombre: string;
  tipo: TipoGateway;
  descripcion: string;
  procesoId: number;
  posicionX?: number;
  posicionY?: number;
  activo?: boolean;
  fechaCreacion?: Date;

  constructor(data?: Partial<IGateway>) {
    this.id = data?.id;
    this.nombre = data?.nombre || '';
    this.tipo = data?.tipo || TipoGateway.EXCLUSIVO;
    this.descripcion = data?.descripcion || '';
    this.procesoId = data?.procesoId || 0;
    this.posicionX = data?.posicionX;
    this.posicionY = data?.posicionY;
    this.activo = data?.activo ?? true;
    this.fechaCreacion = data?.fechaCreacion ? new Date(data.fechaCreacion) : undefined;
  }
}

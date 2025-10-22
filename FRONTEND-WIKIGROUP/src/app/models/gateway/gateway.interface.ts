import { TipoGateway } from '../enums/tipo-gateway';

export interface IGateway {
  id?: number;
  nombre: string;
  tipo: TipoGateway;
  descripcion: string;
  procesoId: number;
  posicionX?: number;
  posicionY?: number;
  activo?: boolean;
  fechaCreacion?: Date;
}

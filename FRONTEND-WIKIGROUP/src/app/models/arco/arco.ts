import { IArco } from './arco.interface';

export class Arco implements IArco {
  id?: number;
  nombre?: string;
  actividadOrigenId?: number;
  actividadDestinoId?: number;
  gatewayOrigenId?: number;
  gatewayDestinoId?: number;
  procesoId: number;
  condicion?: string;
  activo?: boolean;
  fechaCreacion?: Date;

  constructor(data?: Partial<IArco>) {
    this.id = data?.id;
    this.nombre = data?.nombre;
    this.actividadOrigenId = data?.actividadOrigenId;
    this.actividadDestinoId = data?.actividadDestinoId;
    this.gatewayOrigenId = data?.gatewayOrigenId;
    this.gatewayDestinoId = data?.gatewayDestinoId;
    this.procesoId = data?.procesoId || 0;
    this.condicion = data?.condicion;
    this.activo = data?.activo ?? true;
    this.fechaCreacion = data?.fechaCreacion ? new Date(data.fechaCreacion) : undefined;
  }
}

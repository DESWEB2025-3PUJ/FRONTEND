export interface IArco {
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
}

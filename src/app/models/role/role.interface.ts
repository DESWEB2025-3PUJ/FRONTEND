export interface IRole {
  id?: number;
  nombre: string;
  descripcion: string;
  empresaId: number;
  activo?: boolean;
  fechaCreacion?: Date;
}

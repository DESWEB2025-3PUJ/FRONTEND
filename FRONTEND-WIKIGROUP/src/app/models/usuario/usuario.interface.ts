import { UsuarioRol } from '../enums/usuario-rol';

export interface IUsuario {
  id?: number;
  nombre: string;
  correo: string;
  password?: string;
  rol: UsuarioRol;
  empresaId: number;
  activo?: boolean;
  fechaCreacion?: Date;
}

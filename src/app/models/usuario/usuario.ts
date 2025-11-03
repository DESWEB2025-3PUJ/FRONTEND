import { IUsuario } from './usuario.interface';
import { UsuarioRol } from '../enums/usuario-rol';

export class Usuario implements IUsuario {
  id?: number;
  nombre: string;
  correo: string;
  password?: string;
  rol: UsuarioRol;
  empresaId: number;
  activo?: boolean;
  fechaCreacion?: Date;

  constructor(data?: Partial<IUsuario>) {
    this.id = data?.id;
    this.nombre = data?.nombre || '';
    this.correo = data?.correo || '';
    this.password = data?.password;
    this.rol = data?.rol || UsuarioRol.SOLO_LECTURA;
    this.empresaId = data?.empresaId || 0;
    this.activo = data?.activo ?? true;
    this.fechaCreacion = data?.fechaCreacion ? new Date(data.fechaCreacion) : undefined;
  }
}

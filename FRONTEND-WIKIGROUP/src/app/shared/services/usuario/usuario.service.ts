import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Usuario } from '../../../models';
import { environment } from '../../../../environments/environment.development';
import { ErrorHandlerService } from '../http/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  
  private http = inject(HttpClient);
  private errorHandler = inject(ErrorHandlerService);
  private apiUrl = `${environment.apiUrl}/usuarios`;

  getUsuarios(): Observable<Usuario[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(usuarios => usuarios.map(usuario => new Usuario(usuario))),
      catchError(this.errorHandler.handleError)
    );
  }

  getUsuario(id: number): Observable<Usuario> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(usuario => new Usuario(usuario)),
      catchError(this.errorHandler.handleError)
    );
  }

  createUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<any>(this.apiUrl, usuario).pipe(
      map(response => new Usuario(response)),
      catchError(this.errorHandler.handleError)
    );
  }

  updateUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, usuario).pipe(
      map(response => new Usuario(response)),
      catchError(this.errorHandler.handleError)
    );
  }

  deleteUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  getUsuariosByEmpresa(empresaId: number): Observable<Usuario[]> {
    return this.http.get<any[]>(`${this.apiUrl}/empresa/${empresaId}`).pipe(
      map(usuarios => usuarios.map(usuario => new Usuario(usuario))),
      catchError(this.errorHandler.handleError)
    );
  }

  inviteUsuario(correo: string, empresaId: number, rol: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/invitar`, { correo, empresaId, rol }).pipe(
      catchError(this.errorHandler.handleError)
    );
  }
}

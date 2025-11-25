import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Proceso } from '../../../models';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../http/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ProcesoService {
  
  private http = inject(HttpClient);
  private errorHandler = inject(ErrorHandlerService);
  private apiUrl = `${environment.apiUrl}/procesos`;

  getProcesos(): Observable<Proceso[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(procesos => procesos.map(proceso => new Proceso(proceso))),
      catchError(this.errorHandler.handleError)
    );
  }

  getProceso(id: number): Observable<Proceso> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(proceso => new Proceso(proceso)),
      catchError(this.errorHandler.handleError)
    );
  }

  createProceso(proceso: Proceso): Observable<Proceso> {
    // Transformar campos español -> inglés para el backend
    const backendData = {
      name: proceso.nombre,
      description: proceso.descripcion,
      status: proceso.estado,
      categoria: proceso.categoria,
      estado: proceso.estado,
      roleId: proceso.empresaId // El backend usa roleId en lugar de empresaId
    };
    
    return this.http.post<any>(this.apiUrl, backendData).pipe(
      map(response => new Proceso(response)),
      catchError(this.errorHandler.handleError)
    );
  }

  updateProceso(id: number, proceso: Proceso): Observable<Proceso> {
    // Transformar campos español -> inglés para el backend
    const backendData = {
      name: proceso.nombre,
      description: proceso.descripcion,
      status: proceso.estado,
      categoria: proceso.categoria,
      estado: proceso.estado,
      roleId: proceso.empresaId // El backend usa roleId en lugar de empresaId
    };
    
    return this.http.put<any>(`${this.apiUrl}/${id}`, backendData).pipe(
      map(response => new Proceso(response)),
      catchError(this.errorHandler.handleError)
    );
  }

  deleteProceso(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  getProcesosByEmpresa(empresaId: number): Observable<Proceso[]> {
    return this.http.get<any[]>(`${this.apiUrl}/empresa/${empresaId}`).pipe(
      map(procesos => procesos.map(proceso => new Proceso(proceso))),
      catchError(this.errorHandler.handleError)
    );
  }

  searchProcesos(nombre: string, categoria?: string, estado?: string): Observable<Proceso[]> {
    let url = `${this.apiUrl}/buscar?nombre=${nombre}`;
    if (categoria) url += `&categoria=${categoria}`;
    if (estado) url += `&estado=${estado}`;
    
    return this.http.get<any[]>(url).pipe(
      map(procesos => procesos.map(proceso => new Proceso(proceso))),
      catchError(this.errorHandler.handleError)
    );
  }

  getProcesoCompleto(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/completo`).pipe(
      catchError(this.errorHandler.handleError)
    );
  }
}

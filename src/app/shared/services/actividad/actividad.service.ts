import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Actividad } from '../../../models';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../http/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ActividadService {
  
  private http = inject(HttpClient);
  private errorHandler = inject(ErrorHandlerService);
  private apiUrl = `${environment.apiUrl}/activities`;

  getActividades(): Observable<Actividad[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(actividades => actividades.map(actividad => new Actividad(actividad))),
      catchError(this.errorHandler.handleError)
    );
  }

  getActividad(id: number): Observable<Actividad> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(actividad => new Actividad(actividad)),
      catchError(this.errorHandler.handleError)
    );
  }

  createActividad(actividad: Actividad): Observable<Actividad> {
    // Transformar campos español -> inglés para el backend
    const backendData = {
      name: actividad.nombre,
      type: actividad.tipo,
      description: actividad.descripcion,
      roleId: actividad.roleId,
      processId: actividad.procesoId,
      duracionEstimada: actividad.duracionEstimada,
      instrucciones: actividad.instrucciones,
      posicionX: actividad.posicionX,
      posicionY: actividad.posicionY
    };
    
    return this.http.post<any>(this.apiUrl, backendData).pipe(
      map(response => new Actividad(response)),
      catchError(this.errorHandler.handleError)
    );
  }

  updateActividad(id: number, actividad: Actividad): Observable<Actividad> {
    // Transformar campos español -> inglés para el backend
    const backendData = {
      name: actividad.nombre,
      type: actividad.tipo,
      description: actividad.descripcion,
      roleId: actividad.roleId,
      processId: actividad.procesoId,
      duracionEstimada: actividad.duracionEstimada,
      instrucciones: actividad.instrucciones,
      posicionX: actividad.posicionX,
      posicionY: actividad.posicionY
    };
    
    return this.http.put<any>(`${this.apiUrl}/${id}`, backendData).pipe(
      map(response => new Actividad(response)),
      catchError(this.errorHandler.handleError)
    );
  }

  deleteActividad(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  getActividadesByProceso(procesoId: number): Observable<Actividad[]> {
    return this.http.get<any[]>(`${this.apiUrl}/process/${procesoId}`).pipe(
      map(actividades => actividades.map(actividad => new Actividad(actividad))),
      catchError(this.errorHandler.handleError)
    );
  }

  getActividadesByRole(roleId: number): Observable<Actividad[]> {
    return this.http.get<any[]>(`${this.apiUrl}/role/${roleId}`).pipe(
      map(actividades => actividades.map(actividad => new Actividad(actividad))),
      catchError(this.errorHandler.handleError)
    );
  }
}

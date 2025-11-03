import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Arco } from '../../../models';
import { environment } from '../../../../environments/environment.development';
import { ErrorHandlerService } from '../http/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ArcoService {
  
  private http = inject(HttpClient);
  private errorHandler = inject(ErrorHandlerService);
  private apiUrl = `${environment.apiUrl}/edges`;

  getArcos(): Observable<Arco[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(arcos => arcos.map(arco => new Arco(arco))),
      catchError(this.errorHandler.handleError)
    );
  }

  getArco(id: number): Observable<Arco> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(arco => new Arco(arco)),
      catchError(this.errorHandler.handleError)
    );
  }

  createArco(arco: Arco): Observable<Arco> {
    return this.http.post<any>(this.apiUrl, arco).pipe(
      map(response => new Arco(response)),
      catchError(this.errorHandler.handleError)
    );
  }

  updateArco(id: number, arco: Arco): Observable<Arco> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, arco).pipe(
      map(response => new Arco(response)),
      catchError(this.errorHandler.handleError)
    );
  }

  deleteArco(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  getArcosByProceso(procesoId: number): Observable<Arco[]> {
    return this.http.get<any[]>(`${this.apiUrl}/process/${procesoId}`).pipe(
      map(arcos => arcos.map(arco => new Arco(arco))),
      catchError(this.errorHandler.handleError)
    );
  }
}

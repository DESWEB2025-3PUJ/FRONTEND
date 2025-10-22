import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Gateway } from '../../../models';
import { environment } from '../../../../environments/environment.development';
import { ErrorHandlerService } from '../http/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class GatewayService {
  
  private http = inject(HttpClient);
  private errorHandler = inject(ErrorHandlerService);
  private apiUrl = `${environment.apiUrl}/compuertas`;

  getGateways(): Observable<Gateway[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(gateways => gateways.map(gateway => new Gateway(gateway))),
      catchError(this.errorHandler.handleError)
    );
  }

  getGateway(id: number): Observable<Gateway> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(gateway => new Gateway(gateway)),
      catchError(this.errorHandler.handleError)
    );
  }

  createGateway(gateway: Gateway): Observable<Gateway> {
    return this.http.post<any>(this.apiUrl, gateway).pipe(
      map(response => new Gateway(response)),
      catchError(this.errorHandler.handleError)
    );
  }

  updateGateway(id: number, gateway: Gateway): Observable<Gateway> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, gateway).pipe(
      map(response => new Gateway(response)),
      catchError(this.errorHandler.handleError)
    );
  }

  deleteGateway(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  getGatewaysByProceso(procesoId: number): Observable<Gateway[]> {
    return this.http.get<any[]>(`${this.apiUrl}/process/${procesoId}`).pipe(
      map(gateways => gateways.map(gateway => new Gateway(gateway))),
      catchError(this.errorHandler.handleError)
    );
  }
}

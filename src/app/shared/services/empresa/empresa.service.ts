import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Empresa } from '../../../models';
import { environment } from '../../../../environments/environment';
import { ErrorHandlerService } from '../http/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  
  private http = inject(HttpClient);
  private errorHandler = inject(ErrorHandlerService);
  private apiUrl = `${environment.apiUrl}/empresas`;

  getEmpresas(): Observable<Empresa[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(empresas => empresas.map(empresa => new Empresa(empresa))),
      catchError(this.errorHandler.handleError)
    );
  }

  getEmpresa(id: number): Observable<Empresa> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(empresa => new Empresa(empresa)),
      catchError(this.errorHandler.handleError)
    );
  }

  createEmpresa(empresa: Empresa): Observable<Empresa> {
    return this.http.post<any>(this.apiUrl, empresa).pipe(
      map(response => new Empresa(response)),
      catchError(this.errorHandler.handleError)
    );
  }

  updateEmpresa(id: number, empresa: Empresa): Observable<Empresa> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, empresa).pipe(
      map(response => new Empresa(response)),
      catchError(this.errorHandler.handleError)
    );
  }

  deleteEmpresa(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  searchEmpresas(nombre: string): Observable<Empresa[]> {
    return this.http.get<any[]>(`${this.apiUrl}/buscar?nombre=${nombre}`).pipe(
      map(empresas => empresas.map(empresa => new Empresa(empresa))),
      catchError(this.errorHandler.handleError)
    );
  }
}

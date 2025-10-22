import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Role } from '../../../models';
import { environment } from '../../../../environments/environment.development';
import { ErrorHandlerService } from '../http/error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  
  private http = inject(HttpClient);
  private errorHandler = inject(ErrorHandlerService);
  private apiUrl = `${environment.apiUrl}/roles`;

  getRoles(): Observable<Role[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(roles => roles.map(role => new Role(role))),
      catchError(this.errorHandler.handleError)
    );
  }

  getRole(id: number): Observable<Role> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(role => new Role(role)),
      catchError(this.errorHandler.handleError)
    );
  }

  createRole(role: Role): Observable<Role> {
    return this.http.post<any>(this.apiUrl, role).pipe(
      map(response => new Role(response)),
      catchError(this.errorHandler.handleError)
    );
  }

  updateRole(id: number, role: Role): Observable<Role> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, role).pipe(
      map(response => new Role(response)),
      catchError(this.errorHandler.handleError)
    );
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.errorHandler.handleError)
    );
  }

  getRolesByEmpresa(empresaId: number): Observable<Role[]> {
    return this.http.get<any[]>(`${this.apiUrl}/empresa/${empresaId}`).pipe(
      map(roles => roles.map(role => new Role(role))),
      catchError(this.errorHandler.handleError)
    );
  }

  getRoleUsage(roleId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${roleId}/uso`).pipe(
      catchError(this.errorHandler.handleError)
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConfigurarClimaDto, RespuestaClimaDto } from 'src/app/models/Clima/clima.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClimaService {
  private apiUrl = environment.url_ms_business;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  obtenerConfiguracion(): Observable<ConfigurarClimaDto> {
    return this.http.get<ConfigurarClimaDto>(`${this.apiUrl}/clima/configuracion`, {
      headers: this.getHeaders()
    });
  }

  guardarConfiguracion(dto: ConfigurarClimaDto): Observable<RespuestaClimaDto> {
    return this.http.post<RespuestaClimaDto>(`${this.apiUrl}/clima/configurar`, dto, {
      headers: this.getHeaders()
    });
  }

  forzarVerificacion(): Observable<any> {
    return this.http.post(`${this.apiUrl}/clima/verificar`, {}, { headers: this.getHeaders() });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardBusesService {
  private apiUrl = `${environment.url_ms_business}/dashboard-buses`;

  constructor(private http: HttpClient) {}

  getDashboardData(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  getDetalleBus(busId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/bus/${busId}`);
  }
}

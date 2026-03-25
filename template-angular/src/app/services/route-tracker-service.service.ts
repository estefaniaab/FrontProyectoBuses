// src/app/services/route-tracker.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouteTrackerService {
  private routeCount: Record<string, number> = {};
  private mostVisitedSubject = new BehaviorSubject<string>('');
  mostVisitedRoute$ = this.mostVisitedSubject.asObservable();

  track(route: string) {
    this.routeCount[route] = (this.routeCount[route] || 0) + 1;

    const mostVisited = Object.entries(this.routeCount).reduce(
      (max, current) => current[1] > max[1] ? current : max,
      ['', 0]
    )[0];

    this.mostVisitedSubject.next(mostVisited);
  }
}

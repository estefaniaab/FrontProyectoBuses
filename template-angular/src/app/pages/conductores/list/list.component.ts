import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Conductor } from "src/app/models/Conductores/conductor.model";
import { User } from "src/app/models/Users/user.model";
import { ConductoresService } from "src/app/services/Conductores/conductores.service";

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  conductores: any[] = [];
  loading = false;

  constructor(
    private conductoresService: ConductoresService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.list();
  }

  /**
   * Fetch and cross-reference data from both microservices
   */
  list(): void {
    this.loading = true;

    forkJoin({
      driversList: this.conductoresService.findAll(),
      usersList: this.conductoresService.getUsers()
    }).subscribe({
      next: ({ driversList, usersList }) => {
        this.conductores = driversList.map(driver => {
          // Compare using strings to avoid TS2367 type overlap error
          const userFound = usersList.find(
            u => String(u.id) === String(driver.userId)
          );

          return {
            ...driver,
            user: userFound
          };
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching data from microservices', err);
        this.loading = false;
      }
    });
  }

  delete(id: number): void {
    if (confirm('Are you sure you want to delete this driver?')) {
      this.conductoresService.remove(id).subscribe({
        next: () => {
          this.list(); // Refresh the list
        },
        error: (err) => alert('Delete error: ' + (err.error.message || 'Unknown error'))
      });
    }
  }

  // --- Navigation Methods ---

  create(): void {
    this.router.navigate(['/conductores/create']);
  }

  update(id: number): void {
    this.router.navigate(['/conductores/update', id]);
  }

  view(id: number): void {
    this.router.navigate(['/conductores/view', id]);
  }
}

import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';
import { Boleto }            from 'src/app/models/Boletos/boleto.model';
import { BoletosService }    from 'src/app/services/Boletos/boletos.service';
import Swal                  from 'sweetalert2';

@Component({
  selector:    'app-list',
  templateUrl: './list.component.html',
  styleUrls:   ['./list.component.scss'],
})
export class ListComponent implements OnInit {
  boletos: Boleto[] = [];
  ciudadanoId?: number;

  constructor(private service: BoletosService, private router: Router) {}

  ngOnInit(): void { this.resolverCiudadano(); }

  private resolverCiudadano(): void {
    // Busca en todas las claves del localStorage
    let usuarioId: string | null = null;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const raw = localStorage.getItem(key || '');
      console.log(`localStorage[${key}]:`, raw); // ← VER TODAS LAS CLAVES
      try {
        const obj = JSON.parse(raw || '{}');
        if (obj?.id && obj?.token) {
          usuarioId = obj.id;
          console.log('Encontrado usuarioId en clave:', key, '→', usuarioId);
          break;
        }
      } catch { }
    }

    if (!usuarioId) {
      console.error('No se encontró usuarioId en ninguna clave del localStorage');
      return;
    }

    this.service.getCiudadanoByUsuarioId(usuarioId).subscribe({
      next: (c) => { this.ciudadanoId = c.id; this.list(); },
      error: (err) => console.error('Error al obtener ciudadano', err),
    });
  }

  list(): void {
    console.log('list() con ciudadanoId:', this.ciudadanoId); // ← VER SI LLEGA
    if (!this.ciudadanoId) return;
    this.service.findByCiudadano(this.ciudadanoId).subscribe({
      next:  (data) => {
        console.log('boletos recibidos:', data); // ← VER LA RESPUESTA
        this.boletos = data;
      },
      error: (err) => console.error('Error al obtener boletos', err),
    });
  }


  irADescender(boleto: Boleto): void {
    this.router.navigate(['/boletos/descender', boleto.id]);
  }

  estadoBadge(estado?: string): string {
    const map: Record<string, string> = {
      activo:     'badge-success',
      completado: 'badge-secondary',
      cancelado:  'badge-danger',
    };
    return estado ? (map[estado] ?? 'badge-light') : 'badge-light';
  }
}

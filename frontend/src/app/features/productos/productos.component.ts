import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { PedidoService } from '../pedidos/pedido.service';
import { Producto, ProductoService } from './producto.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Productos</h2>

    <div class="error" *ngIf="error">{{ error }}</div>
    <p class="info" *ngIf="cargando">Cargando productos...</p>
    <p class="info" *ngIf="!cargando && !error && productos.length === 0">
      No hay productos disponibles.
    </p>

    <div class="grid">
      <div class="card producto-card" *ngFor="let p of productos">
        <h3>{{ p.nombre }}</h3>
        <div class="desc">{{ p.descripcion }}</div>
        <div class="precio">{{ p.precio | currency: 'CLP':'symbol-narrow':'1.0-0' }}</div>
        <div class="stock">Stock: {{ p.stock }}</div>
        <button
          class="btn btn-primary"
          (click)="comprar(p)"
          [disabled]="p.stock <= 0 || comprandoId === p.id"
        >
          {{ p.stock <= 0 ? 'Sin stock' : comprandoId === p.id ? 'Comprando...' : 'Comprar' }}
        </button>
        <button
          class="btn btn-danger"
          (click)="eliminar(p)"
          [disabled]="eliminandoId === p.id"
        >
          {{ eliminandoId === p.id ? 'Eliminando...' : 'Eliminar' }}
        </button>
      </div>
    </div>
  `,
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  cargando = true;
  error = '';
  comprandoId: number | null = null;
  eliminandoId: number | null = null;

  constructor(
    private productoService: ProductoService,
    private pedidoService: PedidoService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.productoService.listar().subscribe({
      next: (data) => {
        this.productos = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.error = this.mensajeError(err, 'No se pudieron cargar los productos');
        this.cargando = false;
      },
    });
  }

  async comprar(p: Producto): Promise<void> {
    if (p.id == null) {
      return;
    }
    this.error = '';
    this.comprandoId = p.id;

    const clienteId = await this.auth.getClienteId();
    if (!clienteId) {
      this.error = 'No se pudo identificar al usuario. Vuelve a iniciar sesión.';
      this.comprandoId = null;
      return;
    }

    this.pedidoService
      .crear({ clienteId, items: [{ productoId: p.id, cantidad: 1 }] })
      .subscribe({
        next: () => {
          this.comprandoId = null;
          this.router.navigate(['/pedidos']);
        },
        error: (err) => {
          console.error(err);
          this.comprandoId = null;
          this.error = this.mensajeError(err, 'No se pudo crear el pedido');
        },
      });
  }

  eliminar(p: Producto): void {
    if (p.id == null) {
      return;
    }
    if (!confirm(`¿Eliminar el producto "${p.nombre}"?`)) {
      return;
    }
    this.error = '';
    this.eliminandoId = p.id;

    this.productoService.eliminar(p.id).subscribe({
      next: () => {
        this.productos = this.productos.filter((x) => x.id !== p.id);
        this.eliminandoId = null;
      },
      error: (err) => {
        console.error(err);
        this.eliminandoId = null;
        this.error = this.mensajeError(err, 'No se pudo eliminar el producto');
      },
    });
  }

  private mensajeError(err: any, base: string): string {
    if (err?.status === 0) {
      return `${base}: no hay respuesta del servidor (revisa CORS o que la EC2 esté encendida).`;
    }
    if (err?.status === 401) {
      return `${base}: sesión no autorizada (401). Cierra sesión y vuelve a entrar.`;
    }
    if (err?.status === 404) {
      return `${base}: el producto ya no existe (404).`;
    }
    return `${base} (HTTP ${err?.status ?? '?'}).`;
  }
}
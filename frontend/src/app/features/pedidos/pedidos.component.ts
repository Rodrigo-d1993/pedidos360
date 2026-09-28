import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { ProductoService } from '../productos/producto.service';
import { Pedido, PedidoService } from './pedido.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Mis pedidos</h2>

    <div class="error" *ngIf="error">{{ error }}</div>
    <p class="info" *ngIf="cargando">Cargando pedidos...</p>
    <p class="info" *ngIf="!cargando && !error && pedidos.length === 0">
      Aún no tienes pedidos. Ve a Productos y compra alguno.
    </p>

    <div class="card pedido-card" *ngFor="let p of pedidos">
      <div class="pedido-head">
        <div>
          <strong>Pedido #{{ p.id }}</strong>
          <div class="fecha">{{ p.fecha | date: 'dd/MM/yyyy HH:mm' }}</div>
        </div>
        <span class="badge">{{ p.estado }}</span>
      </div>

      <table class="tabla">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio unitario</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let i of p.items">
            <td>{{ nombreProducto(i.productoId) }}</td>
            <td>{{ i.cantidad }}</td>
            <td>{{ i.precioUnitario ?? 0 | currency: 'CLP':'symbol-narrow':'1.0-0' }}</td>
            <td>{{ (i.precioUnitario ?? 0) * i.cantidad | currency: 'CLP':'symbol-narrow':'1.0-0' }}</td>
          </tr>
        </tbody>
      </table>

      <div class="total">Total: {{ total(p) | currency: 'CLP':'symbol-narrow':'1.0-0' }}</div>
    </div>
  `,
})
export class PedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  cargando = true;
  error = '';
  private nombres = new Map<number, string>();

  constructor(
    private pedidoService: PedidoService,
    private productoService: ProductoService,
    private auth: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    const clienteId = await this.auth.getClienteId();
    if (!clienteId) {
      this.error = 'No se pudo identificar al usuario. Vuelve a iniciar sesión.';
      this.cargando = false;
      return;
    }

    // Para mostrar el nombre del producto en vez de solo su id (si falla, se muestra "Producto #id")
    this.productoService.listar().subscribe({
      next: (ps) => ps.forEach((pr) => pr.id != null && this.nombres.set(pr.id, pr.nombre)),
      error: (err) => console.error(err),
    });

    this.pedidoService.listarPorCliente(clienteId).subscribe({
      next: (data) => {
        this.pedidos = [...data].sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.error =
          err?.status === 0
            ? 'No hay respuesta del servidor (revisa CORS o que la EC2 esté encendida).'
            : err?.status === 401
              ? 'Sesión no autorizada (401). Cierra sesión y vuelve a entrar.'
              : `No se pudieron cargar los pedidos (HTTP ${err?.status ?? '?'}).`;
        this.cargando = false;
      },
    });
  }

  nombreProducto(id: number): string {
    return this.nombres.get(id) ?? `Producto #${id}`;
  }

  total(p: Pedido): number {
    return p.items.reduce((suma, i) => suma + (i.precioUnitario ?? 0) * i.cantidad, 0);
  }
}
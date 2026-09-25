import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Pedido, PedidoService } from './pedido.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Mis pedidos</h2>
    <ul>
      <li *ngFor="let p of pedidos">
        Pedido #{{ p.id }} — {{ p.estado }} ({{ p.items.length }} item(s))
      </li>
    </ul>
  `,
})
export class PedidosComponent implements OnInit {
  pedidos: Pedido[] = [];

  constructor(private pedidoService: PedidoService, private auth: AuthService) {}

  async ngOnInit(): Promise<void> {
    const clienteId = await this.auth.getClienteId();
    if (clienteId) {
      this.pedidoService.listarPorCliente(clienteId).subscribe((data) => (this.pedidos = data));
    }
  }
}

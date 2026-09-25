import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DetallePedido {
  productoId: number;
  cantidad: number;
}

export interface Pedido {
  id?: number;
  clienteId: string;
  estado?: string;
  items: DetallePedido[];
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private baseUrl = `${environment.pedidosBaseUrl}/api/pedidos`;

  constructor(private http: HttpClient) {}

  listarPorCliente(clienteId: string): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.baseUrl, { params: { clienteId } });
  }

  crear(pedido: Pedido): Observable<Pedido> {
    return this.http.post<Pedido>(this.baseUrl, pedido);
  }
}

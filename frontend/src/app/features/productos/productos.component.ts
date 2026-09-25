import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Producto, ProductoService } from './producto.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Productos</h2>
    <ul>
      <li *ngFor="let p of productos">
        {{ p.nombre }} — {{ p.precio | number }} (stock: {{ p.stock }})
      </li>
    </ul>
  `,
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];

  constructor(private productoService: ProductoService) {}

  ngOnInit(): void {
    this.productoService.listar().subscribe((data) => (this.productos = data));
  }
}

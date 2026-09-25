package cl.duoc.pedidos360_backend.productos.repository;

import cl.duoc.pedidos360_backend.productos.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
}

package cl.duoc.pedidos360_backend.pedidos.repository;

import cl.duoc.pedidos360_backend.pedidos.entity.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByClienteId(String clienteId);
}

package cl.duoc.pedidos360_backend.pedidos.service;

import cl.duoc.pedidos360_backend.pedidos.client.ProductoClient;
import cl.duoc.pedidos360_backend.pedidos.client.ProductoDTO;
import cl.duoc.pedidos360_backend.pedidos.entity.DetallePedido;
import cl.duoc.pedidos360_backend.pedidos.entity.Pedido;
import cl.duoc.pedidos360_backend.pedidos.repository.PedidoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ProductoClient productoClient;

    public PedidoService(PedidoRepository pedidoRepository, ProductoClient productoClient) {
        this.pedidoRepository = pedidoRepository;
        this.productoClient = productoClient;
    }

    public List<Pedido> listarPorCliente(String clienteId) {
        return pedidoRepository.findByClienteId(clienteId);
    }

    public Optional<Pedido> buscarPorId(Long id) {
        return pedidoRepository.findById(id);
    }

    public Pedido crear(Pedido pedido) {
        // Por cada item, se consulta ms-productos para validar existencia y tomar el precio real
        for (DetallePedido item : pedido.getItems()) {
            ProductoDTO producto = productoClient.obtenerProducto(item.getProductoId());
            if (producto == null) {
                throw new IllegalArgumentException("Producto " + item.getProductoId() + " no existe");
            }
            if (producto.getStock() < item.getCantidad()) {
                throw new IllegalArgumentException("Stock insuficiente para el producto " + producto.getNombre());
            }
            item.setPrecioUnitario(producto.getPrecio());
            item.setPedido(pedido);
        }
        return pedidoRepository.save(pedido);
    }

    public Optional<Pedido> actualizarEstado(Long id, String estado) {
        return pedidoRepository.findById(id).map(pedido -> {
            pedido.setEstado(estado);
            return pedidoRepository.save(pedido);
        });
    }
}

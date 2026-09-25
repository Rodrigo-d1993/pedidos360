package cl.duoc.pedidos360_backend.pedidos.controller;

import cl.duoc.pedidos360_backend.pedidos.entity.Pedido;
import cl.duoc.pedidos360_backend.pedidos.service.PedidoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    // clienteId llega desde el frontend (extraído del ID token de Cognito).
    // La validación de que el token es auténtico la hace API Gateway con el JWT Authorizer,
    // no este microservicio (según lo indicado por el docente para esta etapa).
    @GetMapping
    public List<Pedido> listarPorCliente(@RequestParam String clienteId) {
        return pedidoService.listarPorCliente(clienteId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> buscarPorId(@PathVariable Long id) {
        return pedidoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Pedido crear(@Valid @RequestBody Pedido pedido) {
        return pedidoService.crear(pedido);
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Pedido> actualizarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return pedidoService.actualizarEstado(id, body.get("estado"))
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}

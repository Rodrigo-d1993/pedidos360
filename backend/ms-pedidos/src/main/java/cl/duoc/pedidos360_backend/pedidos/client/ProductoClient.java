package cl.duoc.pedidos360_backend.pedidos.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Component
public class ProductoClient {

    private final RestTemplate restTemplate;

    @Value("${productos.service.url}")
    private String productosServiceUrl;

    public ProductoClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public ProductoDTO obtenerProducto(Long productoId) {
        try {
            return restTemplate.getForObject(productosServiceUrl + "/api/productos/" + productoId, ProductoDTO.class);
        } catch (RestClientException e) {
            throw new IllegalStateException("No se pudo obtener el producto " + productoId + " desde ms-productos", e);
        }
    }
}

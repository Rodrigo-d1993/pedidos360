# Pedidos360 — EP1 DSY1107

Proyecto de la asignatura **DSY1107 Desarrollo Cloud Native I** (Duoc UC).

Sistema de pedidos con arquitectura cloud native en AWS: frontend en Angular con login vía Amazon Cognito (Hosted UI + AWS Amplify), dos microservicios en Spring Boot desplegados en EC2, base de datos MySQL en Amazon RDS, y AWS API Gateway (REST API) como punto de entrada, con validación de identidad mediante un Cognito Authorizer (JWT).

## Arquitectura

```
Usuario → Angular (Amplify) → Cognito Hosted UI → ID Token (JWT)
                ↓
Angular → API Gateway (Cognito Authorizer) → EC2 → Spring Boot → RDS MySQL
```

- **Frontend (Angular 17, standalone):** login administrado por Cognito vía AWS Amplify (Authorization Code + PKCE). Un interceptor HTTP adjunta el token en cada llamada y un guard protege las rutas privadas, redirigiendo a `/login` si no hay sesión.
- **API Gateway:** actúa como API Manager. Valida el JWT con un Cognito Authorizer antes de dejar pasar cualquier request hacia el backend, y tiene CORS configurado para el origen del frontend.
- **Backend (Spring Boot, 2 microservicios):** exponen los endpoints de negocio y persisten en RDS MySQL. `ms-pedidos` consulta a `ms-productos` (RestTemplate) para validar existencia, stock y precio al crear un pedido.
- **Base de datos:** MySQL en Amazon RDS, una base por microservicio.

## Estructura

```
backend/ms-productos   → API de productos: listar, buscar, crear, actualizar y eliminar (puerto 8081)
backend/ms-pedidos     → API de pedidos: listar por cliente, buscar, crear y actualizar estado (puerto 8082)
frontend               → Angular 17 standalone, login vía Cognito Hosted UI + Amplify
```

## Funcionalidades del frontend

| Ruta | Descripción |
|---|---|
| `/login` | Pantalla de acceso con botón que redirige al Hosted UI de Cognito |
| `/productos` | Listado de productos en tarjetas. Permite **comprar** (crea un pedido de 1 unidad) y **eliminar** un producto |
| `/pedidos` | Pedidos del usuario autenticado, con fecha, estado, detalle por producto y total |

La barra superior muestra el correo del usuario y el botón para cerrar sesión. El `clienteId` de cada pedido corresponde al `sub` del usuario en Cognito.

## Endpoints expuestos en API Gateway (stage `test`)

Todas las rutas requieren el header `Authorization: Bearer <ID_TOKEN>`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/productos` | Listar productos |
| POST | `/api/productos` | Crear producto |
| DELETE | `/api/productos/{id}` | Eliminar producto |
| GET | `/api/pedidos?clienteId={sub}` | Listar pedidos de un cliente |
| POST | `/api/pedidos` | Crear pedido |

Ejemplo de body para `POST /api/productos`:

```json
{
  "nombre": "Mouse inalámbrico",
  "descripcion": "Mouse óptico inalámbrico 2.4GHz",
  "precio": 12990,
  "stock": 50
}
```

Ejemplo de body para `POST /api/pedidos`:

```json
{
  "clienteId": "<sub del usuario en Cognito>",
  "items": [
    { "productoId": 1, "cantidad": 2 }
  ]
}
```

El backend implementa además otros endpoints (por ejemplo `GET` y `PUT /api/productos/{id}`, `GET /api/pedidos/{id}` y `PATCH /api/pedidos/{id}/estado`) que se pueden exponer en API Gateway siguiendo el mismo procedimiento.

## Cómo correr localmente

Requisitos: Java 17, Maven, Node.js y Angular CLI.

### Backend

Necesitas MySQL local (o apunta las variables de entorno a tu RDS). Las bases `pedidos360_productos` y `pedidos360_pedidos` deben existir; las tablas las crea Hibernate al iniciar.

```
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=root
```

En cada carpeta de microservicio:

```
# backend/ms-productos
DB_NAME=pedidos360_productos mvn spring-boot:run

# backend/ms-pedidos
DB_NAME=pedidos360_pedidos PRODUCTOS_SERVICE_URL=http://localhost:8081 mvn spring-boot:run
```

Levanta primero `ms-productos`, porque `ms-pedidos` lo consulta al crear un pedido.

Cada microservicio incluye tests unitarios (`ProductoServiceTest`, `PedidoServiceTest`), ejecutables con `mvn test`.

### Frontend

```
cd frontend
npm install
npm start
```

Completa `src/environments/environment.ts` con los datos reales de tu Cognito User Pool (`userPoolId`, `userPoolClientId`, `domain`) y la Invoke URL de API Gateway (`apiBaseUrl`, `pedidosBaseUrl`, terminadas en `/test`, sin barra final). La aplicación queda en `http://localhost:4200`.

La app usa **AWS Amplify** (`aws-amplify/auth`) para el login vía Hosted UI de Cognito. Amplify procesa el retorno del login automáticamente en la URL configurada como `redirectSignIn`, así que no hace falta una ruta `/callback`. Esa URL (`http://localhost:4200/`) debe coincidir exactamente con las Allowed callback URLs y Allowed sign-out URLs del App Client.

## Despliegue en AWS

1. Crear el User Pool y un App Client público (sin client secret) en Amazon Cognito.
2. Configurar el dominio administrado y las callback / sign-out URLs hacia el frontend.
3. Crear la instancia de RDS MySQL y las dos bases de datos.
4. Generar los JAR con `mvn clean package -DskipTests` en cada microservicio y subirlos a un bucket de S3.
5. En la EC2, descargar los JAR usando el IAM Role de la instancia (sin credenciales estáticas) y ejecutarlos con las variables de entorno de conexión:

```
   DB_HOST=<endpoint-rds> DB_PORT=3306 DB_NAME=pedidos360_productos \
   DB_USER=<usuario> DB_PASSWORD='<password>' \
   nohup java -jar ms-productos-0.0.1-SNAPSHOT.jar > productos.log 2>&1 &

   DB_HOST=<endpoint-rds> DB_PORT=3306 DB_NAME=pedidos360_pedidos \
   DB_USER=<usuario> DB_PASSWORD='<password>' \
   PRODUCTOS_SERVICE_URL=http://localhost:8081 \
   nohup java -jar ms-pedidos-0.0.1-SNAPSHOT.jar > pedidos.log 2>&1 &
```

6. Abrir en el Security Group de la EC2 los puertos 8081 y 8082.
7. Crear la REST API en API Gateway, con los recursos `/api/productos`, `/api/productos/{id}` y `/api/pedidos`, integración HTTP Proxy hacia `http://<EC2_PUBLIC_IP>:8081` y `:8082`, según corresponda.
8. Configurar CORS para el origen del frontend (métodos GET, POST, DELETE y OPTIONS; headers `Content-Type` y `Authorization`).
9. Crear un Cognito Authorizer (token source `Authorization`) y asociarlo a cada método.
10. Hacer **Deploy API** al stage `test` y completar `environment.ts` con la Invoke URL resultante.

**Nota sobre el laboratorio:** al reiniciar la sesión del Learner Lab, la IP pública de la EC2 puede cambiar. En ese caso hay que actualizar la URL de integración en API Gateway, volver a desplegar la API y volver a levantar los microservicios.

## Alcance y límites conocidos

- **Validación del JWT:** se realiza únicamente en API Gateway mediante el Cognito Authorizer. Los microservicios no vuelven a validar el token: la capa de Defense in Depth (Spring Security como Resource Server) quedó fuera del alcance de esta etapa.
- **Acceso directo al backend:** como API Gateway usa una integración HTTP pública hacia la EC2, los puertos 8081 y 8082 están abiertos en el Security Group, por lo que el backend puede invocarse directamente sin pasar por API Gateway. Para un entorno productivo se recomendaría una integración privada (VPC Link) y validar el JWT también en el backend.
- **Token enviado por el frontend:** el interceptor adjunta el ID Token, válido para el Cognito Authorizer mientras los métodos no exijan custom scopes.
- **Permisos:** cualquier usuario autenticado puede crear y eliminar productos; no hay autorización por rol.

## Notas de configuración de repositorio

Cada subproyecto tiene su propio `.gitignore` (Java/Maven para los backends, Angular/Node para el frontend), de modo que `target/`, `node_modules/`, artefactos de IDE y archivos `.env` no se suben al repositorio. Las credenciales de base de datos se inyectan por variables de entorno y no quedan en el código versionado. Los identificadores de Cognito (User Pool ID, App Client ID y dominio) se configuran en `environment.ts`; no son secretos, ya que el App Client es público.
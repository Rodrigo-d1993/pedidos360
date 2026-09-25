# Pedidos360 — EP1 DSY1107

Sistema de pedidos con arquitectura cloud native en AWS: frontend en Angular con login vía Amazon Cognito (Hosted UI + AWS Amplify), dos microservicios en Spring Boot, base de datos MySQL en RDS, y AWS API Gateway como punto de entrada con validación de identidad mediante Cognito Authorizer (JWT).

## Arquitectura

```
Usuario → Angular (Amplify) → Cognito Hosted UI → ID Token (JWT)
                ↓
Angular → API Gateway (Cognito Authorizer) → EC2 → Spring Boot → RDS MySQL
```

- **Frontend (Angular 17, standalone):** login administrado por Cognito vía AWS Amplify (Authorization Code + PKCE). Un interceptor HTTP adjunta el token en cada llamada y un guard protege las rutas privadas.
- **API Gateway:** actúa como API Manager y valida el JWT con un Cognito Authorizer antes de dejar pasar cualquier request hacia el backend.
- **Backend (Spring Boot, 2 microservicios):** expone los endpoints de negocio y persiste en RDS MySQL. **La validación del JWT se realiza únicamente en API Gateway**; los microservicios no vuelven a validar el token — esta capa de Defense in Depth (Resource Server en Spring Security) se dejó fuera de alcance a pedido del docente, ya que no fue parte de la materia cubierta en clases.
- **Base de datos:** MySQL en Amazon RDS, una base por microservicio.

## Estructura
```
backend/ms-productos   → CRUD de productos (puerto 8081)
backend/ms-pedidos     → CRUD de pedidos, llama a ms-productos vía RestTemplate (puerto 8082)
frontend               → Angular 17 standalone, login vía Cognito Hosted UI + Amplify
```

## Cómo correr localmente

### Backend
Necesitas MySQL local (o cambia las variables de entorno a tu RDS):
```
DB_HOST=localhost DB_PORT=3306 DB_NAME=pedidos360_productos DB_USER=root DB_PASSWORD=root
```
En cada carpeta de microservicio:
```
mvn spring-boot:run
```
Cada microservicio incluye tests unitarios (`ProductoServiceTest`, `PedidoServiceTest`), ejecutables con `mvn test`.

### Frontend
```
cd frontend
npm install
npm start
```
Completa `src/environments/environment.ts` con los datos reales de tu Cognito User Pool (`userPoolId`, `userPoolClientId`, `domain`) y las URLs de API Gateway (`apiBaseUrl`, `pedidosBaseUrl`). La app usa **AWS Amplify** (`aws-amplify/auth`) para el login vía Hosted UI de Cognito — Amplify procesa el retorno del login automáticamente en la URL configurada como `redirectSignIn`, así que no hace falta una ruta `/callback`.

## Despliegue en AWS

1. Crear User Pool + App Client (público, sin client secret) en Amazon Cognito.
2. Configurar dominio administrado y callback/sign-out URLs hacia el frontend.
3. Desplegar `ms-productos` y `ms-pedidos` en EC2 (JAR distribuido vía S3 + IAM Role, sin credenciales estáticas).
4. Crear la API en API Gateway con integración HTTP hacia cada microservicio en EC2.
5. Configurar CORS para el origen del frontend.
6. Crear un Cognito Authorizer en API Gateway y asociarlo a las rutas protegidas.
7. Completar `environment.ts` con los datos finales de Cognito y las Invoke URLs de API Gateway.

## Notas de configuración de repositorio

Cada subproyecto tiene su propio `.gitignore` (Java/Maven para los backends, Angular/Node para el frontend), de modo que `target/`, `node_modules/`, artefactos de IDE y archivos `.env`/credenciales no se suben al repositorio. Las credenciales de base de datos y los identificadores de Cognito se inyectan por variables de entorno o se configuran localmente antes de correr el proyecto; no quedan hardcodeadas en el código versionado.

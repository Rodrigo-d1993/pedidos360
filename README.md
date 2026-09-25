# Pedidos360 — EP1 DSY1107

Arquitectura: Angular (frontend, con AWS Amplify para el login) + 2 microservicios Spring Boot (backend) + AWS Cognito (auth) + API Gateway (JWT Authorizer) + RDS MySQL.

## Estructura
```
backend/ms-productos   → CRUD de productos (puerto 8081)
backend/ms-pedidos     → CRUD de pedidos, llama a ms-productos (puerto 8082)
frontend               → Angular 17 standalone, login vía Cognito Hosted UI
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

### Frontend
```
cd frontend
npm install
npm start
```
Antes de correrlo, completa `src/environments/environment.ts` con los datos reales de tu Cognito User Pool (userPoolId, userPoolClientId, dominio) y las URLs de tus microservicios / API Gateway. La app usa **AWS Amplify** (`aws-amplify/auth`) para el login vía Hosted UI de Cognito — Amplify procesa el retorno del login automáticamente en la URL configurada como `redirectSignIn`, así que no hace falta una ruta `/callback`.

## Pendiente (siguientes pasos del plan)
- [ ] Crear User Pool + App Client en Cognito
- [ ] Completar `environment.ts` con los datos de Cognito
- [ ] Desplegar ms-productos y ms-pedidos en EC2
- [ ] Crear API Gateway (HTTP API) con rutas hacia EC2
- [ ] Configurar JWT Authorizer en API Gateway apuntando al User Pool de Cognito
- [ ] Probar login end-to-end y llamadas autenticadas

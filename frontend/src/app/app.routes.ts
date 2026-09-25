import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { PedidosComponent } from './features/pedidos/pedidos.component';
import { ProductosComponent } from './features/productos/productos.component';

// Amplify procesa el retorno del login de Cognito automáticamente en la
// URL configurada como redirectSignIn (ver environment.ts) — no se necesita
// una ruta /callback dedicada como con un flujo OIDC manual.
export const routes: Routes = [
  { path: '', redirectTo: 'productos', pathMatch: 'full' },
  { path: 'productos', component: ProductosComponent, canActivate: [authGuard] },
  { path: 'pedidos', component: PedidosComponent, canActivate: [authGuard] },
];

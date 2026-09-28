import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="login-wrap">
      <div class="card login-card">
        <h1>Pedidos<span>360</span></h1>
        <p>Inicia sesión para ver los productos y tus pedidos.</p>

        <div class="error" *ngIf="error">{{ error }}</div>

        <button class="btn btn-primary" (click)="login()" [disabled]="cargando">
          {{ cargando ? 'Redirigiendo...' : 'Iniciar sesión' }}
        </button>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  cargando = false;
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  async ngOnInit(): Promise<void> {
    // Si ya hay sesión, no tiene sentido mostrar el login
    if (await this.auth.isAuthenticated()) {
      this.router.navigate(['/productos']);
    }
  }

  async login(): Promise<void> {
    this.cargando = true;
    this.error = '';
    try {
      await this.auth.login(); // redirige al Hosted UI de Cognito
    } catch (e) {
      console.error(e);
      this.error = 'No se pudo iniciar sesión. Revisa la configuración de Cognito en environment.ts.';
      this.cargando = false;
    }
  }
}
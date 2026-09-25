import { Injectable } from '@angular/core';
import {
  signInWithRedirect,
  signOut,
  fetchAuthSession,
  getCurrentUser,
} from 'aws-amplify/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  login(): Promise<void> {
    return signInWithRedirect();
  }

  logout(): Promise<void> {
    return signOut();
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await fetchAuthSession();
      return !!session.tokens?.accessToken;
    } catch {
      return false;
    }
  }

  async getAccessToken(): Promise<string | null> {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken?.toString() ?? null;
  }

  async getClienteId(): Promise<string | null> {
    // El "sub" del usuario en Cognito, usado como identificador del cliente en los pedidos
    try {
      const user = await getCurrentUser();
      return user.userId;
    } catch {
      return null;
    }
  }
}

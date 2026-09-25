import { HttpInterceptorFn } from '@angular/common/http';
import { fetchAuthSession } from 'aws-amplify/auth';
import { from, switchMap } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  return from(fetchAuthSession()).pipe(
    switchMap((session) => {
      // Se usa el ID Token porque API Gateway solo valida identidad (Cognito Authorizer
      // sin Authorization Scopes configurados) y no exige ningún custom scope.
      // Si en el futuro se agrega un Resource Server + custom scope en Cognito y se
      // configura como Authorization Scope requerido en el método de API Gateway,
      // cambiar a Access Token (el único que lleva el claim "scope"):
      // const token = session.tokens?.accessToken?.toString();
      const token = session.tokens?.idToken?.toString();
      const authReq = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;
      return next(authReq);
    })
  );
};

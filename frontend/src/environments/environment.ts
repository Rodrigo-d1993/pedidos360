export const environment = {
  production: false,

  // API Gateway (una vez creado): p.ej. https://abc123.execute-api.us-east-1.amazonaws.com/test
  apiBaseUrl: 'https://gtrjd5soyh.execute-api.us-east-1.amazonaws.com/test',
  pedidosBaseUrl: 'https://gtrjd5soyh.execute-api.us-east-1.amazonaws.com/test',

  cognito: {
    // Del User Pool creado en la consola (paso "Crear Amazon Cognito")
    userPoolId: 'us-east-1_RzDLf6u2w',
    userPoolClientId: '3e6ng0a3rqapponnmt83utca83',
    domain: 'us-east-1rzdlf6u2w.auth.us-east-1.amazoncognito.com', // sin https://
    redirectSignIn: 'http://localhost:4200/',
    redirectSignOut: 'http://localhost:4200/',
  }
};
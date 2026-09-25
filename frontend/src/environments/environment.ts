export const environment = {
  production: false,

  // API Gateway (una vez creado): p.ej. https://abc123.execute-api.us-east-1.amazonaws.com/test
  apiBaseUrl: 'https://YOUR_API_GATEWAY_ID.execute-api.YOUR_REGION.amazonaws.com/test',
  pedidosBaseUrl: 'https://YOUR_API_GATEWAY_ID.execute-api.YOUR_REGION.amazonaws.com/test',

  cognito: {
    // Del User Pool creado en la consola (paso "Crear Amazon Cognito")
    userPoolId: 'YOUR_USER_POOL_ID',
    userPoolClientId: 'YOUR_USER_POOL_CLIENT_ID',
    domain: 'YOUR_COGNITO_DOMAIN.auth.YOUR_REGION.amazoncognito.com', // sin https://
    redirectSignIn: 'http://localhost:4200/',
    redirectSignOut: 'http://localhost:4200/',
  }
};
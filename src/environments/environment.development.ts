export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',

  // Agrega estas propiedades para Selenium/bypass
  bypassAuth: true,      // permite saltarse login
  bypassAdmin: true,     // permite acceso a rutas admin
  bypassEditor: true     // permite acceso a rutas editor
};

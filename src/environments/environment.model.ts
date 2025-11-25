export interface Environment {
  production: boolean;
  apiUrl: string;

  // Opcionales, solo para testing
  bypassAuth?: boolean;
  bypassAdmin?: boolean;
  bypassEditor?: boolean;
}

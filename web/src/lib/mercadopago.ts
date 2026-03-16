import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configuración de clave de acceso al backend
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || '',
  // Set options if needed, like options: { timeout: 5000 }
});

export const mpPreference = new Preference(client);
export { client as mpClient };

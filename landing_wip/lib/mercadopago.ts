import { MercadoPagoConfig, Preference, Payment, PreApproval } from "mercadopago";

// Server-only Mercado Pago clients. Never import this file from a Client
// Component — it reads the secret access token and pulls in Node APIs.

function getClient(): MercadoPagoConfig {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      "MP_ACCESS_TOKEN no está definido. Agregalo en .env.local (Mercado Pago → Tus integraciones → Credenciales)."
    );
  }
  return new MercadoPagoConfig({ accessToken, options: { timeout: 8000 } });
}

export function preferenceClient(): Preference {
  return new Preference(getClient());
}

export function paymentClient(): Payment {
  return new Payment(getClient());
}

export function preApprovalClient(): PreApproval {
  return new PreApproval(getClient());
}

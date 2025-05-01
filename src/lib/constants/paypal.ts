// Constants for PayPal configuration
export const PAYPAL_MODE = process.env.NEXT_PUBLIC_PAYPAL_MODE || process.env.PAYPAL_MODE || 'sandbox';

// URL de base pour les paiements PayPal standard (avec compte PayPal)
export const PAYPAL_BASE_URL = PAYPAL_MODE === 'live' 
  ? 'https://www.paypal.com/cgi-bin/webscr' 
  : 'https://www.sandbox.paypal.com/cgi-bin/webscr';

// URL spécifique pour les paiements par carte sans compte PayPal
export const PAYPAL_CARD_PAYMENT_URL = PAYPAL_MODE === 'live'
  ? 'https://www.paypal.com/webapps/hermes/card-payment'
  : 'https://www.sandbox.paypal.com/webapps/hermes/card-payment';

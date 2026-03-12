/**
 * Mock Payment Processing
 *
 * Simulates payment processing for consultation bookings.
 * In production, this would integrate with real payment gateways like Stripe.
 */

export interface PaymentDetails {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface ConsultationPaymentRequest {
  productId: string;
  amount: number;
  userId: string;
}

export interface ConsultationPaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  bookingId?: string;
}

// Simulate payment processing delay
const paymentDelay = () => new Promise((resolve) => setTimeout(resolve, 2000));

// Process consultation payment (mock)
export async function processConsultationPayment(
  request: ConsultationPaymentRequest
): Promise<ConsultationPaymentResult> {
  await paymentDelay();

  // Simulate success rate (95% success)
  const isSuccess = Math.random() > 0.05;

  if (isSuccess) {
    return {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bookingId: crypto.randomUUID(),
    };
  } else {
    return {
      success: false,
      error: "Payment declined. Please try a different payment method.",
    };
  }
}

// Validate payment details (basic validation)
export function validatePaymentDetails(details: PaymentDetails): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Card number (basic Luhn validation simulation)
  const cleanNumber = details.cardNumber.replace(/\s+/g, "");
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    errors.push("Card number must be 13-19 digits");
  }

  // Card holder
  if (!details.cardHolder.trim()) {
    errors.push("Card holder name is required");
  }

  // Expiry date
  if (!details.expiryDate) {
    errors.push("Expiry date is required");
  } else {
    const [month, year] = details.expiryDate.split("/").map((v) => parseInt(v, 10));
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (!month || !year || month < 1 || month > 12) {
      errors.push("Invalid expiry date");
    } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
      errors.push("Card has expired");
    }
  }

  // CVV
  if (!details.cvv || details.cvv.length < 3 || details.cvv.length > 4) {
    errors.push("CVV must be 3-4 digits");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Format card number for display (hide middle digits)
export function formatCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\s+/g, "");
  if (cleaned.length <= 4) return cleaned;
  return `${cleaned.slice(0, 4)} ${"•".repeat(Math.min(cleaned.length - 8, 8))} ${cleaned.slice(-4)}`;
}

// Generate mock card numbers for testing (demo only)
export function generateMockCardNumber(): string {
  // Return a test card number (Visa test number)
  return "4242424242424242";
}

// Generate mock expiry (future date)
export function generateMockExpiry(): string {
  const now = new Date();
  const futureYear = now.getFullYear() + 2;
  const futureMonth = Math.floor(Math.random() * 12) + 1;
  return `${futureMonth.toString().padStart(2, "0")}/${futureYear.toString().slice(-2)}`;
}

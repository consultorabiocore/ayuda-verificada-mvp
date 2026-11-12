export interface PaymentProvider {
  name: string;
  createDonationIntent(input: { requestId: string; amount: number; donorId: string }): Promise<{
    transactionId: string;
    status: "pending" | "processing" | "completed";
  }>;
  confirmWebhook(payload: unknown, signature?: string): Promise<{ valid: boolean; transactionId?: string; status?: string }>;
  refund(transactionId: string, amount: number, reason: string): Promise<{ success: boolean }>;
}

export class SimulatedPaymentProvider implements PaymentProvider {
  name = "simulated";
  async createDonationIntent() {
    return { transactionId: `sim_${Date.now()}`, status: "completed" as const };
  }
  async confirmWebhook() {
    return { valid: false };
  }
  async refund() {
    return { success: true };
  }
}

export const paymentProvider: PaymentProvider = new SimulatedPaymentProvider();
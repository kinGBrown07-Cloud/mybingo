// Types pour les transactions
export enum TransactionType {
  PAYMENT = "PAYMENT",
  REFUND = "REFUND",
  BONUS = "BONUS",
  GAME = "GAME",
  WITHDRAWAL = "WITHDRAWAL"
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED"
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  description: string | null;
  pointsAmount: number;
  metadata: string | null;
  createdAt: Date;
  gameSessionId?: string | null;
}

export interface PaymentDetails {
  userId: string;
  amount: number;
  currency: string;
  points: number;
  bonus?: number;
  region?: string;
}

export interface OrderResponse {
  transactionId: string;
  status: string;
  points: number;
  bonus: number;
}

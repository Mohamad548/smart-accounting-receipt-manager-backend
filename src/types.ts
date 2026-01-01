export interface Creditor {
  id: string;
  name: string;
  accountNumber: string;
  shebaNumber: string;
  totalAmount: number;
  remainingAmount: number;
  createdAt: number;
}

export interface ExtractedData {
  amount: number;
  date: string;
  refNumber: string;
  sender: string;
  receiver: string;
  description: string;
  dynamicFields: Record<string, string>;
  matchedCreditorId?: string;
}


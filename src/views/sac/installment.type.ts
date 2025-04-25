import type {ValueFormatted} from "@/utils/number/format-number.ts";

export type Installment = {
  i: number,
  balance: ValueFormatted,
  fee: string,
  installment: ValueFormatted,
  insurance: ValueFormatted,
  tax: ValueFormatted,
  totalAmount: ValueFormatted,
  amortization: string,
  amortizationYear: number,
  amortizationDueDate: number,
}

import {formatNumber, type ValueFormatted} from "@/utils/number/format-number.ts";
import {calcVP} from "@/utils/calc-vp.ts";

type TypeAmortization = {
  exists: boolean,
  year: number,
  dueDate: number,
  vp: ValueFormatted
}

export class Installment {

  public readonly installmentFull: ValueFormatted;
  public readonly installmentFee: ValueFormatted;
  public readonly insurance: ValueFormatted;
  public readonly tax: ValueFormatted;
  public readonly balance: ValueFormatted;
  public readonly totalAmount: ValueFormatted;

  public amortization: TypeAmortization = {
    exists: false,
    year: 0,
    dueDate: 0,
    vp: null,
  }

  constructor(
    public readonly i: number,
    public readonly rawInstallment: number,
    public readonly monthlyFee: number,
    currentBalance: number,
    monthlyInsuranceFee: number,
    taxAmount: number,
  ) {
    this.installmentFee = formatNumber(this.monthlyFee * currentBalance)
    this.installmentFull = formatNumber(this.installmentFee.value + this.rawInstallment)
    this.insurance = formatNumber(this.installmentFull.value * (monthlyInsuranceFee/100))
    this.tax = formatNumber(taxAmount);
    this.balance = formatNumber(currentBalance);
    this.totalAmount = formatNumber(
      this.installmentFull.value + this.insurance.value + this.tax.value
    )
  }

  public calcAmortization(
    onYear: number,
  ) {
    const deductedMonths = 12 * onYear;

    const { vp, dueDate } = calcVP(
      this.i,
      this.monthlyFee,
      this.installmentFull.value,
      deductedMonths
    );

    const vpFull = formatNumber(vp + this.tax.value + this.insurance.value);

    this.amortization.year = onYear;
    this.amortization.dueDate = dueDate;
    this.amortization.vp = vpFull;

    return {vpFull, vp, dueDate, deductedMonths};
  }

  public defineAmortized() {
    this.amortization.exists = true;
  }
}

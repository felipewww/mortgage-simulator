<template>
  <div class="container">
    <h1>SAC Simulator</h1>
    <div class="mb-5"></div>
    <FormBase ref="formBaseComponent" />
    <div class="d-flex justify-content-end">
      <button
        class="btn btn-info"
        type="button"
        :disabled="formBaseComponent && !formBaseComponent.isFormFilled()"
        @click="calc"
      >
        Calcular
      </button>
    </div>

    <div v-if="showCalc">
      <div>
        Total: {{totalAmount}}
      </div>
      <div>
        <div class="row">
          <div class="col-1">Nº</div>
          <div class="col">Juros</div>
          <div class="col">Valor</div>
          <div class="col">Seguro</div>
          <div class="col">Taxa</div>
          <div class="col">Total</div>
          <div class="col">Amortizado</div>
          <div class="col">Saldo</div>
        </div>
        <div class="row" v-for="installment of installments" :key="installment.i">
          <div class="col-1">
            {{installment.i}}
          </div>
          <div class="col">
            {{installment.fee}}
          </div>
          <div class="col">
            {{installment.installment.formatted}}
          </div>
          <div class="col">
            {{installment.insurance.formatted}}
          </div>
          <div class="col">
            {{installment.tax.formatted}}
          </div>
          <div class="col">
            {{installment.totalAmount.formatted}}
          </div>
          <div class="col">
            <span v-if="installment.amortization">
              {{installment.amortizationYear}} >>
              {{installment.amortizationDueDate}} >>
              {{installment.amortization}}
            </span>
            <span v-else>-</span>
          </div>
          <div class="col">
            {{installment.balance.formatted}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import FormBase, {type FormBaseExposedData} from "@/views/home/form-base.vue";
import {ref} from "vue";
import {formatNumber, type ValueFormatted} from "@/utils/number/format-number.ts";

const formBaseComponent = ref<FormBaseExposedData>(null)

const showCalc = ref(false);
const balance = ref(0)

function calc() {
  installments.value = [];
  showCalc.value = true;
  balance.value = formBaseComponent.value.totalLoan
  generateInstallments(
    formBaseComponent.value.months
  );

  if (
    formBaseComponent.value.amortization.years
    && formBaseComponent.value.amortization.amount
  ) {
  }
  calcAmortizations(
    formBaseComponent.value.amortization.amount,
    formBaseComponent.value.amortization.years,
    formBaseComponent.value.amortization.yearStart,
  );
}

type Installment = {
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

const installments = ref<Installment[]>([])

const totalAmount = ref(0)

function generateInstallments(
  installmentsCount: number
) {
  let i = 1;
  while (i <= installmentsCount) {
    const fee = formatNumber(formBaseComponent.value.monthlyFee * balance.value)

    // valor total, JUROS + PARCELA
    const installment = formatNumber(fee.value + formBaseComponent.value.rawInstallment);
    const insurance = formatNumber(installment.value * (formBaseComponent.value.monthlyInsuranceFee/100))
    const tax = formatNumber(25);

    installments.value.push({
      i,
      balance: formatNumber(balance.value),
      fee: fee.formatted,
      installment,
      insurance,
      tax,
      totalAmount: formatNumber(installment.value + insurance.value + tax.value),
      amortization: null,
      amortizationYear: null,
      amortizationDueDate: null,
    });

    // const newBalance = formatNumber(balance.value - formBaseComponent.value.rawInstallment);
    // saldo - APENAS desconta o valor da parcela
    balance.value = balance.value - formBaseComponent.value.rawInstallment

    totalAmount.value += installment.value

    i++;
  }
}

function calcAmortizations(
  dock: number,
  alongYears: number,
  yearStart: number,
) {
  let year = yearStart ?? 1;

  installments.value.reverse();

  let i = 0;
  while (i < alongYears) {

    const deductedMonths = 12 * year;
    let total = 0;

    for (const inst of installments.value) {
      // ignorar parcela já calculada
      if (!inst.amortizationYear) {
        const dueDate = inst.i - deductedMonths;

        // =L188 / (1 + $L$5) ^ (H188)
        const instWithAmortizationDiscount = inst.installment.value / Math.pow(1 + formBaseComponent.value.monthlyFee, dueDate)

        const amortizationInstallmentFull = formatNumber(
          instWithAmortizationDiscount + inst.tax.value + inst.insurance.value
        )

        if (
          (total + amortizationInstallmentFull.value) >= dock
        ) {
          break;
        }

        total += amortizationInstallmentFull.value;

        inst.amortizationDueDate = dueDate;
        inst.amortizationYear = year
        inst.amortization = amortizationInstallmentFull.formatted
      }
    }

    year++;
    i++;
  }

  // Reverter de novo para exibir corretamente no front
  installments.value.reverse();
}

</script>

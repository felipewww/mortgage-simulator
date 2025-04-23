<template>
  <div class="container">
    <h1>Sac/Price simulator</h1>
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
<!--      balance: {{balance}}-->
      <div>
        <div class="row">
          <div class="col-1">Nº</div>
          <div class="col">Valor</div>
          <div class="col">Amortizado</div>
          <div class="col">Juros</div>
          <div class="col">Saldo</div>
        </div>
        <div class="row" v-for="installment of installments" :key="installment.i">
          <div class="col-1">
            {{installment.i}}
          </div>
          <div class="col">
            {{installment.installment.formatted}}
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
            {{installment.fee}}
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

  calcAmortizations(
    12000,
    2
  )

  // installments.value = installmentsObject;
}

type Installment = {
  i: number,
  balance: ValueFormatted,
  fee: string,
  installment: ValueFormatted,
  amortization: string,
  amortizationYear: number,
  amortizationDueDate: number,
}

const installments = ref<Installment[]>([])

function generateInstallments(
  installmentsCount: number
) {
  let i = 1;
  while (i <= installmentsCount) {
    const fee = formatNumber(formBaseComponent.value.monthlyFee * balance.value)

    // valor total, JUROS + PARCELA
    const installment = formatNumber(fee.value + formBaseComponent.value.rawInstallment);

    const newBalance = formatNumber(balance.value - formBaseComponent.value.rawInstallment);
    // saldo - APENAS desconta o valor da parcela
    balance.value = newBalance.value

    installments.value.push({
      i,
      balance: newBalance,
      fee: fee.formatted,
      installment: installment,
      amortization: null,
      amortizationYear: null,
      amortizationDueDate: null,
    });

    i++;
  }
}

function calcAmortizations(
  dock: number,
  years: number,
) {
  let year = 1;

  installments.value.reverse();

  while (year <= years) {

    const deductedMonths = 12 * year;
    let times = 0;
    let total = 0;

    for (const inst of installments.value) {
      // ignorar já calculados para outros anos
      if (!inst.amortizationYear) {
        times += 1;
        const dueDate = inst.i - (deductedMonths + times);
        const amortizationInstallment = formatNumber(
          // =L188 / (1 + $L$5) ^ (H188)
          inst.installment.value / Math.pow(1 + formBaseComponent.value.monthlyFee, dueDate)
        )

        if (
          (total + amortizationInstallment.value) >= dock
        ) {
          break;
        }

        total += amortizationInstallment.value;

        inst.amortizationDueDate = dueDate;
        inst.amortizationYear = year
        inst.amortization = amortizationInstallment.formatted
      }
    }

    year++;
  }

  // Reverter de novo para exibir corretamente no front
  installments.value.reverse();
}

</script>

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
      <div class="row mb-4">
        <div class="col">
          <div class="card">
            <div class="card-header d-flex justify-content-between">
              <div>
                Financiado
              </div>
              <div>
                <div class="badge bg-primary">R$ {{formatNumber(formBaseComponent.totalLoan).formatted}}</div>
              </div>
            </div>
            <div class="card-body">
              <InfoRow
                title="Total Parcelas"
                :content="`R$ ${formatNumber(totalAmount).formatted}`"
                bg-color="info"
              />
              <InfoRow
                title="Taxas e Seguros"
                :content="`R$ ${formatNumber(totalTaxesNInsurance).formatted}`"
                bg-color="warning"
              />
              <InfoRow
                title="Total + Entrada"
                :content="`R$ ${formatNumber(formBaseComponent.downPayment.value + totalAmount + totalTaxesNInsurance).formatted}`"
                bg-color="warning"
              />
            </div>
          </div>
        </div>

        <div class="col">
          <!-- CARD AMORTIZAÇÃO -->
          <div class="card">
            <div class="card-header d-flex justify-content-between">
              <div>
                Amortização
              </div>
              <div>
                <div class="badge bg-primary">{{amortizationCount}} parcelas</div>
              </div>
            </div>
            <div class="card-body">
              <InfoRow
                title="parcelas"
                :content="`R$ ${formatNumber(amortizationPaidAmount).formatted}`"
                bg-color="info"
              />
              <InfoRow
                title="taxas e juros"
                :content="`R$ ${formatNumber(amortizationTaxesNInsurance).formatted}`"
                bg-color="warning"
              />
              <InfoRow
                title="economia"
                :content="`R$ ${formatNumber(amortizationDiff).formatted}`"
                bg-color="success"
                text-color="text-white"
              />
            </div>
          </div>
          <!-- CARD AMORTIZAÇÃO -->
        </div>

        <div class="col">
          <div class="card">
            <div class="card-header d-flex justify-content-between">
              <div>
                Pós Amortização
              </div>
              <div>
                <div class="badge bg-primary">Restam {{amortizationRest}} parcelas ({{amortizationParallel+1}} / {{amortizationLast-1}})</div>
              </div>
            </div>
            <div class="card-body">
              <div>Last: {{amortizationLast}}</div>
              <div>amortizationParallel: {{amortizationParallel}}</div>
              <div>amortizationRest: {{amortizationRest}}</div>
            </div>
          </div>

        </div>
      </div>
      <Calcs :installments="installments"></Calcs>
    </div>
  </div>
</template>


<script setup lang="ts">
import FormBase, {type FormBaseExposedData} from "@/views/sac/components/form-base.vue";
import {computed, ref} from "vue";
import {formatNumber} from "@/utils/number/format-number.ts";
import Calcs from "@/views/sac/components/calcs.vue";
import InfoRow from "@/components/info-row.vue";
import {Installment} from "@/domain/installment";

const formBaseComponent = ref<FormBaseExposedData>(null)

const showCalc = ref(false);
const balance = ref(0)
const installments = ref<Installment[]>([])
const totalAmount = ref(0)
const totalTaxesNInsurance = ref(0)

const amortizationDiff   = ref(0);
const amortizationLast   = ref(0);
const amortizationCount   = ref(0);
const amortizationParallel   = ref(0);
const amortizationPaidAmount   = ref(0);
const amortizationTaxesNInsurance   = ref(0);
const nextAfterAmortization = ref(0);
const amortizationRest   = computed(() => {
  const last = amortizationLast.value - 1;
  return last - nextAfterAmortization.value;
})

const restAmount = ref(0);

function reset() {
  installments.value = [];
  totalAmount.value = 0;
  totalTaxesNInsurance.value = 0;
  amortizationDiff.value = 0;
  amortizationLast.value = 0;
  amortizationCount.value = 0;
  amortizationParallel.value = 0;
  amortizationPaidAmount.value = 0;
  amortizationTaxesNInsurance.value = 0;
  nextAfterAmortization.value = 0;
  restAmount.value = 0;
}

function calc() {
  reset();

  balance.value = formBaseComponent.value.totalLoan
  generateInstallments(
    formBaseComponent.value.months
  );

  if (
    formBaseComponent.value.amortization.years
    && formBaseComponent.value.amortization.amount
  ) {
    nextAfterAmortization.value = formBaseComponent.value.amortization.years * 12 + 1;

    calcAmortizations(
      formBaseComponent.value.amortization.amount,
      formBaseComponent.value.amortization.years,
      formBaseComponent.value.amortization.yearStart,
    );

    calcAmortizationRest();

    showCalc.value = true;
  }
}

function generateInstallments(
  installmentsCount: number
) {
  let i = 1;
  while (i <= installmentsCount) {
    const fee = formatNumber(formBaseComponent.value.monthlyFee * balance.value)

    // valor total, JUROS + PARCELA
    const installment = formatNumber(fee.value + formBaseComponent.value.rawInstallment);
    const insurance = formatNumber(installment.value * (formBaseComponent.value.monthlyInsuranceFee/100))
    const tax = formatNumber(formBaseComponent.value.tax);


    installments.value.push(
      new Installment(
        i,
        formBaseComponent.value.rawInstallment,
        formBaseComponent.value.monthlyFee,
        balance.value,
        formBaseComponent.value.monthlyInsuranceFee,
        formBaseComponent.value.tax
      )
    )

    // const newBalance = formatNumber(balance.value - formBaseComponent.value.rawInstallment);
    // saldo - APENAS desconta o valor da parcela
    balance.value = balance.value - formBaseComponent.value.rawInstallment

    totalAmount.value += installment.value
    totalTaxesNInsurance.value += tax.value + insurance.value

    i++;
  }
}

function calcAmortizations(
  budget: number,
  alongYears: number,
  yearStart: number,
) {
  let year = yearStart ?? 1;

  installments.value.reverse();

  let i = 0;
  while (i < alongYears) {

    let total = 0;

    for (const inst of installments.value) {

      // ignorar parcela já calculada para outro período
      if (!inst.amortization.exists) {
        const {vpFull, vp, dueDate, deductedMonths} = inst.calcAmortization(year)

        if (
          (total + vpFull.value) >= budget
        ) {
          break;
        }

        total += vpFull.value;

        inst.defineAmortized()

        amortizationDiff.value += inst.totalAmount.value - vpFull.value;
        amortizationPaidAmount.value += vp;
        amortizationTaxesNInsurance.value += inst.tax.value + inst.insurance.value;
        amortizationLast.value = inst.i;
        amortizationCount.value++;
      }
    }

    amortizationParallel.value = year * 12;
    year++;
    i++;
  }

  // Reverter de novo para exibir corretamente no front
  installments.value.reverse();
}

function calcAmortizationRest() {
  let i = nextAfterAmortization.value;
  let amount = 0;
  while (i < amortizationLast.value - 1) {
    const inst = installments.value[i];
    // amount += inst.fee + inst.insurance.value + inst.tax;
    // console.log(installments.value[i])
    i++
  }
}
</script>

<style>
.test {
  color: rgba(28, 62, 59, 0.58);
}
</style>

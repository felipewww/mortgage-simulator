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

    <div v-if="showCalc" class="mt-3">
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
              <InfoRow
                title="Pago em dia"
                :content="`${amortizationParallel} (${parallelYears} anos) - (${parallelPercent}%)`"
                bg-color="info"
                text-color="text-black"
              />
              <InfoRow
                title="Amortizado"
                :content="`${amortizationCount} (${amortizationYears} anos) - (${amortizationPercent}%)`"
                bg-color="success"
                text-color="text-white"
              />
              <InfoRow
                title="Restante"
                :content="`${amortizationRest} (${restYears} anos) - (${restPercent}%)`"
                bg-color="warning"
                text-color="text-black"
              />
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
    // apos 2 anos = 24
    // apos 3 anos = 36
    // ou seja, ja se passaram 48 parcelas PARALELAMENTE enquanto eu quitava, a próxima será a 49 (ja no 4º ano, sem amortizar)

    // para 180 meses, iniciando no ano 2 durante 3 anos (anos 2, 3 e 4 amortizando)
    // ano 1 - 12 meses - NÃO amortiza
    // ano 2 (ano inicio) - 24 meses - amortiza | deductionMonth = 180 - 24 = 156
    // ano 3 - 36 meses - amortiza
    // ano 4 (ano fim) - 48 meses - amortiza
    // próxima parcela será 49
    // (anoInicio - 1) + anoFim
    const yearsEndAmortization = (formBaseComponent.value.amortization.yearStart - 1) + formBaseComponent.value.amortization.years
    nextAfterAmortization.value = yearsEndAmortization * 12 + 1;

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

const amortizationPercent = ref(0);
const amortizationYears = ref(0);
const parallelPercent = ref(0);
const parallelYears = ref(0);
const restPercent = ref(0);
const restYears = ref(0);

function calcAmortizationRest() {

  amortizationPercent.value = parseFloat(
    ((amortizationCount.value * 100) / formBaseComponent.value.months).toFixed(2)
  );

  amortizationYears.value =  parseFloat(
    (amortizationCount.value / 12).toFixed(1)
  )

  parallelPercent.value = parseFloat(
    ((amortizationParallel.value * 100) / formBaseComponent.value.months).toFixed(2)
  );

  parallelYears.value =  parseFloat(
    (amortizationParallel.value / 12).toFixed(1)
  )

  restPercent.value = 100 - (amortizationPercent.value + parallelPercent.value)

  restYears.value =  parseFloat(
    (amortizationRest.value / 12).toFixed(1)
  )

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

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
        <CardSummary title="Financiado">
          <template v-slot:tag>
            R$ {{formatNumber(formBaseComponent.totalLoan).formatted}}
          </template>
          <div>
            <InfoRow
              title="Total Parcelas"
              bg-color="info"
            >
              <div>R$ {{formatNumber(totalAmount).formatted}}</div>
            </InfoRow>
            <InfoRow
              title="Taxas e Seguros"
              bg-color="warning"
            >
              <div>R$ {{formatNumber(totalTaxesNInsurance).formatted}}</div>
            </InfoRow>
            <InfoRow
              title="Total + Entrada"
              bg-color="warning"
            >
              <div>R$ {{formatNumber(fullAmount).formatted}}</div>
            </InfoRow>
          </div>
        </CardSummary>

        <CardSummary title="Amortização">
          <template v-slot:tag>{{amortizationCount}} parcelas</template>
          <div>
            <InfoRow title="parcelas" bg-color="info">
              <div>R$ {{formatNumber(amortizationPaidAmount).formatted}}</div>
            </InfoRow>
            <InfoRow title="taxas e juros" bg-color="warning">
              <div>R$ {{formatNumber(amortizationTaxesNInsurance).formatted}}</div>
            </InfoRow>
            <InfoRow title="total" bg-color="info">
              <div>R$ {{formatNumber(amortizationPaidAmount + amortizationTaxesNInsurance).formatted}}</div>
            </InfoRow>
            <InfoRow title="economia" bg-color="success" text-color="text-white">
              <div>R$ {{formatNumber(amortizationDiff).formatted}}</div>
            </InfoRow>
          </div>
        </CardSummary>

        <CardSummary title="Pós Amortização">
          <template v-slot:tag>
            Restam {{amortizationRest}} parcelas ({{nextAfterAmortization}} / {{lastAmortized-1}})
          </template>
          <div>
            <InfoRow title="Pago em dia" bg-color="info" text-color="text-black">
              <div>{{parallelMonths}} ({{parallelYears}} anos) {{parallelPercent}}%</div>
            </InfoRow>
            <InfoRow title="Amortizado" bg-color="success" text-color="text-white">
              <div>{{amortizationCount}} ({{amortizationYears}} anos) {{amortizationPercent}}%</div>
            </InfoRow>
            <InfoRow title="Restante" bg-color="warning" text-color="text-black">
              <div>{{amortizationRest}} ({{restYears}} anos) {{restPercent}}%</div>
            </InfoRow>
          </div>
        </CardSummary>
      </div>

      <div class="row mb-2">
        <div class="col"></div>

        <CardSummary title="Final">
          <template v-slot:tag>{{parallelMonths}} meses</template>
          <div>
            <InfoRow title="Parcelas" bg-color="warning" text-color="text-black">
              <div>R$ {{formatNumber(parallelAmount).formatted}}</div>
            </InfoRow>
            <InfoRow title="+ Amortização" bg-color="warning" text-color="text-black">
              <div>R$ {{formatNumber(parallelAndAmortizationAmount).formatted}}</div>
            </InfoRow>
            <InfoRow title="+ Entrada" bg-color="warning" text-color="text-black">
              <div>R$ {{formatNumber(parallelAndAmortizationAndDownAmount).formatted}}</div>
            </InfoRow>
            <InfoRow title="+ Saldo" bg-color="warning" text-color="text-black">
              <div>R$ {{formatNumber(parallelAndAmortizationAndDownAndRestAmount).formatted}}</div>
            </InfoRow>
            <InfoRow title="Economia" bg-color="success" text-color="text-black">
              <div>R$ {{formatNumber(saveAmount).formatted}}</div>
            </InfoRow>
          </div>
        </CardSummary>

        <CardSummary title="Saldo">
          <template v-slot:tag>R$ {{restBalance.formatted}}</template>
          <div>
            <InfoRow title="Saldo + Juros" bg-color="warning" text-color="text-black">
              <div>R$ {{restBalanceFull.formatted}}</div>
            </InfoRow>
            <InfoRow title="Próxima pc." bg-color="warning" text-color="text-black">
              <div v-if="installments[nextAfterAmortization - 1]">R$ {{installments[nextAfterAmortization - 1].totalAmount.formatted}}</div>
              <div v-else>R$ 0,00</div>
            </InfoRow>
            <InfoRow title="Última pc." bg-color="warning" text-color="text-black">
              <div v-if="installments[nextAfterAmortization - 1]">R$ {{installments[lastAmortized-1].installmentFull.formatted}}</div>
              <div v-else>R$ 0,00</div>
            </InfoRow>
          </div>
        </CardSummary>
      </div>


      <Calcs :installments="installments"></Calcs>
    </div>
  </div>
</template>


<script setup lang="ts">
import FormBase, {type FormBaseExposedData} from "@/views/sac/components/form-base.vue";
import {computed, ref} from "vue";
import {formatNumber, type ValueFormatted} from "@/utils/number/format-number.ts";
import Calcs from "@/views/sac/components/calcs.vue";
import InfoRow from "@/components/info-row.vue";
import {Installment} from "@/domain/installment";
import CardSummary from "@/components/card-summary.vue";

const formBaseComponent = ref<FormBaseExposedData>(null)

const showCalc = ref(false);
const balance = ref(0)
const installments = ref<Installment[]>([])
const totalAmount = ref(0)
const totalTaxesNInsurance = ref(0)

const amortizationDiff   = ref(0);
const lastAmortized   = ref(0);
const amortizationCount   = ref(0);
const parallelMonths   = ref(0);
const parallelAmount   = ref(0);
const amortizationPaidAmount   = ref(0);
const amortizationTaxesNInsurance   = ref(0);
const nextAfterAmortization = ref(0);
const amortizationRest   = computed(() => {
  const last = lastAmortized.value - 1;
  return last - nextAfterAmortization.value;
})

const parallelAndAmortizationAmount = ref(0);
const parallelAndAmortizationAndDownAmount = ref(0);
const parallelAndAmortizationAndDownAndRestAmount = ref(0);

const fullAmount = ref(0);
const saveAmount = ref(0);

const restAmount = ref(0);

function reset() {
  installments.value = [];
  totalAmount.value = 0;
  totalTaxesNInsurance.value = 0;
  amortizationDiff.value = 0;
  lastAmortized.value = 0;
  amortizationCount.value = 0;
  parallelMonths.value = 0;
  parallelAmount.value = 0;
  amortizationPaidAmount.value = 0;
  amortizationTaxesNInsurance.value = 0;
  nextAfterAmortization.value = 0;
  restAmount.value = 0;
  parallelAndAmortizationAmount.value = 0;
  parallelAndAmortizationAndDownAmount.value = 0;
  parallelAndAmortizationAndDownAndRestAmount.value = 0;
  fullAmount.value = 0;
  saveAmount.value = 0;
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

    /**
     * ex: quitar anualmente
     * para 180 meses, iniciando no ano 1 durante 3 anos (anos 1, 2 e 3 amortizando)
     * apos 1 ano (inicio da amortização) = 12 meses | deductionMonth = 180 - 12 = 168
     * apos 2 anos = 24
     * apos 3 anos (ano fim) = 36
     * ou seja, ja se passaram 36 parcelas PARALELAMENTE enquanto eu quitava, a próxima será a 37 (ja no 4º ano, sem amortizar)
     *
     * ex: juntar dinheiro e quitar de uma vez após 3 anos
     * para 180 meses, iniciando no ano 3, durante 1 ano
     * apos 3 anos (inicio da amortização) = 36 meses | deductionMonth = 180 - 36 = 144
     *
     * ex:
     * para 180 meses, iniciando no ano 2 durante 3 anos (anos 2, 3 e 4 amortizando)
     * ano 1 - 12 meses - NÃO amortiza
     * ano 2 (ano inicio) - 24 meses - amortiza | deductionMonth = 180 - 24 = 156
     * ano 3 - 36 meses - amortiza
     * ano 4 (ano fim) - 48 meses - amortiza
     * próxima parcela será 49
     * (anoInicio - 1) + anoFim
     *
     * caso o YEAR_START = ZERO, signfiica que vai quitar a ultima EXATAMENTE JUNTO com a primeiro
     * então não podemos subtrair Um de YEAR START.
     * */
    const consideredYear = formBaseComponent.value.amortization.yearStart === 0 ? 0 : formBaseComponent.value.amortization.yearStart - 1
    const yearsEndAmortization = (consideredYear) + formBaseComponent.value.amortization.years

    nextAfterAmortization.value = yearsEndAmortization * 12 + 1;

    calcAmortizations(
      formBaseComponent.value.amortization.amount,
      formBaseComponent.value.amortization.years,
      formBaseComponent.value.amortization.yearStart,
    );

    calcAmortizationRest();

    calcParallelAmount();

    parallelAndAmortizationAmount.value = parallelAmount.value + amortizationPaidAmount.value + amortizationTaxesNInsurance.value;
    parallelAndAmortizationAndDownAmount.value = parallelAndAmortizationAmount.value + formBaseComponent.value.downPayment.value;
    parallelAndAmortizationAndDownAndRestAmount.value = parallelAndAmortizationAndDownAmount.value + restBalanceFull.value.value;

    saveAmount.value = fullAmount.value - parallelAndAmortizationAndDownAndRestAmount.value

  }

  showCalc.value = true;
}

function calcParallelAmount() {
  let i = 0;
  let amount = 0;
  while (i < parallelMonths.value) {
    amount += installments.value[i].totalAmount.value;
    i++;
  }

  parallelAmount.value = amount
}

function generateInstallments(
  installmentsCount: number
) {
  const rawInstallment = formBaseComponent.value.rawInstallment
  const monthlyFee = formBaseComponent.value.monthlyFee;
  const monthlyInsuranceFee = formBaseComponent.value.monthlyInsuranceFee;

  let i = 1;
  while (i <= installmentsCount) {
    const inst = new Installment(
      i,
      rawInstallment,
      monthlyFee,
      balance.value,
      monthlyInsuranceFee,
      formBaseComponent.value.tax
    )

    installments.value.push(inst)

    // saldo - APENAS desconta o valor da parcela sem juros ou taxas
    balance.value = balance.value - rawInstallment

    totalAmount.value += inst.installmentFull.value
    totalTaxesNInsurance.value += inst.tax.value + inst.insurance.value

    i++;
  }

  fullAmount.value = formBaseComponent.value.downPayment.value + totalAmount.value + totalTaxesNInsurance.value;
}

function calcAmortizations(
  budget: number,
  alongYears: number,
  yearStart: number,
) {
  let year = parseInt(yearStart);

  // para simular a quitação iniciando exatamente junto com a primeira parcela (ou seja, no ano ZERO, parcela 1)
  // é necessário considerar o ano ZERO como UM apenas para calcular as parcelas PARALELAS
  let consideredYear = (year === 0) ? 1 : year;

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
        lastAmortized.value = inst.i;
        amortizationCount.value++;
      }
    }

    // parallelMonths.value = (year === 0) ? 12 : year * 12;
    parallelMonths.value = consideredYear * 12;

    consideredYear++;
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
const restBalance = ref<ValueFormatted>({
  value: 0,
  formatted: 0,
});
const restBalanceFull = ref<ValueFormatted>({
  value: 0,
  formatted: 0,
});

function calcAmortizationRest() {

  amortizationPercent.value = parseFloat(
    ((amortizationCount.value * 100) / formBaseComponent.value.months).toFixed(2)
  );

  amortizationYears.value =  parseFloat(
    (amortizationCount.value / 12).toFixed(1)
  )

  parallelPercent.value = parseFloat(
    ((parallelMonths.value * 100) / formBaseComponent.value.months).toFixed(2)
  );

  parallelYears.value =  parseFloat(
    (parallelMonths.value / 12).toFixed(1)
  )

  restPercent.value = parseFloat(
    (100 - (amortizationPercent.value + parallelPercent.value)).toFixed(2)
  )

  restYears.value =  parseFloat(
    (amortizationRest.value / 12).toFixed(1)
  )

  restBalance.value = formatNumber(
    amortizationRest.value * formBaseComponent.value.rawInstallment
  )

  let i = nextAfterAmortization.value;
  let amount = 0;
  while (i < lastAmortized.value - 1) {
    const inst = installments.value[i];
    amount += inst.totalAmount.value;
    // restBalanceFull.value += inst.totalAmount.value;
    i++
  }

  restBalanceFull.value = formatNumber(amount)
}
</script>

<style>
.test {
  color: rgba(28, 62, 59, 0.58);
}
</style>

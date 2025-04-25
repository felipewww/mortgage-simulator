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
                :content="`R$ ${formatNumber(totalAmount).formatted}`"
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
          <div>Last: {{amortizationLast}}</div>
          <div>amortizationParallel: {{amortizationParallel}}</div>
          <div>amortizationRest: {{amortizationRest}}</div>
<!--          <div>amortizationCount: {{amortizationCount}}</div>-->
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
import type {Installment} from "@/views/sac/installment.type.ts";
import InfoRow from "@/components/info-row.vue";

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
const amortizationRest   = computed(() => {
  return installments.value.length - (amortizationCount.value + amortizationParallel.value);
})

function calc() {
  installments.value = [];
  totalAmount.value = 0;
  totalTaxesNInsurance.value = 0;
  amortizationDiff.value = 0;
  amortizationLast.value = 0;
  amortizationCount.value = 0;
  amortizationParallel.value = 0;
  amortizationPaidAmount.value = 0;
  amortizationTaxesNInsurance.value = 0;

  balance.value = formBaseComponent.value.totalLoan
  generateInstallments(
    formBaseComponent.value.months
  );

  if (
    formBaseComponent.value.amortization.years
    && formBaseComponent.value.amortization.amount
  ) {
    calcAmortizations(
      formBaseComponent.value.amortization.amount,
      formBaseComponent.value.amortization.years,
      formBaseComponent.value.amortization.yearStart,
    );

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

    const deductedMonths = 12 * year;
    let total = 0;

    for (const inst of installments.value) {

      // ignorar parcela já calculada para outro período
      if (!inst.amortizationYear) {
        const { vp, dueDate } = calcVP(inst, deductedMonths);

        const vpFull = formatNumber(vp + inst.tax.value + inst.insurance.value)

        if (
          (total + vpFull.value) >= budget
        ) {
          break;
        }

        total += vpFull.value;

        inst.amortizationDueDate = dueDate;
        inst.amortizationYear = year
        inst.amortization = vpFull.formatted

        amortizationDiff.value += inst.totalAmount.value - vpFull.value
        amortizationPaidAmount.value += vp
        amortizationTaxesNInsurance.value += inst.tax.value + inst.insurance.value
        amortizationLast.value = inst.i;
        amortizationCount.value++;
      }

    }

    year++;
    i++;
  }

  amortizationParallel.value = year * 12;
  // Reverter de novo para exibir corretamente no front
  installments.value.reverse();
}

function calcVP(
  installment: Installment,
  // número de meses que já se passaram sem pagar essa parcela
  // ex: vou esperar 2 anos para pagar, então aqui sera 24 meses.
  deductedMonths: number,
) {
  // quanto falta para chegar nessa parcela, exemplo: esperei 2 anos para pagar a parcela nº 50
  // então é 50 - 24 = 26. Então estou antecipando 26 meses desta parcela.
  const dueDate = installment.i - deductedMonths;
  /*
          Esta fórmula calcula o Valor Presente (VP) de uma parcela, descontado por uma taxa de juros para saber qaunto custará
          a amortização antecipada

          Valor Presente = Valor Futuro / (1 + taxa) ^ período
          VP = VF / (1 + TX) ^ P

          Onde:
          - VP → O vlaor que queremos encontrar, quando custará uma parcela futura se eu pagar antecipado
          - VF → Valor real da parcela se eu pagar dentro do prazo
          - TX → taxa de juros mensal (ex: 10.45 aa = 10.45 / 12)
          - P → representa o número de meses até o recebimento do valor
        * */
  const vp = installment.installment.value / Math.pow(1 + formBaseComponent.value.monthlyFee, dueDate)

  return {
    vp,
    dueDate
  }
}

</script>

<style>
.test {
  color: rgba(28, 62, 59, 0.58);
}
</style>

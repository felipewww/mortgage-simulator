<template>
  <div class="card mb-3">
    <div class="card-header">Financiamento</div>
    <div class="card-body">
      <div class="row">
<!--        <div>-->
<!--          {{exposed}}-->
<!--        </div>-->
        <div class="col">
          <label class="form-label">Valor do imóvel</label>
          <div class="input-group mb-3">
            <span class="input-group-text">R$</span>
            <input type="number" class="form-control" placeholder="Valor do imóvel" v-model="form.price">
            <span class="input-group-text">.000,00</span>
          </div>
        </div>

        <div class="col">
          <label class="form-label">% de entrada</label>
          <div class="input-group mb-3">
            <input type="number" class="form-control" placeholder="Entrada" max="100" min="1" v-model="form.downPaymentPercent">
            <span class="input-group-text">%</span>
          </div>
        </div>

        <div class="col">
          <label class="form-label">Entrada calculada</label>
          <div class="input-group mb-3">
            <span class="input-group-text">R$</span>
            <input type="text" class="form-control" placeholder="Valor entrada" disabled :value="downPayment?.formatted">
          </div>
        </div>
        <div class="col">
          <label class="form-label">Prazo</label>
          <div class="input-group mb-3">
            <input type="number" max="420" min="2" class="form-control" placeholder="Total em anos" v-model="form.years">
            <span class="input-group-text">anos</span>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col">
          <label class="form-label">% Juros a.a.</label>
          <div class="input-group mb-3">
            <input type="number" max="100" min="0" step="0.01" class="form-control" placeholder="Juros ao ano" v-model="form.yearlyFee">
            <span class="input-group-text">%</span>
          </div>
        </div>

        <div class="col">
          <label class="form-label">% Seguro a.a.</label>
          <div class="input-group mb-3">
            <input type="number" max="100" min="0" step="0.01" class="form-control" placeholder="Juros ao ano" v-model="form.yearlyInsuranceFee">
            <span class="input-group-text">%</span>
          </div>
        </div>

        <div class="col">
          <label class="form-label">Taxas</label>
          <div class="input-group mb-3">
            <span class="input-group-text">R$</span>
            <CurrencyInput v-model="form.tax"></CurrencyInput>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="card mb-3">
    <div class="card-header">
      Plano de Amortização
    </div>
    <div class="card-body">
      <div class="row">
        <div class="col">
          <div class="input-group mb-3">
            <span class="input-group-text">R$</span>
            <CurrencyInput v-model="amortizationForm.amount"></CurrencyInput>
          </div>
        </div>
        <div class="col">
          <div class="input-group mb-3">
            <span class="input-group-text">após</span>
            <input type="number" class="form-control" placeholder="Quantos anos" v-model="amortizationForm.yearStart">
            <span class="input-group-text">anos</span>
          </div>
        </div>
        <div class="col">
          <div class="input-group mb-3">
            <span class="input-group-text">durante</span>
            <input type="number" class="form-control" placeholder="Quantos anos" v-model="amortizationForm.years">
            <span class="input-group-text">anos</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, type ComputedRef, onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import {formatNumber, type ValueFormatted} from "@/utils/number/format-number.ts";
import CurrencyInput from "@/components/currency-input.vue";

const route = useRoute()

type QueryParams = {
  price: string,
  pct: string,
  fee: string,
  years: string,
  feeInsurance: string,
  am_a: string,
  am_y: string,
  am_ys: string,
  tax: string,
}

const query = computed(() => route.query as QueryParams);

onMounted(() => {
  if (query.value.price) {
    form.value.price = parseInt(query.value.price as string);
  }

  if (query.value.pct) {
    form.value.downPaymentPercent = parseFloat(query.value.pct as string);
  }

  if (query.value.fee) {
    form.value.yearlyFee = parseFloat(query.value.fee as string);
  }

  if (query.value.years) {
    form.value.years = parseInt(query.value.years as string);
  }

  if (query.value.feeInsurance) {
    form.value.yearlyInsuranceFee = parseFloat(query.value.feeInsurance as string);
  }

  if (query.value.tax) {
    form.value.tax = parseFloat(query.value.tax as string)
  }

  if (query.value.am_a) {
    amortizationForm.value.amount = parseInt(query.value.am_a as string);
  }

  if (query.value.am_y) {
    amortizationForm.value.years = parseInt(query.value.am_y as string);
  }

  if (query.value.am_ys) {
    amortizationForm.value.yearStart = parseInt(query.value.am_ys as string);
  }
})

type AmortizationFormData = {
  amount: number,
  years: number,
  yearStart: number,
}

const amortizationForm = ref<AmortizationFormData>({
  amount: null,
  years: null,
  yearStart: null,
})

type FormData = {
  price: number;
  downPaymentPercent: number;
  yearlyFee: number;
  yearlyInsuranceFee: number;
  tax: number;
  years: number
}

const form = ref<FormData>({
  price: 0,
  downPaymentPercent: 0,
  yearlyFee: 0,
  yearlyInsuranceFee: 0,
  tax: 0,
  years: 0,
})

// Valor total do imovel
const price = computed(() => {
  if (form.value.price) {
    return form.value.price * 1000;
  }

  return null;
})

// Valor de entrada com base no percentual escolhido
const downPayment = computed(() => {
  if (
    price.value
    && form.value.downPaymentPercent
  ) {
    const value = price.value * (form.value.downPaymentPercent / 100);

    return formatNumber(value);
  }

  return null;
})

// valor do imovel MENOS entrada, o valor a ser financiado
const totalLoan = computed(() => {
  if (
    price.value
    && downPayment.value
  ) {
    return price.value - downPayment.value.value;
  }

  return null;
})

// converter meses para anos
const months = computed(() => {
  if (form.value.years) {
    return form.value.years * 12;
  }

  return null;
})

// o valor sem juros dividido pelo total de meses
const rawInstallment = computed(() => {
  if (
    totalLoan.value
    && months.value
  ) {
    return parseFloat(
      (totalLoan.value / months.value).toFixed(2)
    );
  }

  return null;
})

// se for 11,9% ao ano, será 0,0093 ao mes
const monthlyFee = computed(() => {
  if (form.value.yearlyFee) {
    return (form.value.yearlyFee / 100) / 12;
  }

  return null;
})

const monthlyInsuranceFee = computed(() => {
  if (form.value.yearlyInsuranceFee) {
    return form.value.yearlyInsuranceFee
  }

  return null;
})

const tax = computed(() => {
  return form.value.tax;
})

function isFormFilled(): boolean {
  return !!(
    form.value.price
    && form.value.downPaymentPercent
    && form.value.yearlyFee
    && form.value.years
  )
}

export type FormBaseExposedData = {
  monthlyFee: ComputedRef<number | null>;
  monthlyInsuranceFee: ComputedRef<number | null>;
  rawInstallment: ComputedRef<number | null>;
  months: ComputedRef<number | null>;
  totalLoan: ComputedRef<number | null>;
  downPayment: ComputedRef<ValueFormatted>;
  isFormFilled: () => boolean;
  tax: ComputedRef<number | null>;
  amortization: AmortizationFormData
}

const exposed = ref<FormBaseExposedData>({
  monthlyFee,
  monthlyInsuranceFee,
  rawInstallment,
  months,
  totalLoan,
  downPayment,
  isFormFilled: isFormFilled,
  tax,
  amortization: amortizationForm.value,
})

defineExpose(exposed.value)
</script>

<style scoped>

</style>

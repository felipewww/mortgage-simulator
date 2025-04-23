<template>
  <div class="row">
    <div class="col">
      <div class="input-group mb-3">
        <span class="input-group-text">R$</span>
        <input type="number" class="form-control" placeholder="Valor do imóvel" v-model="form.price">
        <span class="input-group-text">.000,00</span>
      </div>
    </div>

    <div class="col">
      <div class="input-group mb-3">
        <input type="number" class="form-control" placeholder="Entrada" max="100" min="1" v-model="form.downPaymentPercent">
        <span class="input-group-text">%</span>
      </div>
    </div>

    <div class="col">
      <div class="input-group mb-3">
        <span class="input-group-text">R$</span>
        <input type="text" class="form-control" placeholder="Valor entrada" disabled :value="downPayment?.formatted">
      </div>
    </div>

    <div class="col">
      <div class="input-group mb-3">
        <span class="input-group-text">% a.a.</span>
        <input type="number" max="100" min="0" step="0.01" class="form-control" placeholder="Juros ao ano" v-model="form.yearlyFee">
      </div>
    </div>

    <div class="col">
      <div class="input-group mb-3">
        <input type="number" max="420" min="2" class="form-control" placeholder="Total em anos" v-model="form.years">
        <span class="input-group-text">anos</span>
      </div>
    </div>
  </div>

  <div class="row">
    <div class="col">
<!--      months: {{months}}-->
<!--      rawInstallment: {{rawInstallment}}-->
    </div>
    <div class="col">
<!--      totalLoan: {{totalLoan}}-->
<!--      form.yearlyFee: {{form.yearlyFee}}-->
<!--      monthlyFee: {{monthlyFee}}-->
    </div>
  </div>

<!--  <div class="d-flex justify-content-end">-->
<!--    <button class="btn btn-info" type="button" :disabled="!isFormFilled()">Calcular</button>-->
<!--  </div>-->
</template>

<script setup lang="ts">
import {computed, type ComputedRef, onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import {formatNumber} from "@/utils/number/format-number.ts";

const route = useRoute()

onMounted(() => {
  if (route.query.price) {
    form.value.price = parseInt(route.query.price as string);
  }

  if (route.query.pct) {
    form.value.downPaymentPercent = parseFloat(route.query.pct as string);
  }

  if (route.query.fee) {
    form.value.yearlyFee = parseFloat(route.query.fee as string);
  }

  if (route.query.years) {
    form.value.years = parseInt(route.query.years as string);
  }
})

type FormData = {
  price: number;
  downPaymentPercent: number;
  yearlyFee: number;
  years: number
}

const form = ref<FormData>({
  price: null,
  downPaymentPercent: null,
  yearlyFee: null,
  years: null,
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
  rawInstallment: ComputedRef<number | null>;
  months: ComputedRef<number | null>;
  totalLoan: ComputedRef<number | null>;
  isFormFilled: () => boolean;
}

const exposed: FormBaseExposedData = {
  monthlyFee,
  rawInstallment,
  months,
  totalLoan,
  isFormFilled: isFormFilled,
}

defineExpose<FormBaseExposedData>(exposed)
</script>

<style scoped>

</style>

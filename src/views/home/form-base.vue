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
        <input type="text" class="form-control" placeholder="Valor entrada" disabled :value="downPayment">
      </div>
    </div>
  </div>

  <div class="d-flex justify-content-end">
    <button class="btn btn-info" type="button">Calcular</button>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";

type FormData = {
  price: number;
  downPaymentPercent: number;
}

const form = ref<FormData>({
  price: null,
  downPaymentPercent: null,
})

const price = computed(() => {
  if (form.value.price) {
    return form.value.price * 1000;
  }
})

const downPayment = computed(() => {
  if (
    price.value
    && form.value.downPaymentPercent
  ) {
    const value = price.value * (form.value.downPaymentPercent / 100);

    return new Intl.NumberFormat('pt-BR', {
      // style: 'currency',
      // currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(value);
  }
})
</script>

<style scoped>

</style>

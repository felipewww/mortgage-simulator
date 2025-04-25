<template>
  <div>
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
          {{installment.installmentFee.formatted}}
        </div>
        <div class="col">
          {{installment.installmentFull.formatted}}
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
            <span v-if="installment.amortization.exists">
              <span class="amortization-info mr-1">
                <span
                  class="badge text-dark"
                  :style="getRandomColor(installment.amortization.year)"
                >
                  {{installment.amortization.year}}
                </span>
                <span
                  class="badge rounded-pill text-dark"
                  :style="getRandomColor(installment.amortization.year)"
                >
                  {{installment.amortization.dueDate}}
                </span>
              </span>
              <span class="ml-2">{{installment.amortization.vp.formatted}}</span>
            </span>
          <span v-else>-</span>
        </div>
        <div class="col">
          {{installment.balance.formatted}}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from "vue";
import {getRandomTopRightColor} from "@/utils/random-color.ts";
import {Installment} from "@/domain/installment";

defineProps({
  installments: {
    type: Object as () => Installment[]
  }
})

type AmortizationColorsType = {
  [year: string]: {
    [cssProp: string]: string;
  }
}

const amortizationColors = ref<AmortizationColorsType>({})

function getRandomColor(
  yearRef: number,
) {

  if (amortizationColors.value[yearRef.toString()]) {
    return amortizationColors.value[yearRef.toString()];
  }

  const styles: { [key: string]: string; } = {};

  styles.backgroundColor = getRandomTopRightColor()

  amortizationColors.value[yearRef.toString()] = styles

  return styles
}
</script>

<style scoped>

</style>

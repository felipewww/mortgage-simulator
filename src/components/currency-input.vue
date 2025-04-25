<template>
  <input @keydown="blockNonDigits" @input="reformat" type="text" class="form-control" v-model="v.formatted">
</template>

<script setup lang="ts">
import {formatNumber} from "@/utils/number/format-number.ts";
import {computed} from "vue";

const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  }
})

const emit = defineEmits(['update:modelValue']);

const v = computed(() => {
  return formatNumber(props.modelValue)
})

function blockNonDigits(e: KeyboardEvent) {
  if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
    e.preventDefault()
    return;
  }
}

function reformat() {


  const nv = v.value.formatted.replace(/[^0-9]/g, "")

  let nvNumber = parseFloat(nv)

  if (!nvNumber) {
    nvNumber = 0
  }

  emit('update:modelValue', nvNumber / 100);
}
</script>

<style scoped>

</style>

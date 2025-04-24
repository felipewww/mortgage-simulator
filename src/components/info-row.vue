<template>
  <div class="d-flex justify-content-between mb-2">
    <span :class="`badge bg-${bgColor} ${textColor}`">{{title}}</span>
    <span>{{content}}</span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  bgColor: {
    type: String,
    required: true,
  },
  textColor: {
    type: String,
    required: false,
    default: 'text-black'
  },
});
</script>

<style scoped>

</style>

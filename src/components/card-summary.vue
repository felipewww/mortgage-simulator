<template>
  <div class="col">
    <div class="card">
      <div class="card-header d-flex justify-content-between">
        <div>
          {{title}}
        </div>
        <div>
          <div class="badge bg-primary">
            <slot name="tag"></slot>
          </div>
        </div>
      </div>
      <div class="card-body">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  }
})
</script>

<style scoped>

</style>

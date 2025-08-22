<template>
  <header class="bg-blue-600 text-white p-4">
    <nav class="container mx-auto flex justify-between items-center">
      <h1 class="text-xl font-bold">{{projectName}}</h1>
      <div class="space-x-4">
        <router-link to="/" class="hover:text-blue-200">Home</router-link>
        <router-link to="/about" class="hover:text-blue-200">About</router-link>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
// Component logic here
</script>

<style scoped>
.router-link-active {
  font-weight: bold;
}
</style>

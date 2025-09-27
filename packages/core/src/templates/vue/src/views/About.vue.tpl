<template>
  <div class="container mx-auto p-8">
    <h1 class="text-4xl font-bold text-center mb-6">About {{projectName}}</h1>
    <div class="max-w-2xl mx-auto">
      <p class="text-lg text-gray-700 mb-4">
        This is {{projectName}}, a Vue.js application created with StackCode.
      </p>
      <p class="text-lg text-gray-700 mb-4">
        {{description}}
      </p>
      <p class="text-lg text-gray-700">
        Built with love by {{authorName}} using Vue 3, TypeScript, and Vite.
      </p>
    </div>
    <div class="text-center mt-8">
      <router-link 
        to="/" 
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Back to Home
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// About page logic
</script>

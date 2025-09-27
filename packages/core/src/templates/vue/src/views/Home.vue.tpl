<template>
  <div class="container mx-auto p-8">
    <h1 class="text-4xl font-bold text-center mb-6">Welcome to {{projectName}}!</h1>
    <p class="text-lg text-center text-gray-600 mb-8">{{description}}</p>
    <div class="text-center space-x-4">
      <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Get Started
      </button>
      <router-link 
        to="/about" 
        class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-block"
      >
        Learn More
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// Home page logic
</script>

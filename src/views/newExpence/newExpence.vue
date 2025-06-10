<template>
  <div>
    <h1>Your Expense Page</h1>
    <div class="btn">
    <CButton color="primary" @click="showModal = true">Add Expense</CButton>
    </div>
    <ExpenseModal
      :isVisible="showModal"
      @close="showModal = false"
      @submit="handleNewExpense"
    />
    <ExpenseList/>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { CButton } from '@coreui/vue';
import ExpenseModal from './formModal.vue';
import ExpenseList from './ExpenseList.vue';

const showModal = ref(false);

const handleNewExpense = (expense) => {
  console.log('New expense added:', expense);
  // The ExpenseList will automatically update due to realtime listener
};
</script>

<style scoped>
/* Your custom styles */
.btn{
  display: flex;
  justify-content: end;
}
h1{
  text-align: center;
}
</style>
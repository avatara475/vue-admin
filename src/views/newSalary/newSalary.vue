<!-- <template>
  <div>
    <h1>Your Salary Page</h1>
    <CButton color="primary" @click="showModal = true">Add Salary</CButton>
    
    <ExpenseModal
      :isVisible="showModal"
      @close="showModal = false"
      @submit="handleExpenseSubmit"
    />
  </div>
</template> -->
<template>
  <div>
    <h1>Your Salary Page</h1>
    <div class="btn">
    <CButton color="primary"  @click="showModal = true">Add Salary</CButton>
    </div>
    <ExpenseModal 
      :isVisible="showModal"
      @close="showModal = false"
      @submitted="handleNewSalary"
    />
    <ExpenseList />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { CButton } from '@coreui/vue';
import ExpenseModal from './formModal.vue';
 import ExpenseList from "./SalaryList.vue"

const showModal = ref(false);

const handleNewSalary = (salary) => {
  console.log('New expense added:', salary);
  // The ExpenseList will automatically update due to realtime listener
};
</script>

<style scoped>
/* Your custom styles */
.btn{
  justify-content: end;
  display: flex;
}
h1{
  text-align: center;
}
</style>
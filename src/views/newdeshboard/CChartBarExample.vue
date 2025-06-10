<script setup>
import { ref, computed, onMounted } from 'vue'
import { CChartBar } from '@coreui/vue-chartjs'
import { ref as dbRef, onValue } from 'firebase/database'
import { database } from '@/firebase'

// Fetch data from Firebase
const expenses = ref([])
const salaries = ref([])
const selectedYear = ref(new Date().getFullYear()) // Default to current year

// Available years for dropdown
const availableYears = computed(() => {
  const years = new Set()
  // Get years from expenses
  expenses.value.forEach(exp => {
    if (exp.date) {
      years.add(new Date(exp.date).getFullYear())
    }
  })
  // Get years from salaries
  salaries.value.forEach(sal => {
    if (sal.date) {
      years.add(new Date(sal.date).getFullYear())
    }
  })
  return Array.from(years).sort((a, b) => b - a) // Sort descending
})

// Fetch data from Firebase
onMounted(() => {
  const expensesRef = dbRef(database, 'expense')
  const salariesRef = dbRef(database, 'salary')
  
  onValue(expensesRef, (snapshot) => {
    const data = snapshot.val()
    expenses.value = data ? Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    })) : []
  })
  
  onValue(salariesRef, (snapshot) => {
    const data = snapshot.val()
    salaries.value = data ? Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    })) : []
  })
})

// Prepare chart data
const chartData = computed(() => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  // Initialize monthly totals
  const monthlyExpenses = Array(12).fill(0)
  const monthlySalaries = Array(12).fill(0)
  
  // Calculate expenses for selected year
  expenses.value.forEach(exp => {
    if (exp.date && exp.amount) {
      const date = new Date(exp.date)
      if (date.getFullYear() === selectedYear.value) {
        const month = date.getMonth()
        monthlyExpenses[month] += parseFloat(exp.amount) || 0
      }
    }
  })
  
  // Calculate salaries for selected year
  salaries.value.forEach(sal => {
    if (sal.date && sal.amount) {
      const date = new Date(sal.date)
      if (date.getFullYear() === selectedYear.value) {
        const month = date.getMonth()
        monthlySalaries[month] += parseFloat(sal.amount) || 0
      }
    }
  })
  
  return {
    labels: months,
    datasets: [
      {
        label: 'Expenses',
        backgroundColor: '#f87979',
        data: monthlyExpenses,
      },
      {
        label: 'Salaries',
        backgroundColor: '#42b983',
        data: monthlySalaries,
      }
    ]
  }
})
</script>

<template>
  <div class="mb-3">
    <label for="year-select" class="form-label">Select Year:</label>
    <select 
      id="year-select" 
      v-model="selectedYear" 
      class="form-select"
      style="width: 150px;"
    >
      <option v-for="year in availableYears" :key="year" :value="year">
        {{ year }}
      </option>
    </select>
  </div>
  
  <CChartBar 
    :data="chartData" 
    :options="{
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ₹${context.raw.toLocaleString()}`
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return '₹' + value.toLocaleString()
            }
          }
        }
      }
    }"
  />
</template>

<style scoped>
.form-select {
  display: inline-block;
  margin-left: 10px;
}
</style>
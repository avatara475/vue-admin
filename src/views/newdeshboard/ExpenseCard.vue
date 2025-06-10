<template>
  <CCard style="width: 18rem; background-color: #EEAD20;">
    <CCardBody>
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <CCardTitle class="text-white">Expense</CCardTitle>
          <CCardSubtitle class="mb-2 text-white-50">Expense Overview</CCardSubtitle>
        </div>
      </div>
      
      <div class="my-2">
        <span class="fs-4 fw-bold text-white">
          {{ formatCurrency(currentMonthExpenses) }}
          <span class="fs-6 fw-normal text-white-50">This Month</span>
        </span>
        <br>
        <span class="fs-4 fw-bold text-white">
          {{ formatCurrency(totalExpenses) }}
          <span class="fs-6 fw-normal text-white-50">Overall</span>
        </span>
      </div>
      
      <!-- <CChart
        type="line"
        class="mt-3 mx-3"
        style="height: 70px"
        :data="{
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
          datasets: [
            {
               label: 'Expenses',
              backgroundColor: 'transparent',
              borderColor: 'rgba(255,255,255,.55)',
              pointBackgroundColor: 'rgba(255,255,255,.55)',
              data: [68, 59, 84, 84, 51, 55, 40],
            },
          ],
        }"
        :options="{
          plugins: {
            legend: {
              display: false,
            },
          },
          maintainAspectRatio: false,
          scales: {
            x: {
              border: {
                display: false,
              },
              grid: {
                display: false,
              },
              ticks: {
                display: false,
              },
            },
            y: {
              min: 30,
              max: 89,
              display: false,
              grid: {
                display: false,
              },
              ticks: {
                display: false,
              },
            },
          },
          elements: {
            line: {
              borderWidth: 1,
              tension: 0.4,
            },
            point: {
              radius: 4,
              hitRadius: 10,
              hoverRadius: 4,
            },
          },
        }"
      /> -->
   <CChart
  type="line"
  class="mt-3 mx-3"
  style="height: 70px"
  :data="{
    labels: monthNames,
    datasets: [{
      label: 'Expenses',
      backgroundColor: 'transparent',
      borderColor: 'rgba(255,255,255,.55)',
      pointBackgroundColor: 'rgba(255,255,255,.55)',
      data: expensesByMonth,
    }],
  }"
  :options="{
    plugins: { legend: { display: false } },
    maintainAspectRatio: false,
    scales: {
      x: {
        border: { display: false },
        grid: { display: false },
        ticks: { display: false },
      },
      y: {
        display: false,
        grid: { display: false },
        ticks: { display: false },
      },
    },
    elements: {
      line: { borderWidth: 1, tension: 0.4 },
      point: { radius: 4, hitRadius: 10, hoverRadius: 4 },
    },
  }"
/>

    </CCardBody>
  </CCard>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ref as dbRef, onValue } from 'firebase/database';
import { database } from '@/firebase';
import { CChart } from '@coreui/vue-chartjs';
import { 
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem
} from '@coreui/vue';
import CIcon from '@coreui/icons-vue';

const expenses = ref([]);
const loading = ref(true);

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Calculate expenses grouped by month name (ignoring year)
const expensesByMonth = computed(() => {
  const monthlyTotals = Array(12).fill(0); // 12 months

  expenses.value.forEach(expense => {
    if (expense.date) {
      const dateObj = new Date(expense.date);
      const monthIndex = dateObj.getMonth(); // 0-11
      monthlyTotals[monthIndex] += Number(expense.amount) || 0;
    }
  });

  return monthlyTotals;
});


// Get current month in YYYY-MM format
const currentMonth = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
});

// Calculate total expenses
const totalExpenses = computed(() => {
  return expenses.value.reduce((sum, expense) => {
    const amount = Number(expense.amount) || 0;
    return sum + amount;
  }, 0);
});

// Calculate current month expenses
const currentMonthExpenses = computed(() => {
  return expenses.value
    .filter(expense => {
      const expenseMonth = expense.date?.substring(0, 7);
      return expenseMonth === currentMonth.value;
    })
    .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
});

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Fetch expenses from Firebase
onMounted(() => {
  const expensesRef = dbRef(database, 'expense');
  
  onValue(expensesRef, (snapshot) => {
    const data = snapshot.val();
    expenses.value = data ? Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    })) : [];
    loading.value = false;
  });
});
</script>

<style>
/* Custom styling to match the widget stats look */
.card {
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.card-subtitle {
  font-size: 0.875rem;
  opacity: 0.8;
}

.fs-4 {
  font-size: 1.5rem;
}

.fs-6 {
  font-size: 0.875rem;
}

.fw-bold {
  font-weight: 700;
}

.fw-normal {
  font-weight: 400;
}

.text-white-50 {
  color: rgba(255, 255, 255, 0.5);
}
</style>
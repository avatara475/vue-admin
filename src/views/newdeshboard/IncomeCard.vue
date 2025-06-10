<!-- <template>
    <CCard style="width: 18rem;background-color: #5E5CD0;">
              <CCardBody>
                <CCardTitle>Income</CCardTitle>
                <CCardSubtitle class="mb-2 text-body-secondary"
                  >Income Overview</CCardSubtitle
                >
                <CCardText>
                  This Month:{{ formatCurrency(currentMonthSalary) }}<br/>
                  overall:{{ formatCurrency(totalSalary) }}
                </CCardText>
              </CCardBody>
      </CCard>

</template> -->
<template>
  <CCard style="width: 18rem; background-color: #5E5CD0;">
    <CCardBody>
      <div class="d-flex justify-content-between align-items-start">
        <div>
          <CCardTitle class="text-white">Salary</CCardTitle>
          <CCardSubtitle class="mb-2 text-white-50">Salary Overview</CCardSubtitle>
        </div>
      </div>
      
      <div class="my-2">
        <span class="fs-4 fw-bold text-white">
          {{ formatCurrency(currentMonthSalary) }}
          <span class="fs-6 fw-normal text-white-50">This Month</span>
        </span>
        <br>
        <span class="fs-4 fw-bold text-white">
          {{ formatCurrency(totalSalary) }}
          <span class="fs-6 fw-normal text-white-50">Overall</span>
        </span>
      </div>
      
      <CChart
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
              data: [40, 45, 80, 70, 85, 55, 80],
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



const salary = ref([]);
const loading = ref(true);

// Get current month in YYYY-MM format
const currentMonth = computed(() => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
});

const currentMonthName = computed(() => {
  return new Date().toLocaleString('default', { month: 'long' });
});

// Calculate total salary
const totalSalary = computed(() => {
  return salary.value.reduce((sum, expense)=> {
    const amount = Number(expense.amount) || 0; // Convert to number, default to 0 if invalid
    return sum + amount;
  }, 0);
});

// Calculate current month salary
// const currentMonthSalary = computed(() => {
//   return salary.value
//     .filter(expense => expense.month === currentMonth.value)
//     .reduce((sum, expense) => sum + expense.amount, 0);
// });

const currentMonthSalary = computed(() => {
  return salary.value
    .filter(expense => {
      // Extract YYYY-MM part from the YYYY-MM-DD date
      const expenseMonth = expense.date.substring(0, 7);
      return expenseMonth === currentMonth.value;
    })
    .reduce((sum, expense)  => {
      const amount = Number(expense.amount) || 0; // Convert to number, default to 0 if invalid
      return sum + amount;
    }, 0);
});

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(value);
};

// Fetch salary from Firebase
onMounted(() => {
  const salaryRef = dbRef(database, 'salary');
  
  onValue(salaryRef, (snapshot) => {
    const data = snapshot.val();
    salary.value = data ? Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    })) : [];
    loading.value = false;
  });
});
</script>
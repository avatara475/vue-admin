<template>
  <div>
    <h2>Salary List</h2>
    
    <!-- Search Input -->
    <div class="search-container mb-3">
      <CFormInput
        v-model="searchQuery"
        placeholder="Search salaries..."
        class="search-input"
      />
      <CButton @click="clearSearch" color="secondary" class="ms-2">
        Clear
      </CButton>
    </div>
    
    <CTable striped hover>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell @click="sortBy('date')" class="sortable-header">
            Date {{ getSortIndicator('date') }}
          </CTableHeaderCell>
          <CTableHeaderCell @click="sortBy('amount')" class="sortable-header">
            Amount {{ getSortIndicator('amount') }}
          </CTableHeaderCell>
          <CTableHeaderCell @click="sortBy('to')" class="sortable-header">
            To {{ getSortIndicator('to') }}
          </CTableHeaderCell>
          <CTableHeaderCell @click="sortBy('month')" class="sortable-header">
            Month {{ getSortIndicator('month') }}
          </CTableHeaderCell>
          <CTableHeaderCell>Actions</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        <div v-if="loading" class="spinneres"> 
                <div class="spinner-border text-primary text-center" role="status">
                <span class="visually-hidden">Loading...</span>
                </div>
         </div>
        <CTableRow v-for="salary in paginatedSalaries" :key="salary.id" v-else>
          <CTableDataCell>{{ formatDate(salary.date) }}</CTableDataCell>
          <CTableDataCell>₹{{ salary.amount }}</CTableDataCell>
          <CTableDataCell>{{ salary.to }}</CTableDataCell>
          <CTableDataCell>{{ salary.month }}</CTableDataCell>
          <CTableDataCell>
            <CButton 
              color="primary" 
              size="sm" 
              @click="openEditModal(salary)"
            >
              Edit
            </CButton>
          </CTableDataCell>
        </CTableRow>
      </CTableBody>
    </CTable>

    <!-- Pagination Controls -->
    <div class="pagination-container mt-3 mb-3">
      <div class="pagination-info">
        Showing {{ startItem }} to {{ endItem }} of {{ filteredSalaries.length }} entries
      </div>
      <div class="pagination-controls">
        <CButton 
          color="secondary" 
          size="sm" 
          @click="prevPage" 
          :disabled="currentPage === 1"
        >
          Previous
        </CButton>
        <span class="page-indicator mx-2">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <CButton 
          color="secondary" 
          size="sm" 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
        >
          Next
        </CButton>
      </div>
      <div class="page-size-selector">
        <select v-model="itemsPerPage" @change="resetPagination">
          <option value="5">5 per page</option>
          <option value="10">10 per page</option>
          <option value="20">20 per page</option>
          <option value="50">50 per page</option>
        </select>
      </div>
    </div>

    <!-- Edit Modal -->
    <EditSalaryModal
      :visible="showEditModal"
      :salary="selectedSalary"
      @close="closeEditModal"
      @update="handleSalaryUpdate"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ref as dbRef, onValue } from 'firebase/database';
import { database } from '@/firebase';
import {
  CTable,
  CTableHead,
  CTableHeaderCell,
  CTableBody,
  CTableRow,
  CTableDataCell,
  CFormInput,
  CButton
} from '@coreui/vue';
import EditSalaryModal from './EditSalaryModal'

const salaryes = ref([]);
const searchQuery = ref('');
const sortField = ref('date');
const sortDirection = ref('asc');
const showEditModal = ref(false);
const selectedSalary = ref(null);
const loading = ref(true); // Add loading state

// Pagination variables
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Open edit modal
const openEditModal = (salary) => {
  selectedSalary.value = {...salary};
  showEditModal.value = true;
};

// Close edit modal
const closeEditModal = () => {
  showEditModal.value = false;
};

// Handle expense update
const handleSalaryUpdate = (updatedSalary) => {
  const index = salaryes.value.findIndex(s => s.id === updatedSalary.id);
  if (index !== -1) {
    salaryes.value[index] = {...updatedSalary};
  }
};

// Fetch salaries from Firebase
const fetchSalary = () => {
  loading.value = true;
  const salaryRef = dbRef(database, 'salary');
  onValue(salaryRef, (snapshot) => {
    const data = snapshot.val();
    salaryes.value = data ? Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    })) : [];
    // Reset to first page when data changes
    currentPage.value = 1;
    loading.value = false;
  });
};

// Computed property for filtered salaries
const filteredSalaries = computed(() => {
  if (!searchQuery.value) return salaryes.value;
  
  const query = searchQuery.value.toLowerCase().trim();
  return salaryes.value.filter(salary => 
    (salary.to && salary.to.toLowerCase().includes(query)) ||
    (salary.month && salary.month.toLowerCase().includes(query)) ||
    (salary.amount && salary.amount.toString().includes(query)) ||
    (salary.date && salary.date.includes(query))
  );
});

// Computed property for sorted salaries
const sortedSalaries = computed(() => {
  const filtered = filteredSalaries.value;
  if (!sortField.value) return filtered;

  return [...filtered].sort((a, b) => {
    let modifier = 1;
    if (sortDirection.value === 'desc') modifier = -1;

    // Handle date sorting specially
    if (sortField.value === 'date') {
      return (new Date(a.date) - new Date(b.date)) * modifier;
    }

    // Handle amount sorting (convert to number)
    if (sortField.value === 'amount') {
      return (parseFloat(a.amount) - parseFloat(b.amount)) * modifier;
    }

    // Default string comparison for other fields
    if (a[sortField.value] < b[sortField.value]) return -1 * modifier;
    if (a[sortField.value] > b[sortField.value]) return 1 * modifier;
    return 0;
  });
});

// Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(filteredSalaries.value.length / itemsPerPage.value);
});

const paginatedSalaries = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedSalaries.value.slice(start, end);
});

const startItem = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value + 1;
});

const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage.value;
  return end > filteredSalaries.value.length ? filteredSalaries.value.length : end;
});

// Pagination methods
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const resetPagination = () => {
  currentPage.value = 1;
};

// Sort by field
const sortBy = (field) => {
  if (sortField.value === field) {
    // Reverse sort direction if clicking the same field
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    // Default to ascending when clicking a new field
    sortField.value = field;
    sortDirection.value = 'asc';
  }
  resetPagination();
};

// Get sort indicator for a field
const getSortIndicator = (field) => {
  if (sortField.value !== field) return '';
  return sortDirection.value === 'asc' ? '↑' : '↓';
};

// Clear search
const clearSearch = () => {
  searchQuery.value = '';
  resetPagination();
};

onMounted(() => fetchSalary());
</script>

<style>
h2 {
  text-align: center;
  color: #5E5CD0;
}
.search-container {
  display: flex;
  max-width: 500px;
  margin: 0 auto 20px;
}
.search-input {
  flex-grow: 1;
}
.sortable-header {
  cursor: pointer;
  user-select: none;
}
.sortable-header:hover {
  background-color: #f5f5f5;
}
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}
.pagination-controls {
  display: flex;
  align-items: center;
}
.page-indicator {
  min-width: 100px;
  text-align: center;
}
.page-size-selector select {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid #ced4da;
}
@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    align-items: stretch;
  }
  .pagination-controls {
    justify-content: center;
    margin: 0.5rem 0;
  }
}
.spinner-border {
  width: 3rem;
  height: 3rem;
}
.spinneres{
  margin-left:40rem;
  margin-top: 4rem;
}
</style>
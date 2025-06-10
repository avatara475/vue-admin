<template>
  <div>
    <h2>Expense List</h2>
    
    <!-- Loader -->
    <!-- <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading expenses...</p>
    </div> -->
    <div>
    <!-- Search Input -->
    <div class="search-container mb-3">
      <CFormInput
        v-model="searchQuery"
        placeholder="Search expenses..."
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
          <CTableHeaderCell @click="sortBy('from')" class="sortable-header">
            From {{ getSortIndicator('from') }}
          </CTableHeaderCell>
          <CTableHeaderCell @click="sortBy('title')" class="sortable-header">
            Title {{ getSortIndicator('title') }}
          </CTableHeaderCell>
          <CTableHeaderCell>Description</CTableHeaderCell>
          <CTableHeaderCell @click="sortBy('category')" class="sortable-header">
            Category {{ getSortIndicator('category') }}
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
        <CTableRow v-for="expense in paginatedExpenses" :key="expense.id" v-else>
          <CTableDataCell>{{ formatDate(expense.date) }}</CTableDataCell>
          <CTableDataCell>₹{{ expense.amount }}</CTableDataCell>
          <CTableDataCell>{{ expense.from }}</CTableDataCell>
          <CTableDataCell>{{ expense.title }}</CTableDataCell>
          <CTableDataCell>{{ expense.description }}</CTableDataCell>
          <CTableDataCell>{{ expense.category }}</CTableDataCell>
          <CTableDataCell>
            <CButton 
              color="primary" 
              size="sm" 
              @click="openEditModal(expense)"
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
        Showing {{ startItem }} to {{ endItem }} of {{ filteredExpenses.length }} entries
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
    <EditExpenseModal
      :visible="showEditModal"
      :expense="selectedExpense"
      @close="closeEditModal"
      @update="handleExpenseUpdate"
    />
  </div>
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
import EditExpenseModal from './EditExpenseModal'

const expenses = ref([]);
const searchQuery = ref('');
const sortField = ref('date');
const sortDirection = ref('asc');
const showEditModal = ref(false);
const selectedExpense = ref(null);
const loading = ref(true); // Add loading state

// Pagination variables
const currentPage = ref(1);
const itemsPerPage = ref(10);

// Fetch expenses from Firebase
const fetchExpenses = () => {
  loading.value = true;
  const expensesRef = dbRef(database, 'expense');
  onValue(expensesRef, (snapshot) => {
    const data = snapshot.val();
    expenses.value = data ? Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    })) : [];
    // Reset to first page when data changes
    currentPage.value = 1;
     loading.value = false;
  });
};

// Computed property for filtered expenses
const filteredExpenses = computed(() => {
  if (!searchQuery.value) return expenses.value;
  
  const query = searchQuery.value.toLowerCase().trim();
  return expenses.value.filter(expense => 
    (expense.title && expense.title.toLowerCase().includes(query)) ||
    (expense.description && expense.description.toLowerCase().includes(query)) ||
    (expense.category && expense.category.toLowerCase().includes(query)) ||
    (expense.from && expense.from.toLowerCase().includes(query)) ||
    (expense.amount && expense.amount.toString().includes(query)) ||
    (expense.date && expense.date.includes(query))
  );
});

// Computed property for sorted expenses
const sortedExpenses = computed(() => {
  const filtered = filteredExpenses.value;
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
  return Math.ceil(filteredExpenses.value.length / itemsPerPage.value);
});

const paginatedExpenses = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return sortedExpenses.value.slice(start, end);
});

const startItem = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value + 1;
});

const endItem = computed(() => {
  const end = currentPage.value * itemsPerPage.value;
  return end > filteredExpenses.value.length ? filteredExpenses.value.length : end;
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

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Open edit modal
const openEditModal = (expense) => {
  selectedExpense.value = {...expense};
  showEditModal.value = true;
};

// Close edit modal
const closeEditModal = () => {
  showEditModal.value = false;
};

// Handle expense update
const handleExpenseUpdate = (updatedExpense) => {
  const index = expenses.value.findIndex(e => e.id === updatedExpense.id);
  if (index !== -1) {
    expenses.value[index] = {...updatedExpense};
  }
};

onMounted(() => fetchExpenses());
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
.actions-cell {
  white-space: nowrap;
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
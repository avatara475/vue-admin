<!-- <template>
  <CModal :visible="visible" @close="closeModal" size="lg">
    <CModalHeader>
      <CModalTitle>Edit Expense</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm @submit.prevent="handleSubmit">

        <div class="mb-3">
            <CFormLabel>Title</CFormLabel>
            <CFormInput 
              v-model="editedExpense.title" 
              required
            />
          </div>
        
        <div class="mb-3">
          <CFormLabel>Description</CFormLabel>
          <CFormTextarea 
            v-model="editedExpense.description" 
            rows="3"
          />
        </div>

         <div class="mb-3">
            <CFormLabel>Amount</CFormLabel>
            <CFormInput 
              v-model="editedExpense.amount" 
              type="number" 
              step="0.01" 
              min="1"
              @keydown="preventInvalidChars"
              required
            />
          </div>

        <div class="mb-3">
            <CFormLabel>Date</CFormLabel>
            <CFormInput 
              v-model="editedExpense.date" 
              type="date" 
              required
            />
          </div>
    
           <div class="mb-3">
          <CFormLabel>Category</CFormLabel>
            <CFormSelect
          v-model="editedExpense.category"
        >
          <option value="" >Select a category</option>
          <option value="petrol">Petrol</option>
          <option value="food">Food</option>
          <option value="money-transfer">Money Transfer</option>
          <option value="other">Other</option>
        </CFormSelect>
        </div>

        
        <div class="mb-3">
            <CFormLabel>From</CFormLabel>
            <CFormSelect
          v-model="editedExpense.from"
        >
          <option value="" >Select sender</option>
          <option value="userA">User A</option>
          <option value="userB">User B</option>
          <option value="other">Other</option>
        </CFormSelect>
          </div>
        </CForm>
    </CModalBody>

    <CModalFooter>
       
          <CButton color="secondary" class="me-2" @click="closeModal">
            Cancel
          </CButton>
          <CButton @click="handleSubmit" color="primary">
            Save Changes
          </CButton>
        
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ref as dbRef,update } from 'firebase/database'
import { database } from '@/firebase'
import { useToast } from 'vue-toastification'

const toast = useToast()
const props = defineProps({
  visible: Boolean,
  expense: Object
})

const emit = defineEmits(['close', 'update'])

const editedExpense = ref({...props.expense})

watch(() => props.expense, (newExpense) => {
  editedExpense.value = {...newExpense}
})

const closeModal = () => {
  emit('close')
}
// Prevent typing invalid characters
const preventInvalidChars = (e) => {
  if (['e', 'E', '+', '-'].includes(e.key)) {
    e.preventDefault();
  }
};

const handleSubmit = async () => {
  try {
    const expenseRef = dbRef(database, `expense/${props.expense.id}`)
    await update(expenseRef, editedExpense.value)
    emit('update', editedExpense.value)
    closeModal()
    toast.success("Edit Successfully")
  } catch (error) {
    console.error('Error updating expense:', error)
    toast.danger("Edit Unsuccessfully")
  }
}
</script> -->


<template>
  <CModal :visible="visible" @close="closeModal" size="lg">
    <CModalHeader>
      <CModalTitle>Edit Expense</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm @submit.prevent="handleSubmit">
        <div class="mb-3">
          <CFormLabel>Title</CFormLabel>
          <CFormInput 
            v-model="editedExpense.title" 
            :invalid="errors.title"
          />
          <CFormFeedback invalid>{{ errors.title }}</CFormFeedback>
        </div>
        
        <div class="mb-3">
          <CFormLabel>Description</CFormLabel>
          <CFormTextarea 
            v-model="editedExpense.description" 
            rows="3"
            :invalid="errors.description"
          />
          <CFormFeedback invalid>{{ errors.description }}</CFormFeedback>
        </div>

        <div class="mb-3">
          <CFormLabel>Amount</CFormLabel>
          <CFormInput 
            v-model="editedExpense.amount" 
            type="number" 
            step="0.01" 
            min="1"
            @keydown="preventInvalidChars"
            :invalid="errors.amount"
          />
          <CFormFeedback invalid>{{ errors.amount }}</CFormFeedback>
        </div>

        <div class="mb-3">
          <CFormLabel>Date</CFormLabel>
          <CFormInput 
            v-model="editedExpense.date" 
            type="date" 
            :invalid="errors.date"
          />
          <CFormFeedback invalid>{{ errors.date }}</CFormFeedback>
        </div>
    
        <div class="mb-3">
          <CFormLabel>Category</CFormLabel>
          <CFormSelect
            v-model="editedExpense.category"
            :invalid="errors.category"
          >
            <option value="">Select a category</option>
            <option value="petrol">Petrol</option>
            <option value="food">Food</option>
            <option value="money-transfer">Money Transfer</option>
            <option value="other">Other</option>
          </CFormSelect>
          <CFormFeedback invalid>{{ errors.category }}</CFormFeedback>
        </div>

        <div class="mb-3">
          <CFormLabel>From</CFormLabel>
          <CFormSelect
            v-model="editedExpense.from"
            :invalid="errors.from"
          >
            <option value="">Select sender</option>
            <option value="userA">User A</option>
            <option value="userB">User B</option>
            <option value="other">Other</option>
          </CFormSelect>
          <CFormFeedback invalid>{{ errors.from }}</CFormFeedback>
        </div>
      </CForm>
    </CModalBody>

    <CModalFooter>
      <CButton color="secondary" class="me-2" @click="closeModal">
        Cancel
      </CButton>
      <CButton @click="handleSubmit" color="primary">
        Save Changes
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ref as dbRef, update } from 'firebase/database'
import { database } from '@/firebase'
import { useToast } from 'vue-toastification'
import * as yup from 'yup'

const toast = useToast()
const props = defineProps({
  visible: Boolean,
  expense: Object
})

const emit = defineEmits(['close', 'update'])

const editedExpense = ref({...props.expense})
const errors = ref({})

// Define validation schema
const expenseSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  amount: yup.number()
    .required('Amount is required')
    .min(0.01, 'Amount must be greater than 0')
    .typeError('Amount must be a number'),
  date: yup.string().required('Date is required'),
  category: yup.string().required('Category is required'),
  from: yup.string().required('Sender is required')
})

watch(() => props.expense, (newExpense) => {
  editedExpense.value = {...newExpense}
})

const closeModal = () => {
  errors.value = {}
  emit('close')
}

const preventInvalidChars = (e) => {
  if (['e', 'E', '+', '-'].includes(e.key)) {
    e.preventDefault();
  }
};

const handleSubmit = async () => {
  try {
    // Validate form
    await expenseSchema.validate(editedExpense.value, { abortEarly: false })
    errors.value = {}
    
    const expenseRef = dbRef(database, `expense/${props.expense.id}`)
    await update(expenseRef, editedExpense.value)
    emit('update', editedExpense.value)
    closeModal()
    toast.success("Edit Successfully")
  } catch (error) {
    if (error.name === 'ValidationError') {
      // Handle validation errors
      const newErrors = {}
      error.inner.forEach(err => {
        newErrors[err.path] = err.message
      })
      errors.value = newErrors
    } else {
      console.error('Error updating expense:', error)
      toast.error("Edit Unsuccessfully")
    }
  }
}
</script>
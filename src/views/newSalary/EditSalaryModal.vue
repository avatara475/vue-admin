<!-- <template>
  <CModal
    :visible="visible"
    @close="close"
    size="lg"
  >
    <CModalHeader>
      <CModalTitle>Edit Salary</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm>
        <div class="mb-3">
          <CFormLabel for="Month">Month</CFormLabel>
          <CFormInput
          type="month"
          v-model="editedSalary.month"
        />
        </div>

        <div class="mb-3">
          <CFormLabel for="amount">Amount</CFormLabel>
          <CFormInput
            type="number"
            id="amount"
            min="1"
            v-model="editedSalary.amount"
            @keydown="preventInvalidChars"
            required
          />
        </div>

        <div class="mb-3">
          <CFormLabel for="date">Date</CFormLabel>
          <CFormInput
            type="date"
            id="date"
            v-model="editedSalary.date"
            required
          />
        </div>

        <div class="mb-3">
          <CFormSelect
          label="Person"
          v-model="editedSalary.to"
        >
          <option value="">Select recipient</option>
          <option value="userA">User A</option>
          <option value="userB">User B</option>
          <option value="other">Other</option>
        </CFormSelect>
        </div>
        
      </CForm>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="close">Cancel</CButton>
      <CButton color="primary" @click="saveChanges">Save Changes</CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ref as dbRef,update } from 'firebase/database'
import { database } from '@/firebase'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CButton
} from '@coreui/vue';
import { useToast } from 'vue-toastification'

const toast = useToast()
const props = defineProps({
  visible: Boolean,
  salary: Object
});

const emit = defineEmits(['close', 'update']);
const editedSalary = ref({...props.salary})

// const localSalary = ref({
//   date: '',
//   amount: '',
//   to: '',
//   month: ''
// });

// Watch for changes in the salary prop
// watch(() => props.salary, (newVal) => {
//   if (newVal) {
//     localSalary.value = { ...newVal };
//   }
// }, { immediate: true });

watch(() => props.salary, (newSalary) => {
  editedSalary.value = {...newSalary}
})

// Prevent typing invalid characters
const preventInvalidChars = (e) => {
  if (['e', 'E', '+', '-'].includes(e.key)) {
    e.preventDefault();
  }
};

const close = () => {
  emit('close');
};

const saveChanges = async () => {
  try {
  const expenseRef = dbRef(database, `salary/${props.salary.id}`)
  await update(expenseRef, editedSalary.value)
  emit('update', editedSalary.value);
  close();
  toast.success("Salary Edit Successfully") 
  } catch (error) {
    console.error('Error updating Salary:', error)
    toast.danger("Edit Unsuccessfully")
  }
};
</script>

<style scoped>

</style> -->

<template>
  <CModal
    :visible="visible"
    @close="close"
    size="lg"
  >
    <CModalHeader>
      <CModalTitle>Edit Salary</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm>
        <div class="mb-3">
          <CFormLabel for="Month">Month</CFormLabel>
          <CFormInput
            type="month"
            v-model="editedSalary.month"
            :invalid="errors.month"
          />
          <CFormFeedback invalid>{{ errors.month }}</CFormFeedback>
        </div>

        <div class="mb-3">
          <CFormLabel for="amount">Amount</CFormLabel>
          <CFormInput
            type="number"
            id="amount"
            min="1"
            v-model="editedSalary.amount"
            @keydown="preventInvalidChars"
            :invalid="errors.amount"
          />
          <CFormFeedback invalid>{{ errors.amount }}</CFormFeedback>
        </div>

        <div class="mb-3">
          <CFormLabel for="date">Date</CFormLabel>
          <CFormInput
            type="date"
            id="date"
            v-model="editedSalary.date"
            :invalid="errors.date"
          />
          <CFormFeedback invalid>{{ errors.date }}</CFormFeedback>
        </div>

        <div class="mb-3">
          <CFormSelect
            label="Person"
            v-model="editedSalary.to"
            :invalid="errors.to"
          >
            <option value="">Select recipient</option>
            <option value="userA">User A</option>
            <option value="userB">User B</option>
            <option value="other">Other</option>
          </CFormSelect>
          <CFormFeedback invalid>{{ errors.to }}</CFormFeedback>
        </div>
      </CForm>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="close">Cancel</CButton>
      <CButton color="primary" @click="saveChanges">Save Changes</CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { ref as dbRef, update } from 'firebase/database'
import { database } from '@/firebase'
import * as yup from 'yup'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormInput,
  CFormSelect,
  CFormFeedback,
  CButton
} from '@coreui/vue';
import { useToast } from 'vue-toastification'

const toast = useToast()
const props = defineProps({
  visible: Boolean,
  salary: Object
});

const emit = defineEmits(['close', 'update']);
const editedSalary = ref({...props.salary})
const errors = ref({})

// Define validation schema
const salarySchema = yup.object().shape({
  month: yup.string()
    .required('Month is required')
    .matches(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  amount: yup.number()
    .required('Amount is required')
    .min(1, 'Amount must be at least 1')
    .typeError('Amount must be a valid number'),
  date: yup.string()
    .required('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  to: yup.string()
    .required('Recipient is required')
    .oneOf(['userA', 'userB', 'other'], 'Please select a valid recipient')
})

watch(() => props.salary, (newSalary) => {
  editedSalary.value = {...newSalary}
})

// Prevent typing invalid characters
const preventInvalidChars = (e) => {
  if (['e', 'E', '+', '-'].includes(e.key)) {
    e.preventDefault();
  }
};

const close = () => {
  errors.value = {}
  emit('close');
};

const saveChanges = async () => {
  try {
    // Validate form data
    await salarySchema.validate(editedSalary.value, { abortEarly: false })
    errors.value = {}
    
    const expenseRef = dbRef(database, `salary/${props.salary.id}`)
    await update(expenseRef, editedSalary.value)
    emit('update', editedSalary.value);
    close();
    toast.success("Salary Edit Successfully") 
  } catch (error) {
    if (error.name === 'ValidationError') {
      // Handle validation errors
      const newErrors = {}
      error.inner.forEach(err => {
        newErrors[err.path] = err.message
      })
      errors.value = newErrors
    } else {
      console.error('Error updating Salary:', error)
      toast.error("Edit Unsuccessfully")
    }
  }
};
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
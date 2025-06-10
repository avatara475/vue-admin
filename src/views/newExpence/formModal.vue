<template>
  <Toast position="top-center" :autoClose="1000" />
  <CModal
    :visible="isVisible"
    @close="handleClose"
    size="lg"
  >
    <CModalHeader>
      <CModalTitle>Add New Expense</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm @submit.prevent="handleSubmit">
        <!-- Title -->
        <CFormInput
          label="Title"
          v-model="formData.title"
          @blur="validateField('title')"
          :invalid="!!errors.title"
          placeholder="Enter expense title"
          class="mb-3"
        />
        <CFormFeedback v-if="errors.title" >{{ errors.title }}</CFormFeedback>
        
        <!-- Description -->
        <CFormTextarea
          label="Description"
          v-model="formData.description"
          @blur="validateField('description')"
          :invalid="!!errors.description"
          placeholder="Enter description"
          class="mb-3"
          rows="3"
        />
        <CFormFeedback v-if="errors.description" class="error">{{ errors.description }}</CFormFeedback>
        
        <!-- Amount -->
        <CFormInput
          label="Amount"
          type="number"
          v-model="formData.amount"
          @blur="validateField('amount')"
          :invalid="!!errors.amount"
          placeholder="Enter amount"
          class="mb-3"
          min="0"
          @keydown="preventInvalidChars"
        />
        <CFormFeedback v-if="errors.amount" class="error">{{ errors.amount }}</CFormFeedback>
        
        <!-- Date -->
        <CFormInput
          label="Date"
          type="date"
          v-model="formData.date"
          @change="validateField('date')"
          :invalid="!!errors.date"
          class="mb-3"
        />
        <CFormFeedback v-if="errors.date" class="error">{{ errors.date }}</CFormFeedback>
        
        <!-- Category Dropdown -->
        <CFormSelect
          label="Category"
          v-model="formData.category"
          @change="handleCategoryChange"
          :invalid="!!errors.category"
          class="mb-3"
        >
          <option value="" >Select a category</option>
          <option value="petrol">Petrol</option>
          <option value="food">Food</option>
          <option value="money-transfer">Money Transfer</option>
          <option value="other">Other</option>
        </CFormSelect>
        <CFormFeedback v-if="errors.category" class="error">{{ errors.category }}</CFormFeedback>
        
        <!-- From Dropdown -->
        <CFormSelect
          label="From"
          v-model="formData.from"
          @change="handleFromChange"
          :invalid="!!errors.from"
          class="mb-3"
        >
          <option value="" >Select sender</option>
          <option value="userA">User A</option>
          <option value="userB">User B</option>
          <option value="other">Other</option>
        </CFormSelect>
        <CFormFeedback v-if="errors.from" class="error">{{ errors.from }}</CFormFeedback>
      </CForm>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="handleClose">Cancel</CButton>
      <CButton color="primary" @click="handleSubmit" :disabled="isSubmitting">
        {{ isSubmitting ? 'Submitting...' : 'Submit' }}
      </CButton>
    </CModalFooter>
  </CModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import * as yup from 'yup';
import { ref as dbRef,getDatabase, push, set, serverTimestamp } from 'firebase/database';
import { database } from '@/firebase';
import { useToast } from 'vue-toastification'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CButton,
  CFormFeedback
} from '@coreui/vue';

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close', 'submit']);
 const toast = useToast()

 // Prevent typing invalid characters
const preventInvalidChars = (e) => {
  if (['e', 'E', '+', '-'].includes(e.key)) {
    e.preventDefault();
  }
};

// Validation schema
const schema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  amount: yup
    .number()
    .required('Amount is required')
    .positive('Amount must be positive')
    .typeError('Amount must be a number'),
  date: yup
    .date()
    .required('Date is required')
    .max(new Date(), 'Date cannot be in the future')
    .typeError('Please enter a valid date'),
  category: yup.string().required('Category is required').notOneOf([''], 'Category is required'),
  from: yup.string().required('Sender is required').notOneOf([''], 'Sender is required')
});

const formData = ref({
  title: '',
  description: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  category: '',
  from: ''
});

const errors = ref({});
const isSubmitting = ref(false);
const touched = ref({
  title: false,
  description: false,
  amount: false,
  date: false,
  category: false,
  from: false
});

// Reset form when modal opens
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    formData.value = {
      title: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: '',
      from: ''
    };
    errors.value = {};
    Object.keys(touched.value).forEach(key => touched.value[key] = false);
  }
});

const validateField = async (field) => {
  touched.value[field] = true;
  try {
    await schema.validateAt(field, formData.value);
    errors.value[field] = '';
  } catch (err) {
    errors.value[field] = err.message;
  }
};

const handleCategoryChange = (e) => {
  formData.value.category = e.target.value;
  if (e.target.value) {
    errors.value.category = ''; // Clear error if valid selection
  } else {
    validateField('category'); // Validate if empty
  }
};

const handleFromChange = (e) => {
  formData.value.from = e.target.value;
  if (e.target.value) {
    errors.value.from = ''; // Clear error if valid selection
  } else {
    validateField('from'); // Validate if empty
  }
};

const validateAll = async () => {
  try {
    await schema.validate(formData.value, { abortEarly: false });
    errors.value = {};
    return true;
  } catch (err) {
    const newErrors = {};
    if (err.inner) {
      err.inner.forEach(error => {
        newErrors[error.path] = error.message;
        touched.value[error.path] = true;
      });
    }
    errors.value = newErrors;
    return false;
  }
};

// const handleSubmit = async () => {
//   const isValid = await validateAll();
//   if (!isValid) return;

//   isSubmitting.value = true;
//   try {
//     emit('submit', formData.value);
//     emit('close');
//   } finally {
//     isSubmitting.value = false;
//   }
// };

const handleSubmit = async () => {
  const isValid = await validateAll();
  if (!isValid) return;

  isSubmitting.value = true;
  
  try {
    // Create a reference to the expenses path
    const expensesRef = dbRef(database, 'expense');
    
    // Push a new expense (generates unique ID)
    const newExpenseRef = push(expensesRef);
    
    // Set the data for this new expense
    await set(newExpenseRef, {
      title: formData.value.title,
      description: formData.value.description,
      amount: parseFloat(formData.value.amount),
      date: formData.value.date,
      category:formData.value.category,
      from: formData.value.from,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log("Expense saved with ID: ", newExpenseRef.key);
    
    // Emit success event with the generated ID
    emit('submitted', {
      id: newExpenseRef.key,
      ...formData.value
    });
    
    // Close the modal
    emit('close');
   toast.success("Expence Added Successfully")
    
  } catch (error) {
    console.error("Error saving expense: ", error);
    errors.value.firebase = "Failed to save expense. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
};

const handleClose = () => {
  emit('close');
};
</script>

<style scoped>
.error{
  text-align: center;
}
</style>
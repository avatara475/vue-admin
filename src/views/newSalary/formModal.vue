<template>
  <CModal
    :visible="isVisible"
    @close="handleClose"
    size="lg"
  >
    <CModalHeader>
      <CModalTitle>Add New Salary</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm @submit.prevent="handleSubmit">
        <!-- Month Input -->
        <CFormInput
          label="Month"
          type="month"
          v-model="formData.month"
          @change="validateField('month')"
          :invalid="!!errors.month"
          class="mb-3"
        />
        <CFormFeedback v-if="errors.month" class="error">{{ errors.month }}</CFormFeedback>

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

        <!-- To Dropdown -->
        <CFormSelect
          label="Person"
          v-model="formData.to"
          @change="handleToChange"
          :invalid="!!errors.to"
          class="mb-3"
        >
          <option value="">Select recipient</option>
          <option value="userA">User A</option>
          <option value="userB">User B</option>
          <option value="other">Other</option>
        </CFormSelect>
        <CFormFeedback v-if="errors.to" class="error">{{ errors.to }}</CFormFeedback>
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
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
  CButton,
  CFormFeedback
} from '@coreui/vue';
import { useToast } from 'vue-toastification'

const props = defineProps({
  isVisible: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['close', 'submit']);

// Validation schema
const schema = yup.object().shape({
  month: yup
    .string()
    .required('Month is required')
    .matches(/^\d{4}-\d{2}$/, 'Must be in YYYY-MM format'),
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
  to: yup
    .string()
    .required('Recipient is required')
    .notOneOf([''], 'Please select a recipient')
});

const formData = ref({
  month: '',
  amount: '',
  date: new Date().toISOString().split('T')[0],
  to: ''
});

const toast = useToast()
const errors = ref({});
const isSubmitting = ref(false);
const touched = ref({
  month: false,
  amount: false,
  date: false,
  to: false
});

// Reset form when modal opens
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    formData.value = {
      month: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      to: ''
    };
    errors.value = {};
    Object.keys(touched.value).forEach(key => touched.value[key] = false);
  }
});

// Prevent typing invalid characters
const preventInvalidChars = (e) => {
  if (['e', 'E', '+', '-'].includes(e.key)) {
    e.preventDefault();
  }
};

const validateField = async (field) => {
  touched.value[field] = true;
  try {
    await schema.validateAt(field, formData.value);
    errors.value[field] = '';
  } catch (err) {
    errors.value[field] = err.message;
  }
};

const handleToChange = (e) => {
  formData.value.to = e.target.value;
  if (e.target.value) {
    errors.value.to = ''; // Clear error if valid selection
  } else {
    validateField('to'); // Validate if empty
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
    // Create a reference to the salaryes path
    const salaryesRef = dbRef(database, 'salary');
    
    // Push a new salary (generates unique ID)
    const newSalaryRef = push(salaryesRef);
    
    // Set the data for this new salary
    await set(newSalaryRef, {
      month: formData.value.month,
      amount: parseFloat(formData.value.amount),
      date: formData.value.date,
      to: formData.value.to,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log("Salary saved with ID: ", newSalaryRef.key);
    
    // Emit success event with the generated ID
    emit('submitted', {
      id: newSalaryRef.key,
      ...formData.value
    });
    
    // Close the modal
    emit('close');

    toast.success("Salary added successfully")
    
  } catch (error) {
    console.error("Error saving Salary: ", error);
    errors.value.firebase = "Failed to save Salary. Please try again.";
    toast.danger("Salary added Unsuccessfully")
  } finally {
    isSubmitting.value = false;
  }
};

const handleClose = () => {
  emit('close');
};
</script>
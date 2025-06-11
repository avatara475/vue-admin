<template>
  <CModal
    :visible="visible"
    @close="handleCancel"
    size="lg"
  >
    <CModalHeader>
      <CModalTitle>Edit Profile</CModalTitle>
    </CModalHeader>
    <CModalBody>
      <CForm @submit.prevent="handleSubmit">
        <!-- Name Field -->
        <div class="mb-3">
          <CFormLabel for="name">Full Name</CFormLabel>
          <CFormInput
            type="text"
            id="name"
            v-model="formData.name"
            @blur="validateField('name')"
            :invalid="!!errors.name && touched.name"
          />
          <CFormFeedback invalid>{{ errors.name }}</CFormFeedback>
        </div>

        <!-- Location Field -->
        <div class="mb-3">
          <CFormLabel for="location">Location</CFormLabel>
          <CFormInput
            type="text"
            id="location"
            v-model="formData.location"
            @blur="validateField('location')"
            :invalid="!!errors.location && touched.location"
          />
          <CFormFeedback invalid>{{ errors.location }}</CFormFeedback>
        </div>

        <!-- Bio Field -->
        <div class="mb-3">
          <CFormLabel for="bio">Bio</CFormLabel>
          <CFormTextarea
            id="bio"
            v-model="formData.bio"
            @blur="validateField('bio')"
            :invalid="!!errors.bio && touched.bio"
          />
          <CFormFeedback invalid>{{ errors.bio }}</CFormFeedback>
        </div>

        <!-- DOB Field -->
        <div class="mb-3">
          <CFormLabel for="birth">DOB</CFormLabel>
          <CFormInput
            type="date"
            id="birth"
            v-model="formData.birth"
            @blur="validateField('birth')"
            :invalid="!!errors.birth && touched.birth"
          />
          <CFormFeedback invalid>{{ errors.birth }}</CFormFeedback>
        </div>

        <!-- Gender Field -->
        <div class="mb-3">
          <CFormLabel>Gender</CFormLabel>
          <div class="d-flex gap-3">
            <CFormCheck
              type="radio"
              name="gender"
              id="male"
              label="Male"
              value="male"
              v-model="formData.gender"
              @change="validateField('gender')"
            />
            <CFormCheck
              type="radio"
              name="gender"
              id="female"
              label="Female"
              value="female"
              v-model="formData.gender"
              @change="validateField('gender')"
            />
          </div>
          <div v-if="errors.gender && touched.gender" class="invalid-feedback d-block">{{ errors.gender }}</div>
        </div>

        <!-- Mobile Number Field -->
        <div class="mb-3">
          <CFormLabel>Mobile Number</CFormLabel>
          <CFormInput
            type="text"
            v-model="formData.number"
            @blur="validateField('number')"
            @input="formatPhoneNumber"
            @keydown="preventInvalidChars"
            maxlength="10"
            :invalid="!!errors.number && touched.number"
          />
          <CFormFeedback invalid>{{ errors.number }}</CFormFeedback>
        </div>

        <!-- Image Upload Field -->
        <div class="mb-3">
          <CFormLabel>Profile Image</CFormLabel>
          <CFormInput
            type="file"
            accept="image/*"
            @change="handleImageUpload"
            :invalid="!!errors.image && touched.image"
          />
          <CFormFeedback invalid>{{ errors.image }}</CFormFeedback>
          <div v-if="formData.image" class="mt-2">
            <img :src="formData.image" alt="Preview" class="img-thumbnail" style="max-width: 200px; max-height: 200px;">
          </div>
        </div>

        <CModalFooter>
          <CButton color="secondary" @click="handleCancel">Cancel</CButton>
          <CButton color="primary" type="submit">Save Changes</CButton>
        </CModalFooter>
      </CForm>
    </CModalBody>
  </CModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import * as yup from 'yup';
import { useToast } from 'vue-toastification'

const toast = useToast()

const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  userData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['save', 'cancel']);

// Form data and states
const formData = ref({ 
  ...props.userData,
  image: props.userData.image || '' // Initialize image field
});
const errors = ref({});
const touched = ref({
  name: false,
  location: false,
  bio: false,
  birth: false,
  gender: false,
  number: false,
  image: false
});

const preventInvalidChars = (e) => {
  if (['e', 'E', '+', '-'].includes(e.key)) {
    e.preventDefault();
  }
};

// Validation schema
const schema = yup.object().shape({
  name: yup.string().required('Full name is required'),
  location: yup.string().required('Location is required'),
  bio: yup.string().required('Bio is required'),
  birth: yup.date().required('Date of birth is required'),
  gender: yup.string().required('Please select a gender'),
  number: yup.string()
    .required('Mobile number is required')
    .matches(/^\d{10}$/, 'Mobile number must be 10 digits'),
  image: yup.string()
    .test('is-valid-image', 'Please upload a valid image', (value) => {
      // Image is optional, but if provided should be a valid base64 string
      if (!value) return true;
      return value.startsWith('data:image/');
    })
});

// Handle image upload and convert to base64
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.match('image.*')) {
    errors.value.image = 'Please select an image file';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    formData.value.image = e.target.result;
    errors.value.image = '';
    touched.value.image = true;
  };
  reader.readAsDataURL(file);
};

// Format phone number input
const formatPhoneNumber = (e) => {
  formData.value.number = e.target.value.replace(/\D/g, '').slice(0, 10);
};

// Validate a single field
const validateField = async (field) => {
  touched.value[field] = true;
  try {
    await schema.validateAt(field, formData.value);
    errors.value[field] = '';
  } catch (err) {
    errors.value[field] = err.message;
  }
};

// Validate entire form
const validateForm = async () => {
  try {
    await schema.validate(formData.value, { abortEarly: false });
    errors.value = {};
    return true;
  } catch (err) {
    // Mark all fields as touched on submit
    Object.keys(touched.value).forEach(key => touched.value[key] = true);
    
    err.inner.forEach(error => {
      errors.value[error.path] = error.message;
    });
    return false;
  }
};

const handleSubmit = async () => {
  const isValid = await validateForm();
  if (isValid) {
    emit('save', formData.value);
    toast.success("Profile Edit Successfull")
  }
};

const handleCancel = () => {
  // Reset validation states
  errors.value = {};
  Object.keys(touched.value).forEach(key => touched.value[key] = false);
  emit('cancel');
};

watch(() => props.userData, (newVal) => {
  formData.value = { 
    ...newVal,
    image: newVal.image || '' // Ensure image field is properly initialized
  };
}, { deep: true });
</script>

<style>
.invalid-feedback {
  color: #dc3545;
  font-size: 0.875em;
  margin-top: 0.25rem;
  display: block;
}
</style>
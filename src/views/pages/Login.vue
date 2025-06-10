<template>
  <div class="wrapper min-vh-100 d-flex flex-row align-items-center">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol :md="8">
          <CCardGroup>
            <CCard class="p-4">
              <CCardBody>
                <CForm @submit.prevent="handleLogin">
                  <h1>Login</h1>
                  <p class="text-body-secondary">Sign In to your account</p>
                  
                  <!-- Error Message -->
                  <CAlert v-if="errorMessage" color="danger" class="mb-3">
                    {{ errorMessage }}
                  </CAlert>
                  
                  <!-- Email Input -->
                  <CInputGroup class="mb-3">
                    <CInputGroupText>
                      <CIcon icon="cil-user" />
                    </CInputGroupText>
                    <CFormInput
                      v-model="email"
                      type="email"
                      placeholder="Email"
                      autocomplete="email"
                      required
                      :disabled="loading"
                    />
                  </CInputGroup>
                  
                  <!-- Password Input -->
                  <CInputGroup class="mb-4">
                    <CInputGroupText>
                      <CIcon icon="cil-lock-locked" />
                    </CInputGroupText>
                    <CFormInput
                      v-model="password"
                      type="password"
                      placeholder="Password"
                      autocomplete="current-password"
                      required
                      :disabled="loading"
                    />
                  </CInputGroup>
                  
                  <CRow>
                    <CCol :xs="6">
                      <!-- Login Button -->
                      <CButton 
                        type="submit" 
                        color="primary" 
                        class="px-4" 
                        :disabled="loading"
                      >
                        <template v-if="!loading">
                          Login
                        </template>
                        <template v-else>
                          <CSpinner component="span" size="sm" aria-hidden="true" />
                          Loading...
                        </template>
                      </CButton>
                    </CCol>
                    
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
            
          </CCardGroup>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script setup>
import { ref,onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '@/firebase'
import { 
  signInWithEmailAndPassword,
  sendPasswordResetEmail 
} from 'firebase/auth'
import { useToast } from 'vue-toastification'

const router = useRouter()
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)
const toast = useToast()

// Check auth state when component mounts
onMounted(async () => {
  await auth.authStateReady()
  if (auth.currentUser) {
    router.push({ 
      name: 'Dashboard',
      //  query: { message: 'already-logged-in' }
    })
  }
})


const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''
  
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    // Redirect to dashboard or originally requested page
    const redirectPath = router.currentRoute.value.query.redirect || '/dashboard'
    router.push(redirectPath)
    toast.success("Login Successfull")
  } catch (error) {
    errorMessage.value = getFirebaseErrorMessage(error.code)
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = async () => {
  if (!email.value) {
    errorMessage.value = 'Please enter your email address first'
    return
  }

  loading.value = true
  errorMessage.value = ''
  
  try {
    await sendPasswordResetEmail(auth, email.value)
    errorMessage.value = 'Password reset email sent. Please check your inbox.'
  } catch (error) {
    errorMessage.value = getFirebaseErrorMessage(error.code)
  } finally {
    loading.value = false
  }
}

const getFirebaseErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Invalid email address format'
    case 'auth/user-disabled':
      return 'This account has been disabled'
    case 'auth/user-not-found':
      return 'No account found with this email'
    case 'auth/wrong-password':
      return 'Incorrect password'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection'
    default:
      return 'Login failed. Please try again'
  }
}
</script>

<style scoped>
.wrapper {
  background-color: #f8f9fa;
}

h1 {
  text-align: center;
  color: #5E5CD0;
  margin-bottom: 0.5rem;
}

.text-body-secondary {
  text-align: center;
  margin-bottom: 2rem;
}

.bg-primary {
  background-color: #5E5CD0 !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .card-group > .card:last-child {
    display: none;
  }
}
</style>
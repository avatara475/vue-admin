<script setup>
import { auth } from '@/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'


const router = useRouter()
const toast = useToast()

const handleLogout = async () => {
  try {
    await signOut(auth)
    router.push('/login')
    toast.warning("User Logout")
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<template>
  <CDropdown variant="nav-item">
    <CDropdownToggle placement="bottom-end" class="py-2 text-danger bg-primary rounded mx-2 fw-bolder" :caret="false" @click="handleLogout">
      Logout
    </CDropdownToggle>
  </CDropdown>
</template>
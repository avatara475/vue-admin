<script setup>
import { ref, onMounted, watch } from 'vue'
import { auth } from '@/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { getDatabase, ref as dbRef, onValue } from 'firebase/database'

const router = useRouter()
const toast = useToast()
const db = getDatabase()
const userAvatar = ref('')

// Fetch user profile image from Firebase
const fetchUserProfileImage = () => {
  const user = auth.currentUser
  if (!user) return
  
  const userId = user.uid
  const userRef = dbRef(db, `users/${userId}`)
  
  // Remove onlyOnce to get real-time updates
  onValue(userRef, (snapshot) => {
    const userData = snapshot.val()
    if (userData && userData.image) {
      userAvatar.value = userData.image
    } else {
      // Fallback to gender-based avatar or default
      userAvatar.value = userData?.gender === 'female' 
        ? 'https://randomuser.me/api/portraits/lego/9.jpg' 
        : 'https://randomuser.me/api/portraits/lego/5.jpg'
    }
  })
}

onMounted(() => {
  fetchUserProfileImage()
})

const handleLogout = async () => {
  try {
    await signOut(auth)
    router.push('/login')
    toast.warning("User Logout")
  } catch (error) {
    console.error('Logout error:', error)
  }
}


const itemsCount = 42
</script>

<template>
  <CDropdown placement="bottom-end" variant="nav-item">
    <CDropdownToggle class="py-0 pe-0" :caret="false">
      <CAvatar 
      :src="userAvatar" 
      size="md" 
      class="rounded"/>
    </CDropdownToggle>
    <CDropdownMenu class="pt-0">
      <CDropdownHeader
        component="h6"
        class="bg-body-secondary text-body-secondary fw-semibold mb-2 rounded-top"
      >
        Account
      </CDropdownHeader>
      <!-- <CDropdownItem>
        <CIcon icon="cil-bell" /> Updates
        <CBadge color="info" class="ms-auto">{{ itemsCount }}</CBadge>
      </CDropdownItem>
      <CDropdownItem>
        <CIcon icon="cil-envelope-open" /> Messages
        <CBadge color="success" class="ms-auto">{{ itemsCount }}</CBadge>
      </CDropdownItem>
      <CDropdownItem>
        <CIcon icon="cil-task" /> Tasks
        <CBadge color="danger" class="ms-auto">{{ itemsCount }}</CBadge>
      </CDropdownItem>
      <CDropdownItem>
        <CIcon icon="cil-comment-square" /> Comments
        <CBadge color="warning" class="ms-auto">{{ itemsCount }}</CBadge>
      </CDropdownItem>
      <CDropdownHeader
        component="h6"
        class="bg-body-secondary text-body-secondary fw-semibold my-2"
      >
        Settings
      </CDropdownHeader>
      <CDropdownItem> <CIcon icon="cil-user" /> Profile </CDropdownItem>
      <CDropdownItem> <CIcon icon="cil-settings" /> Settings </CDropdownItem>
      <CDropdownItem>
        <CIcon icon="cil-dollar" /> Payments
        <CBadge color="secondary" class="ms-auto">{{ itemsCount }}</CBadge>
      </CDropdownItem>
      <CDropdownItem>
        <CIcon icon="cil-file" /> Projects
        <CBadge color="primary" class="ms-auto">{{ itemsCount }}</CBadge>
      </CDropdownItem>
      <CDropdownDivider />
      <CDropdownItem> <CIcon icon="cil-shield-alt" /> Lock Account </CDropdownItem> -->
      <CDropdownItem @click="router.push('/profile')" class="logins"> <CIcon icon="cil-user" /> Profile </CDropdownItem>
      <CDropdownItem @click="handleLogout"  class="logins"> <CIcon icon="cil-lock-locked" /> Logout </CDropdownItem>
    </CDropdownMenu>
  </CDropdown>
</template>

<style scoped>
.logins{
  cursor: pointer
}
</style>


<template>
  <div class="profile-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading">
        <div class="spinner-border text-primary text-center" role="status">
                <span class="visually-hidden">Loading...</span>
                </div>
    </div>
    
    <!-- Profile Content -->
    <div v-else>
      <!-- Cover Photo -->
      <div class="cover-photo"></div>
      
      <!-- Profile Header -->
      <div class="profile-header">
        <div class="avatar-container">
          <img 
            :src="userData.gender === 'male' ? 'https://randomuser.me/api/portraits/lego/5.jpg' : 'https://randomuser.me/api/portraits/lego/9.jpg'"
            alt="Profile" 
            class="avatar"
            >
          <button @click="showEditModal" class="edit-btn">
            Edit
          </button>
        </div>
        
        <div class="user-details">
          <h1 class="username">{{ userData.name || 'User' }}</h1>
          <p class="user-email">{{ userEmail }}</p>
          <p class="user-location" v-if="userData.location">
            <i class="fas fa-map-marker-alt"></i> {{ userData.location }}
          </p>
        </div>
      </div>

      <!-- Edit Modal -->
      <ProfileEditModal
        :visible="editModalVisible"
        :userData="userData"
        @save="saveProfile"
        @cancel="hideEditModal"
      />

      <!-- About Section -->
      <div class="about-section">
        <h2>Information</h2>
        <span class="bio"><bold class="fw-bolder">Date Of Birth:-</bold>{{ userData.birth || 'Birth Date Not Assisgn'  }}</span><br/>
        <span class="bio"><bold class="fw-bolder">Gender:-</bold>{{ userData.gender || 'Gender Not Assisgn'  }}</span><br/>
        <span class="bio"><bold class="fw-bolder">Mobile Number:-</bold>{{ userData.number || 'Mobile Number Not Assisgn'  }}</span><br/>
        <span class="bio"><bold class="fw-bolder">Location:-</bold>{{ userData.location || 'Location Not Assisgn'  }}</span>


        <h2 class="mt-5">About</h2>
        <p class="bio">{{ userData.bio || 'No bio yet...' }}</p>
        
        <!-- <div class="details">
          <div class="detail-item" v-if="userData.jobTitle">
            <i class="fas fa-briefcase"></i>
            <span>{{ userData.jobTitle }}</span>
          </div>
          <div class="detail-item" v-if="userData.education">
            <i class="fas fa-graduation-cap"></i>
            <span>{{ userData.education }}</span>
          </div>
          <div class="detail-item">
            <i class="fas fa-calendar-alt"></i>
            <span>Joined {{ joinDate }}</span>
          </div>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref as dbRef, set, onValue } from 'firebase/database';
import ProfileEditModal from './editProfileForm.vue';

const auth = getAuth();
const db = getDatabase();

// User data
const userEmail = ref('');
const userData = ref({});
const loading = ref(true);
const editModalVisible = ref(false);

// Get current date in readable format
const joinDate = computed(() => {
  if (!userData.value.joinDate) return 'recently';
  const options = { year: 'numeric', month: 'long' };
  return new Date(userData.value.joinDate).toLocaleDateString(undefined, options);
});

// Modal control functions
const showEditModal = () => {
  editModalVisible.value = true;
};

const hideEditModal = () => {
  editModalVisible.value = false;
};

// Save profile changes
const saveProfile = async (updatedData) => {
  try {
    const userId = auth.currentUser.uid;
    const userRef = dbRef(db, `users/${userId}`);
    
    // Add timestamp if this is first save
    if (!userData.value.joinDate) {
      updatedData.joinDate = new Date().toISOString();
    }
    
    await set(userRef, updatedData);
    userData.value = { ...updatedData };
    hideEditModal();
  } catch (error) {
    console.error("Error saving profile:", error);
  }
};

// Load user data
onMounted(() => {
  const user = auth.currentUser;
  if (user) {
    userEmail.value = user.email;
    
    const userId = user.uid;
    const userRef = dbRef(db, `users/${userId}`);
    
    onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      userData.value = data || {};
      loading.value = false;
    });
  }
});
</script>

<style scoped>
.spinner-border {
  width: 3rem;
  height: 3rem;
}

.spinneres{
  margin-left:40rem;
  margin-top: 4rem;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
  padding: 20px;
}

.loading {
  text-align: center;
  padding: 50px;
  font-size: 1.2rem;
  color: #666;
}

/* Cover Photo */
.cover-photo {
  height: 200px;
  background: linear-gradient(45deg, #6a11cb 0%, #2575fc 100%);
  border-radius: 8px 8px 0 0;
}

/* Profile Header */
.profile-header {
  display: flex;
  align-items: flex-end;
  gap: 25px;
  margin-top: -50px;
  padding: 0 20px 20px;
  position: relative;
}

.avatar-container {
  position: relative;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid white;
  object-fit: cover;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.edit-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: #2575fc;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-details {
  padding-bottom: 15px;
}

.username {
  margin: 0;
  margin-top:-6rem;
  color:white;
  font-size: 1.8rem;
}

.user-email {
  color: #666;
  margin: 5px 0;
  font-size: 1rem;
}

.user-location {
  color: #777;
  margin: 5px 0;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
}

/* Edit Form */
.edit-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.edit-form h2 {
  margin-top: 0;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.save-btn {
  background: #2575fc;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

/* About Section */
.about-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.about-section h2 {
  margin-top: 0;
  font-size: 1.5rem;
  color: #444;
}

.bio {
  line-height: 1.6;
  color: #555;
  margin-bottom: 20px;
  white-space: pre-line;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #555;
}

.detail-item i {
  color: #2575fc;
  width: 20px;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 600px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    margin-top: -70px;
  }
  
  .user-details {
    padding-bottom: 0;
    text-align: center;
  }
  
  .avatar {
    width: 100px;
    height: 100px;
  }
}
</style>
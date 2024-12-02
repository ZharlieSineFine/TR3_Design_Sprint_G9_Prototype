<template>
  <v-container class="fill-height">
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card>
          <v-card-title class="text-center text-h5 py-4">
            User Login
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleSubmit">
              <v-text-field
                v-model="form.email"
                label="Email"
                type="email"
                :rules="[v => !!v || 'Please enter an email']"
                required
              />

              <v-text-field
                v-model="form.password"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :rules="[v => !!v || 'Please enter a password']"
                @click:append="showPassword = !showPassword"
                required
              />

              <v-btn
                block
                color="primary"
                type="submit"
                :loading="loading"
                class="mt-4"
              >
                Login
              </v-btn>

              <div class="text-center mt-4">
                <v-btn
                  variant="text"
                  to="/register"
                >
                  No account? Register now
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>

      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useMessage } from '@/utils/message'

const userStore = useUserStore()
const { showError } = useMessage()

const form = ref({
  email: '',
  password: ''

})
const showPassword = ref(false)
const loading = ref(false)

const handleSubmit = async () => {
  if (!form.value.email || !form.value.password) return


  try {
    loading.value = true
    await userStore.login(form.value)
  } catch (error) {
    showError(error)
  } finally {
    loading.value = false
  }
}
</script> 
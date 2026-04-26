<script setup lang="ts" >
import { postRegistrationMutation } from '@/generated/api/@tanstack/vue-query.gen';
import { useSetToken } from '@/scripts/tasks';
import { useMutation } from '@tanstack/vue-query';
import { motion } from 'motion-v';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';

const router = useRouter()
const { setToken } = useSetToken()

const username = ref<string>()
const password = ref<string>()
const passwordConfirm = ref<string>()

const { mutate: registration } = useMutation({
  ...postRegistrationMutation({
    baseUrl: import.meta.env.VITE_API,
  }),
  onError: (error) => {
    const { Errors } = error
    const { Password } = Errors
    for (const e of Password) {
      if (e === "Password must be at least 8 characters long.") {
        toast("Пароль должен быть не менее 8 символов")
        return
      }
      if (e === "Password must contain at least one lowercase letter.") {
        toast("Пароль должен содержать как минимум одну строчную букву.")
        return
      }
      if (e === "Password must contain at least one uppercase letter.") {
        toast("Пароль должен содержать хотя бы одну заглавную букву.")
        return
      }
      if (e === "Password must contain at least one special character (!?*.@#$%^).") {
        toast("Пароль должен содержать хотя бы один специальный символ (!?*.@#$%^).")
        return
      }

      toast(e)
    }
  },
  onSuccess: (data) => {
    if (data.token) {
      setToken(data.token)
    }

    router.push({ name: 'GraphList' })
  }
})

function handleCreateAccount() {
  registration({
    body: {
      name: username.value,
      password: password.value,
    }
  })
}
</script>

<template>
  <div :class="$style.page">
    <div :class="$style.header">
      <h2 :class="$style.logo">
        GUTT
      </h2>
    </div>
    <div :class="$style.content">
      <motion.div
        :class="$style.formContainer"
        :initial="{
          y: -100,
          opacity: 0.5,
        }"
        :animate="{
          y: 0,
          opacity: 1,
        }"
      >
        <div :class="$style.title">
          Регистрация
        </div>
        <form
          @submit.prevent
          :class="$style.form"
        >
          <input
            v-model="username"
            :class="$style.input"
            type="text"
            name="username"
            placeholder="Введите имя"
          />
          <input
            v-model="password"
            :class="$style.input"
            type="text"
            name="password"
            placeholder="Пароль"
          />
          <input
            v-model="passwordConfirm"
            :class="$style.input"
            type="text"
            name="password"
            placeholder="Повторите пароль"
          />
          <a
            @click="$router.push({ name: 'AuthPage' })"
            :class="$style.link"
          >
            Есть аккаунт?
          </a>
          <button
            :class="$style.button"
            :disabled="password !== passwordConfirm"
            @click="handleCreateAccount"
          >
            Создать
          </button>
        </form>
      </motion.div>
    </div>
  </div>
</template>

<style module>
.page {
  display: flex;
  flex-direction: column;
  padding: 20px;
  height: 100%;
}

.input {
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.button {
  padding: 12px 16px;
  border-radius: 12px;
  background-color: var(--button-color);
  color: var(--text-color-active);
  cursor: pointer;
  transition: 0.15s;

  &:active {
    scale: 0.9;
  }

  &:hover {
    background-color: var(--button-color-hover);
  }
}

.logo {
  font-size: 32px;
  color: var(--text-color);
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
}

.title {
  font-size: 24px;
  text-align: center;
}

.formContainer {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 320px;
  margin-inline: auto;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-inline: auto;
}

.link {
  color: #5d70dd;
  text-align: center;
  text-decoration: underline;
  cursor: pointer;
}
</style>

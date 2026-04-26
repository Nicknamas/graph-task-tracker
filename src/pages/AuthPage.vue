<script setup lang="ts" >
import { postLoginMutation } from '@/generated/api/@tanstack/vue-query.gen';
import { setToken } from '@/scripts/tasks';
import { useMutation } from '@tanstack/vue-query';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter()

const username = ref<string>()
const password = ref<string>()

const { mutate: login } = useMutation({
  ...postLoginMutation({
    baseUrl: import.meta.env.VITE_API,
  }),
  onSuccess: (data) => {
    if (data.token) {
      setToken(data.token)
    }

    router.push({ name: 'GraphList' })
  }
})

function handleCreateAccount() {
  login({
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
      <div
        :class="$style.formContainer"
      >
        <div :class="$style.title">
          Авторизация
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
          <button
            :class="$style.button"
            @click="handleCreateAccount"
          >
            Создать
          </button>
        </form>
      </div>
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
  background-color: var(--auth-color);
  border: 1px solid var(--auth-border-color);
  border-radius: 12px;
  width: 100%;
  max-width: 360px;
  padding: 32px 40px;
  margin-inline: auto;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-inline: auto;
}
</style>

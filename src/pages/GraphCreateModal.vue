<script lang="ts" setup>
import { postCreateMutation } from '@/generated/api/@tanstack/vue-query.gen';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import { ref } from 'vue';

interface Props {
  width?: string
}

interface Emits {
  close: []
}

defineProps<Props>()
const emit = defineEmits<Emits>()
const queryClient = useQueryClient()

const isShow = defineModel<boolean>({ required: true })
const title = ref('')
const description = ref('')

const { mutate: createGraph } = useMutation({
  ...postCreateMutation(),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['graphs'] })
    emit('close')
  }
})

function handleCreateGraph(): void {
  createGraph({
    body: {
      description: description.value,
      name: title.value,
    }
  })
}

function close() {
  isShow.value = false
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="slide-fade">
      <div
        v-if="isShow"
        id="dialog"
        :class="$style.backdrop"
      >
        <div
          :class="$style.dialog"
        >
          <div :class="$style.actions">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              @click="close"
            >
              <path
                d="M21.6561 20.399L17.2563
              15.9992L21.6561 11.5995C21.8228
              11.4328 21.9164 11.2067 21.9164
              10.9709C21.9164 10.7352 21.8228
              10.5091 21.6561 10.3424C21.4894 10.1757 21.2633
              10.082 21.0276 10.082C20.7918 10.082 20.5657
              10.1757 20.399 10.3424L15.9992 14.7422L11.5995
              10.3424C11.4328 10.1757 11.2067 10.082 10.9709
              10.082C10.7352 10.082 10.5091 10.1757 10.3424
              10.3424C10.1757 10.5091 10.082 10.7352 10.082
              10.9709C10.082 11.2067 10.1757 11.4328 10.3424
              11.5995L14.7422 15.9992L10.3424 20.399C10.1757
              20.5657 10.082 20.7918 10.082 21.0276C10.082
              21.2633 10.1757 21.4894 10.3424 21.6561C10.5091
              21.8228 10.7352 21.9164 10.9709 21.9164C11.2067
              21.9164 11.4328 21.8228 11.5995 21.6561L15.9992
              17.2563L20.399 21.6561C20.5657 21.8228 20.7918
              21.9164 21.0276 21.9164C21.2633 21.9164 21.4894
              21.8228 21.6561 21.6561C21.8228 21.4894 21.9164
              21.2633 21.9164 21.0276C21.9164 20.7918 21.8228
              20.5657 21.6561 20.399Z"
                fill="#8A96A6"
              />
            </svg>
          </div>
          <div :class="$style.dialogContent">
            <h2 :class="$style.title">
              Создание графа
            </h2>
            <div :class="$style.content">
              <input
                :class="$style.input"
                v-model="title"
                placeholder="Введите название графа"
                type="text"
              />
              <textarea
                :class="$style.input + ' ' + $style.textarea"
                v-model="description"
                placeholder="Введите описание графа"
                type="text"
              />
            </div>
            <div
              :class="$style.buttons"
            >
              <button
                @click="handleCreateGraph"
                :class="$style.button"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style>

<style module>
.backdrop {
  position: fixed;
  display: grid;
  place-items: center;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100%;
  z-index: 500;
  padding-inline: 16px;
  padding-bottom: 20px;
  background-color: #00000080;
  overflow: auto;
}

.dialogContent {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.title {
  text-align: center;
}

.input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.textarea {
  resize: vertical;
}

.button {
  padding: 8px 12px;
  background-color: var(--button-color);
  color: var(--button-text-color);
  border-radius: 8px;
  cursor: pointer;
  transition: 0.1s;

  &:hover {
    background-color: var(--button-color-hover);
  }
}

.actions {
  position: absolute;
  right: 16px;
  top: 16px;

  & > * {
    cursor: pointer;
  }
}

.buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.dialog {
  position: relative;
  margin-inline: auto;
  transition: 0.3s;
  background-color: white;
  border-radius: 20px;
  max-width: 400px;
  width: 100%;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>

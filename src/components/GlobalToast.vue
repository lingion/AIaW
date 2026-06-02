<template>
  <teleport to="body">
    <transition name="toast-slide">
      <div
        v-if="toast.show"
        class="fixed-top row items-center q-pa-md shadow-5"
        :style="{
          zIndex: 10000000,
          background: toast.type === 'positive' ? 'rgba(46, 125, 50, 0.95)'
            : toast.type === 'negative' ? 'rgba(211, 47, 47, 0.95)'
            : 'rgba(25, 118, 210, 0.95)',
          backdropFilter: 'blur(8px)',
          margin: '16px',
          borderRadius: '12px',
          color: 'white',
          maxWidth: 'calc(100vw - 32px)',
        }"
        @touchstart="onToastTouchStart"
        @touchmove="onToastTouchMove"
        @touchend="onToastTouchEnd"
      >
        <div class="q-mr-sm row items-center">
          <!-- Check (positive) -->
          <svg v-if="toast.type === 'positive'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <!-- X (negative) -->
          <svg v-else-if="toast.type === 'negative'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <!-- Info (i) -->
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div class="column col" style="min-width: 0;">
          <span class="text-bold" style="font-size: 14px;">{{ toast.title }}</span>
          <span v-if="toast.message" style="word-break: break-all; font-size: 11px; opacity: 0.9;">{{ toast.message }}</span>
        </div>
        <span style="font-size: 11px; opacity: 0.6;" class="q-ml-sm">↑ 划走</span>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { useToast } from 'src/composables/useToast'

const { toast, onToastTouchStart, onToastTouchMove, onToastTouchEnd } = useToast()
</script>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  transform: translateY(-80px) scale(0.9);
  opacity: 0;
}
</style>

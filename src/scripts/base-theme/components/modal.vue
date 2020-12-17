<template>
  <transition name="modal">
    <div class="modal" v-if="isOpen">
        <div class="modal-container">
          <div class="modal-heading">
            <slot name="header"></slot>
            <button class="modal-close" aria-label="Close" @click="$emit('close')">
              <svg aria-hidden="true" focusable="false" role="presentation" class="icon icon-close" viewBox="0 0 64 64"><path class="cls-1" d="M19 17.61l27.12 27.13m0-27.12L19 44.74"/></svg>
            </button>
          </div>

          <div class="modal-body">
            <slot name="body"></slot>
          </div>

          <div class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
    </div>
  </transition>
</template>
<script>
export default {
  props: {
    isOpen: Boolean
  },
  watch: {
    isOpen(isOpen) {
      if(isOpen) $('body').addClass(`modal--is-open`)
      else $('body').removeClass(`modal--is-open`)
    }
  }
};
</script>

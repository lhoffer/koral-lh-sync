<template>
  <carousel v-if="carouselOptions && list && list.length" :navigation="true" :options="mergedCarouselOptions">
    <product class="swiper-slide" :quickshop-type="'inline'" v-for="group in list" :key="group.key" :product-group="group" :collection-handle="collectionHandle"></product>
  </carousel>
  <div class="collection__grid" v-else-if="list && list.length">
    <product v-for="group in list" :key="group.key" :quickshop-type="'inline'" :product-group="group" :collection-handle="collectionHandle"></product>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import Product from './product.vue'
import carousel from './carousel.vue'

export default {
  props: {
    id: { type: String, default: "collection-grid"},
    collectionHandle: String,
    list: Array,
    carouselOptions: Object
  },
  updated() {
    // support Shopify Reviews app
    if(window.SPR)
      window.SPR.initDomEls()
  },
  components: {
    'product': Product,
    carousel
  },
  computed: {
    mergedCarouselOptions() {
      return {
        slidesPerView: 4,
        loop: true,
        touchRatio: 1, // this is to give users time to click swatches instead of click-drag of the carousel
        spaceBetween: 15,
        breakpoints: {
          767: { slidesPerView: 2 },
          991: { slidesPerView: 3 }
        },
        ...this.carouselOptions
      }
    }
  }
}
</script>

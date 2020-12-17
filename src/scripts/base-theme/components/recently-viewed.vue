<template>
  <carousel v-if="carouselOptions && list && list.length" :navigation="true" :options="mergedCarouselOptions">
    <product class="swiper-slide" :quickshop-type="'inline'" v-for="group in list" :key="group.key" :product-group="group" :collection-handle="collectionHandle"></product>
  </carousel>
  <div class="collection__grid" v-else-if="list && list.length">
    <product v-for="group in list" :key="group.key" :quickshop-type="'inline'" :product-group="group" :collection-handle="collectionHandle"></product>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import Cookies from 'js-cookie'
import Product from './product.vue'
import carousel from './carousel.vue'

const COOKIE_KEY = 'recently_viewed_products'

export default {
  props: {
    collectionHandle: String,
    carouselOptions: Object,
    howManyToStoreInMemory: {type: Number, default: 6}
  },
  mounted() {
    let recentlyViewed = (Cookies.get(COOKIE_KEY) || "").split(',');
    this.getRecentlyViewed(recentlyViewed);
    this.recordRecentlyViewed(recentlyViewed)
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
    ...mapState('products', {
      'list': 'recently_viewed_groups'
    }),
    mergedCarouselOptions() {
      return {
        slidesPerView: 4,
        spaceBetween: 15,
        touchRatio: 1, // this is to give users time to click swatches instead of click-drag of the carousel
        breakpoints: {
          767: { slidesPerView: 2 },
          991: { slidesPerView: 3 }
        },
        ...this.carouselOptions
      }
    }
  },
  methods: {
    ...mapActions('products', ['setRecentlyViewedProducts']),
    getRecentlyViewed(recentlyViewed) {
      const products = [];
      let productHandle;
      if (window.location.pathname.indexOf('/products/') !== -1) {
        // What is the product handle on this page.
        productHandle = window.location.pathname.match(/\/products\/([a-z0-9\-]+)/)[1];
      }
      $.when.apply($, recentlyViewed
        .filter(handle => handle != productHandle && handle)
        .map(handle => {
          return $.ajax({
            url: `/products/${handle}?view=json`,
            cache: false,
            success: (product) => products.push(JSON.parse(product))
          })
      })).done(() => {
        this.setRecentlyViewedProducts({products});
        this.$emit('complete', products);
      })
    },
    recordRecentlyViewed(recentlyViewed) {
      // If we are on a product page.
      if (window.location.pathname.indexOf('/products/') !== -1) {
        // What is the product handle on this page.
        var productHandle = window.location.pathname.match(/\/products\/([a-z0-9\-]+)/)[1];
        if(!productHandle || productHandle == 'gift-card') return;
        // In what position is that product in memory.
        var position = $.inArray(productHandle, recentlyViewed);
        // If not in memory.
        if (position === -1) {
          // Add product at the start of the list.
          recentlyViewed.unshift(productHandle);
          // Only keep what we need.
          recentlyViewed = recentlyViewed.splice(0, this.howManyToStoreInMemory);
        } else {
          // Remove the product and place it at start of list.
          recentlyViewed.splice(position, 1);
          recentlyViewed.unshift(productHandle);              
        }

        // Update cookie.
        Cookies.set(COOKIE_KEY, recentlyViewed.join(","));
      }
    }
  }
}
</script>

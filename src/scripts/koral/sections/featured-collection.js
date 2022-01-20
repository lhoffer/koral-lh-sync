import Vue from 'vue';
import { mapState } from 'vuex'
import FeaturedCollection from '~/koral/components/featured-collection.vue'
import store from '~/base-theme/store';

document.querySelectorAll(".vue-featured-collection").forEach(el => {
  new Vue({
    el: el,
    store,
    delimiters: ['${', '}'], // This is important to not cause liquid errors with {{ ... }}
    components: {
      'featuredCollection': FeaturedCollection
    },
    computed: {
      ...mapState('products', ['product_groups'])
    },
  })
})

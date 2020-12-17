import Vue from 'vue';
import ShopTheLook from '../components/shop-the-look.vue'
import store from '~/base-theme/store';

document.querySelectorAll(".vue-shop-the-look").forEach(el => {
  new Vue({
    el: el,
    store,
    delimiters: ['${', '}'], // This is important to not cause liquid errors with {{ ... }}
    components: {
      'shopTheLook': ShopTheLook
    }
  })
})

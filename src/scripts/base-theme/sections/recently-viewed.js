import Vue from 'vue';
import recentlyViewed from '../components/recently-viewed.vue';
import store from '../store';

document.querySelectorAll(".vue-recently-viewed").forEach(el => {
  new Vue({
    el: el,
    store,
    delimiters: ['${', '}'], // This is important to not cause liquid errors with {{ ... }}
    data: { showHeader: false },
    methods: {
      toggleHeader(list) {
        this.showHeader = list.length > 0;
      }
    },
    components: {
      recentlyViewed
    }
  })
})


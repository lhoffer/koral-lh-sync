import Vue from 'vue';
import Collection from '../../base-theme/components/collection.vue';
import Carousel from '../../base-theme/components/carousel.vue';
import Cookies from 'js-cookie';
import store from '../../base-theme/store';
import { mapState } from 'vuex';

document.querySelectorAll(".vue-collection").forEach(el => {
  new Vue({
    el: el,
    store,
    delimiters: ['${', '}'], // This is important to not cause liquid errors with {{ ... }}
    created() {
      if(location.pathname.indexOf('/collections/') >= 0) {
        Cookies.set('last-visited-collection', location.pathname);
      }
    },
    computed: {
      ...mapState('products', ['product_groups'])
    },
    components: {
      'collection': Collection,
      'carousel': Carousel
    }
  })
})

document.querySelectorAll(".vue-filter").forEach(el => {
  new Vue({
    el,
    store,
    delimiters: ['${', '}'], // This is important to not cause liquid errors with {{ ... }}
    data: {
      open: false
    },
    mounted() {
      // collapse filters on mobile load
      if(document.getElementById('bc-sf-filter-wrapper') && window.innerWidth < 768){
        Array.from(document.getElementsByClassName('bc-sf-filter-toolbar-item')).forEach(el => {
          el.classList.remove('d-none')
        });
        document.getElementsByClassName('bc-sf-filter-left-col')[0].classList.remove('is-show-filter');
        document.getElementsByClassName('btn-close-filter')[0].classList.add('d-none');
      }
    },
    methods: {
      openFilter(e) {
        const screen  = $(window).width();
        if(screen < 415) {
          $('.bc-sf-filter-toolbar-count').toggleClass('d-none');
          $('#bc-sf-filter-top-sorting').toggleClass('d-none');
          $('.btn-close-filter').toggleClass('d-none');
        }
        $('.bc-sf-filter-left-col, .bc-sf-filter-right-col').toggleClass('is-show-filter');
      },
      filter(e) {
        bcsffilter.buildSubmitEvent(null, !0, e);
        this.open = false;
      },
      reset(e) {
        clearAllFilterOptions(e);
        this.open = false;
      }
    }
  })
})

import Vue from 'vue';
import Minicart from '../components/minicart.vue';
import Drawer from '../components/drawer.vue'
import store from '../store'
import {getSizedImageUrl} from '../utils/common'
import {mapState, mapActions} from 'vuex'

document.querySelectorAll(".vue-cart").forEach(el => {
  new Vue({
    el: el,
    store,
    delimiters: ['${', '}'], // This is important to not cause liquid errors with {{ ... }}
    computed: {
      ...mapState('global', ['cartDrawerIsOpen']),
      ...mapState('cart', ['cart'])
    },
    components: {
      'drawer': Drawer,
      'minicart': Minicart
    },
    methods: {
      ...mapActions('cart', ['removeItem', 'addQty', 'decQty', 'updateQty']),
      ...mapActions('global', ['closeCartDrawer', 'openCartDrawer']),
      getImage: getSizedImageUrl
    }
  })
})


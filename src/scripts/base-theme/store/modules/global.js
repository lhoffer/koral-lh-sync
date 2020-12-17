import Vue from 'vue'

const state = {
  navDrawerIsOpen: false,
  cartDrawerIsOpen: false,
  sizeChartModalVisible: false,
  settings: window.VuexState.settings || {},
  translations: window.VuexState.translations || {}
}

let cartTimeout;

const actions = {
  openCartDrawer({state, commit}) {
    commit('TOGGLE_CART_DRAWER', true);
    if(state.settings.minicart_use_dropdown) {
      clearTimeout(cartTimeout);
      cartTimeout = setTimeout(_ => {
        commit('TOGGLE_CART_DRAWER', false);
      }, state.settings.minicart_dropdown_timeout)
    }
  },
  closeCartDrawer({commit}) {
    commit('TOGGLE_CART_DRAWER', false);
  },
  openNavDrawer({commit}) {
    commit('TOGGLE_NAV_DRAWER', true);
  },
  closeNavDrawer({commit}) {
    commit('TOGGLE_NAV_DRAWER', false);
  },
  closeSizeChart({commit}) {
    commit('TOGGLE_SIZECHART', false)
  },
  openSizeChart({commit}) {
    commit('TOGGLE_SIZECHART', true)
  }
}

const mutations = {
  TOGGLE_NAV_DRAWER(state, isOpen) {
    Vue.set(state, 'navDrawerIsOpen', isOpen);
  },
  TOGGLE_CART_DRAWER(state, isOpen) {
    Vue.set(state, 'cartDrawerIsOpen', isOpen);
  },
  TOGGLE_SIZECHART(state, isOpen) {
    Vue.set(state, 'sizeChartModalVisible', isOpen);
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}

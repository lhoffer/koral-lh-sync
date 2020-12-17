import ShopifyApi from '../../api/cart'
import Vue from 'vue'

const state = {
  isBusy: false,
  cart: null,
  error: null
}

const getters = {}

const actions = {
  getCart({state, commit, rootState}) {
    if(state.isBusy) {
      console.log(rootState.global.translations.cart.busy_message);
    } else {
      commit('TOGGLE_BUSY', true);
      ShopifyApi.getCart()
        .then(cart => {
          commit('SET_CART', cart);
          commit('TOGGLE_BUSY', false);
        }).catch(err => {
          commit('SET_ERROR', err)
          commit('TOGGLE_BUSY', false);
        })
    }
  },
  addItem({state, commit, dispatch}, postData) {
    if(state.isBusy) {
      console.log(rootState.global.translations.cart.busy_message);
    } else {
      commit('TOGGLE_BUSY', true);
      return ShopifyApi.addItem(postData)
        .then(cart => {
          commit('TOGGLE_BUSY', false);
          dispatch('getCart')
        }).catch(err => {
          commit('SET_ERROR', err)
          commit('TOGGLE_BUSY', false);
        }); 
    }
  },
  removeItem({dispatch}, item) {
    return dispatch('updateQty', {item, qty: 0});
  },
  addQty({dispatch}, item) {
    return dispatch('updateQty', {item, qty: item.quantity + 1});
  },
  decQty({dispatch}, item) {
    if(item.quantity > 1) {
      return dispatch('updateQty', {item, qty: item.quantity - 1});
    } else {
      console.log('Invalid quantity')
    }
  },
  updateQty({state, commit, dispatch}, {item, qty}) {  
    if(state.isBusy) {
      console.log(rootState.global.translations.cart.busy_message);
    } else {
      commit('TOGGLE_BUSY', true);
      const update = { [item.id]: parseInt(qty) || 0 };
      return ShopifyApi.updateItem({updates: update})
        .then(cart => {
          commit('TOGGLE_BUSY', false);
          dispatch('getCart')
        }).catch(err => {
          commit('SET_ERROR', err)
          commit('TOGGLE_BUSY', false);
        }); 
    }
  },
  applyGiftMessage({state, commit, dispatch}, {attributeName, message}) {
    if(state.isBusy) {
      console.log(rootState.global.translations.cart.busy_message);
    } else {
      commit('TOGGLE_BUSY', true);
      let deferred;
      if(!attributeName) {
        deferred = ShopifyApi.updateCartNote(message)
      } else {
        deferred = ShopifyApi.updateItem({attributes: {[attributeName]: message}});
      }
      return deferred.then(cart => {
        commit('TOGGLE_BUSY', false);
        dispatch('getCart')
      }).catch(err => {
        commit('SET_ERROR', err)
        commit('TOGGLE_BUSY', false);
      }); 
    }
  }
}

const mutations = {
  TOGGLE_BUSY(state, isBusy) {
    Vue.set(state, 'isBusy', isBusy);
  },
  SET_ERROR(state, error) {
    Vue.set(state, 'error', error);
  },
  SET_CART(state, cart) {
    Vue.set(state, 'cart', cart);
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

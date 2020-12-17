import {handleize, getQueryString} from '../../utils/common'
import Vue from 'vue'


const qs = getQueryString();
/**
 * Converts products to product group
 * @param {object} state 
 * @param {Array} products 
 */
const process = (swatches, products, groupby_type, groupby_prefix, product_id) => {
  const groups = [];
  if(!products)
    return groups;
  products.forEach(function(data) {
    let key = data.id; // defaults to product id in case no grouping is found 
    switch(groupby_type) {
      case 'type': key = data.product_type.toLowerCase(); break;
      case 'tag': 
        if(groupby_prefix) {
          const tag = data.tags.find(t => t.toLowerCase().indexOf(groupby_prefix.toLowerCase()) == 0);
          // only group if tag is found
          if(tag) key = tag.toLowerCase();
        } break;
      default: break;
    }

    let group = groups.find(g => g.key == key);
    if(!group) {
      group = {key, products: [], options_with_values: [], variants: []}
      groups.push(group)
    }
    
    group.variants = group.variants.concat(data.variants);
    data.options_with_values.forEach((o, i) => {
      const opt = group.options_with_values.find(go => go.name == o.name);
      if(opt) {
        // only add unique values
        o.values.forEach(ov => {
          if(!opt.values.find(iv => iv.title == ov.title)) {
            opt.values.push(ov);
          }
        })
      } else {
        group.options_with_values.push({
          name: o.name,
          position: i + 1,
          isSize: /^size/gi.test(o.name),
          isColor: /^colou?r/gi.test(o.name),
          values: o.values
        })
      }
    })
    group.products.push(data);
    
  });

  // after we group all products, we can set initial states before passing to vuex
  groups.forEach(group => {
    let firstAvailVariant;
    group.variants.forEach(function(v) {
      v.is_selected = false;
      // need to make sure prices are number for comparison
      if(typeof v.price == "string")
        v.price = parseFloat(v.price) * 100.0;
      if(typeof v.compare_at_price == "string")
        v.compare_at_price = parseFloat(v.compare_at_price) * 100;
      // select the variant that's in the query string from deep linking first before checking available
      if(qs.variant && v.id == qs.variant)
        firstAvailVariant = v;
      else if (!qs.variant && product_id && v.product_id == product_id && v.available && (!firstAvailVariant || firstAvailVariant.product_id != product_id))
        firstAvailVariant = v;
      else if(v.available && !firstAvailVariant)
        firstAvailVariant = v;
    });
  
    // no available variants found (all sold out) so we just use the first variant in the list
    if(!firstAvailVariant)
      firstAvailVariant = group.variants[0];
    
    firstAvailVariant.is_selected = true;
    let selectedProduct = group.products.find(p => p.variants.find(v => v.id == firstAvailVariant.id));
    group.options_with_values.forEach(function(o, i) {
      o.selected_value = firstAvailVariant.merged_options[i].split(":")[1];
      // add swatch image or color hex
      o.values.forEach(function(val) {
        const swatch = swatches.find(function(s) {
          if(o.isColor) {
            if(s.type == 'color_swatch') {
              const tags = s.tags.split(",").map(t => t.trim());
              const foundByTag = tags.filter(t => !t).find(t => selectedProduct.tags.find(x => x.toLowerCase().trim() == t.toLowerCase().trim()));
              return foundByTag || s.code == handleize(val.title)
            }
          } else {
            return s.code == handleize(val.title);
          }
          return false;
        });
        if(o.isColor) {
          // set default no-swatch
          val.image = '<span class="swatch no-swatch"></span>';
          if(swatch) {
            val.image = `<span class="swatch ${swatch.code}" style="background-color:${swatch.color}">${swatch.image ? `<img src="${swatch.image}"/>` : ''}</span>`;
          }
        } else if(swatch) {
          val.display = swatch.name;
          val.order = swatch.order || 0;
        }
      });
      if(o.isColor) {
        o.values.sort((a, b) => {
          if (a.title < b.title) return -1;
          if (a.title > b.title) return 1;
          return 0
        });
      } else if(o.isSize) {
        o.values.sort((a, b) => {
          if (a.order < b.order) return -1;
          if (a.order > b.order) return 1;
          return 0
        });
      }
    })
  })
  
  return groups;
}

const groupByType = window.VuexState.settings['product_groupby_type'];
const groupByPrefix = window.VuexState.settings['product_groupby_prefix'];


/** 
  * Model schema for product group
  * {
  *   key: string - group by key, ie: style:432HS34S
  *   products: Array[product] - list of all associated product, use this to retrieve specific product descriptions and images
  *   options_with_values: Array[product_option] - combined product options for this group, including selected variant options
  *   variants: Array[variant] - combined variants of all products in this group
  * }
  */
const state = {
  product_id: 0,
  single_product_group: null,
  product_groups: process(window.VuexState.swatches || [], window.VuexState.products, groupByType, groupByPrefix),
  related_product_groups: process(window.VuexState.swatches || [], window.VuexState.related_products, groupByType, groupByPrefix),
  recently_viewed_groups: [],
  swatches: window.VuexState.swatches || [],
  tag_mappings: window.VuexState.tag_mappings || []
}


const getters = {
  // gets group by a product id that's in this group
  getProductGroup: state => id => {
    return state.product_groups.find(p => p.products.find(xp => xp.id == id));
  }
}

const actions = {
  setProductId({commit}, payload) {
    commit('SET_PRODUCT_ID', payload);
  },
  setProducts({state, commit}, {products, groupByType, groupByPrefix}) {
    commit('SET_PRODUCT_GROUPS', products.length ? process(state.swatches, products, groupByType, groupByPrefix, state.product_id) : products)
  },
  setRelatedProducts({state, commit}, {products, groupByType, groupByPrefix}) {
    commit('SET_RELATED_PRODUCTS', products.length ? process(state.swatches, products, groupByType, groupByPrefix) : products)
  },
  concatProducts({state, commit}, {products, groupByType, groupByPrefix}) {
    const groups = process(state.swatches, products, groupByType, groupByPrefix);
    commit('CONCAT_PRODUCT_GROUPS', groups)
  },
  selectVariant({commit}, payload) {
    commit('SET_SELECTED_VARIANT', payload)
  },
  selectOption({commit}, payload) {
    commit('SET_SELECTED_OPTION', payload)
  },
  setRecentlyViewedProducts({state, commit}, {products, groupByType, groupByPrefix}) {
    const groups = process(state.swatches, products, groupByType, groupByPrefix);
    commit('SET_RECENTLY_VIEWED_PRODUCT_GROUPS', groups)
  }
}

const mutations = {
  SET_PRODUCT_ID(state, pid) {
    Vue.set(state, 'product_id', pid);
    Vue.set(state, 'single_product_group', state.product_groups.find(p => p.products.find(xp => xp.id == pid)))
  },
  SET_PRODUCT_GROUPS(state, groups) {
    Vue.set(state, 'product_groups', groups);
    if(state.product_id > 0) {
      Vue.set(state, 'single_product_group', state.product_groups.find(p => p.products.find(xp => xp.id == state.product_id)))
    }
  },
  SET_RELATED_PRODUCTS(state, groups) {
    Vue.set(state, 'related_product_groups', groups);
  },
  CONCAT_PRODUCT_GROUPS(state, groups) {
    groups.forEach(g => state.product_groups.push(g));
  },
  SET_SELECTED_VARIANT(state, {key, id}) {
    const group = state.product_groups.find(g => g.key == key) || state.related_product_groups.find(g => g.key == key);
    if(group) {
      group.variants.forEach(v => {
        v.is_selected = false;
        if(v.id == id) {
          v.is_selected = true;
        }
      })
    }
  },
  SET_SELECTED_OPTION(state, {key, position, value}) {
    const group = state.product_groups.find(g => g.key == key) || state.related_product_groups.find(g => g.key == key);
    if(group) {
      const opt = group.options_with_values.find(o => o.position == position);
      if(opt) {
        opt.selected_value = value;
      }
    }
  },
  SET_RECENTLY_VIEWED_PRODUCT_GROUPS(state, groups) {
    Vue.set(state, 'recently_viewed_groups', groups);
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
  process
}

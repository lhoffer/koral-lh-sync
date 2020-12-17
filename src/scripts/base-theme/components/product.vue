<template>
  <div class="product__item" v-if="product" :class="{'sold-out': allSoldOut}">
    <div class="product__item-media">
      <a class="product__item-images" :href="productUrl">
        <responsive-img class="product__item-img primary" :size="'480x'" :src="featuredImage"></responsive-img>
        <responsive-img class="product__item-img secondary" v-if="altImage" :size="'480x'" :src="altImage"></responsive-img>
        <span class="product-badge" v-if="getBadge" :style="{color: getBadge.color}">{{ getBadge.text }}</span>
      </a>
      <div v-if="quickshop == 'modal'" class="product__item-quickshop bc-quickview-btn-wrapper" :data-bc-qv-template="quickshopUrl">
        <span class="btn btn-primary btn-block"><span>{{translations.quickshop_btn_text}}</span></span>
      </div>
      <div class="product__item-quickshop" v-else-if="sizeOption && quickshop == 'inline'">
        <div class="product__item-options">
          <product-option :option="sizeOption" @selected="selectOption" :is-available="isAvailable"></product-option>
        </div>
        <button @click="addToCart()" :disabled="!(variant && variant.available)" class="btn btn-primary btn-block">
          <span v-if="variant && variant.available">{{translations.add_to_cart}}</span>
          <span v-else-if="!variant">{{translations.unavailable}}</span>
          <span v-else>{{translations.sold_out}}</span>
        </button>
      </div>
    </div>
    <a class="product__item-summary" :href="productUrl">
      <h3 class="product__item-name">
        <span>{{ product.title }}</span>
      </h3>
      <div class="product__tags" v-html="productTags"></div>
      <div class="product__item-extra">
        <span class="product__item-prices" v-if="variant" :class="variant.compare_at_price > variant.price ? 'on-sale' : ''">
          <span class="price">{{variant.price | money_nodec}}</span>
          <span class="compare-price" v-if="variant.compare_at_price > variant.price">{{ variant.compare_at_price | money_nodec }}</span>
        </span>
        <span class="label" v-else>{{translations.unavailable}}</span>

        <span class="label" v-if="allSoldOut">{{translations.sold_out}}</span>
      </div>
    </a>
    <span class="shopify-product-reviews-badge" :data-id="product.id"></span>
    <product-option :option="colorOption" @selected="selectOption" :is-available="isAvailable" :limit="8" :moreHref="productUrl"></product-option>
  </div>
</template>

<script>
import {mapState, mapActions, mapGetters} from 'vuex'
import {handleize, getQueryString, noImageSrc, titleCase} from '../utils/common'
import ProductOption from './product-option.vue'
import ResponsiveImg from './responsive-img.vue'

export default {
  components: {
    'product-option': ProductOption,
    'responsive-img': ResponsiveImg
  },
  computed: {
    ...mapState('global', {
      'settings': 'settings',
      'translations': state => state.translations.products
    }),
    ...mapState('products', ['tag_mappings']),
    product() {
      let product = this.productGroup.products.find(p => p.variants.find(v => v.is_selected));
      // some clients doesn't pre-select variants so we have to set first product in product group as default
      if(!product)
        product = this.productGroup.products[0];

      return product;
    },
    productUrl() {
      let url = `${this.collectionHandle ? `/collections/${this.collectionHandle}` : ''}/products/${this.product.handle}`;
      if(this.variant) 
        url += `?variant=${this.variant.id}`;
      return url;
    },
    quickshopUrl() {
      let url = `${this.collectionHandle ? `/collections/${this.collectionHandle}` : ''}/products/${this.product.handle}`;
      return `${url}?view=${this.settings['quickshop_template']}`;
    },
    allSoldOut() {
      return !this.productGroup.variants.filter(v => v.available).length
    },
    variant() {
      return this.productGroup.variants.find(v => v.is_selected);
    },
    // TODO: use this to maybe select image by color swatch
    // selectedOption() {
    //   return {
    //     color: this.variant[`option${this.colorOption.position}`],
    //     size: this.variant[`option${this.sizeOption.position}`] 
    //   };
    // },
    colorOption() {
      return this.productGroup.options_with_values.find(o => o.isColor);
    },
    sizeOption() {
      return this.productGroup.options_with_values.find(o => o.isSize);
    },
    featuredImage() {
      if(this.product.images_info && this.product.images_info.length) {
        return this.product.images_info[0].src
      }
      return noImageSrc;
    },
    altImage() {
      if(!this.settings['collection_enabled-img-hover'])
        return null;

      if(this.product.images_info && this.product.images_info.length > 1) {
        return this.product.images_info[1].src
      }
      return null;
    },
    productTags() {
      if(this.tag_mappings && this.tag_mappings.length) {
        return this.product.tags
          .reduce((matches, t) => {
            const tagSplit = t.split(':');
            const mapping = this.tag_mappings.find(tm => {
              return tm.prefix.toLowerCase() == tagSplit[0].toLowerCase();
            });
            if(mapping) {
              // if tag is key:value then we use value as the label, otherwise we use what's in the tag_mappings
              matches.push(`<span class="${handleize(mapping.prefix)}">${titleCase(tagSplit[1] || mapping.label)}</span>`);
            }
            return matches;
          }, []).join("")
      }
      return null;
    },
    quickshop() {
      let quickshop = ''; // no quickshop or quick add
      if(this.quickshopType == 'default') {
        if(this.settings['quickshop_enable'])
          quickshop = 'modal';
        else 
          quickshop = 'inline';
      } else {
        quickshop = this.quickshopType;
      }
      return quickshop;
    },
    hasOnlyDefaultVariant() {
      let has_only_default_variant = false;
      if(this.product.options_with_values.length == 1) {
        let values = this.product.options_with_values[0].values;
        has_only_default_variant = values.length == 1 && values[0].title.indexOf("Default") >= 0;
      }
      return has_only_default_variant;
    },
    getBadge() {
      const badgePrefix = 'badge_';
      const badgeTag = this.product.tags.find(tag => tag.includes(badgePrefix));
      if (!badgeTag) {
        return null;
      }
      const splittedTag = badgeTag.split(':');
      if (splittedTag.length != 2) {
        return null;
      }
      const badgeColor = splittedTag[0].replace(badgePrefix, '#');
      const badgeText = splittedTag[1];
      return {
        color: badgeColor,
        text: badgeText,
      };
    }
  },
  data() { 
    return {quantity: 1} 
  },
  props: {
    quickshopType: {type: String, default: 'default'}, // manual override if we want to for like related products where BCSF quickview is not available
    productGroup: Object,
    collectionHandle: String
  },
  methods: {
    ...mapActions('cart', ['addItem']),
    ...mapActions('global', ['openCartDrawer']),
    ...mapActions('products', {
      selectOption(dispatch, {position, value}) {
        dispatch('selectOption', { key: this.productGroup.key, position, value });
        const opt = this.productGroup.options_with_values.map(o => { 
          if(position == o.position)
            return { position, selected_value: value };
          return { position: o.position, selected_value: o.selected_value }
        });
        
        const variant = this.getVariant(opt);
        let id = null;
        if(variant) {
          id = variant.id;
        }
        dispatch('selectVariant', {key: this.productGroup.key, id})
      }
    }),
    // TODO: Maybe this is needed sometime in the future
    // incrementQuantity() {
    //   this.quantity = this.quantity + 1;
    // },
    // decrementQuantity() {
    //   if (this.quantity > 1)
    //     this.quantity = this.quantity - 1;
    // },
    getVariant(options) {
      const group = this.productGroup;
      if(group && group.variants.length) {
        return group.variants.find(v => {
          return options.every(opt => {
            return v.merged_options[opt.position - 1].split(":")[1] == opt.selected_value;
          })
        })
      }
      return null;
    },
    addToCart() {

      if(!this.variant) 
        console.log('Unable to add item to cart, variant not found')
      
      this.addItem({id: this.variant.id, quantity: this.quantity})
        .then(_ => {
          this.openCartDrawer();
        });
    },
    /**
     * Returns -1 if variant combination doesn't exist, 1 if variant is available, 0 if variant exists but is not available or has no inventory
     */
    isAvailable(position, value) {
      if(this.quickshop == "modal")
        return 1; // always make available if we're using quickshop modal since there's no way for user to change size 

      const opt = this.productGroup.options_with_values.map(o => { 
        if(position == o.position)
          return { position, selected_value: value };
        return { position: o.position, selected_value: o.selected_value }
      });
      
      const variant = this.getVariant(opt);
      if(!variant)
        return -1;
      return variant.available ? 1 : 0
    }
  }
}
</script>

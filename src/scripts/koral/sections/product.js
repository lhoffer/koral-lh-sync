import Vue from 'vue';
import ProductOption from '../components/product-option.vue'
import Carousel from '~/base-theme/components/carousel.vue';
import ResponsiveImage from '~/base-theme/components/responsive-img.vue'
import store from '~/base-theme/store'
import {mapActions, mapState} from 'vuex'
import { noImageSrc } from '~/base-theme/utils/common'
import {swiper, swiperSlide} from 'vue-awesome-swiper'

document.querySelectorAll(".vue-product-detail").forEach(el => {
  new Vue({
    el: el,
    store,
    delimiters: ['${', '}'], // This is important to not cause liquid errors with {{ ... }}
    mounted() {
      this.setProductId(this.$el.attributes['product-id'].value);
      this.displayVideoAfterOnloadPage();
      /**
       * If the current page is PDP and has grouping enabled, then we kick off ajax call to retrieve additional color products
       */
      const groupByType = this.settings['product_groupby_type'];
      const groupByPrefix = this.settings['product_groupby_prefix'];
      const prod = window.VuexState.products[0];
      let url = '';
      if(groupByType == 'tag' && groupByPrefix && prod) {
        let tag = prod.tags.find(t => t.toLowerCase().indexOf(groupByPrefix.toLowerCase()) >= 0);
        if(tag) {
          url = `/collections/all/${encodeURIComponent(tag)}?view=json`
        }
      } else if(groupByType == 'type' && prod) {
        url = `/collections/all/${prod.type}?view=json`
      }
      if(url) {
        $.get(url).then(raw => {
          try{
            const products = JSON.parse(raw);
            if(products && products.length)
              this.setProducts({products: products, groupByType, groupByPrefix});
          } catch (e) {
            console.log(e);
          }
        })
      }
    },
    data: {quantity: 1, giftMessage: "", swiperMainOptions: null},
    components: {
      'carousel': Carousel,
      'product-option': ProductOption,
      'responsive-img': ResponsiveImage,
      swiper,
      swiperSlide
    },
    computed: {
      ...mapState('global', ['settings']),
      ...mapState('cart', ['isBusy']),
      ...mapState('products', {
        'productGroup': 'single_product_group',
        'tag_mappings': 'tag_mappings'
      }),
      product() {
        if(!this.productGroup)
          return null;

        let product = this.productGroup.products.find(p => p.variants.find(v => v.is_selected));
        // some clients doesn't pre-select variants so we have to set first product in product group as default
        if(!product)
          product = this.productGroup.products[0];
  
        return product;
      },
      productUrl() {
        const url_split = window.location.href.split('/products/');
        const url_base = url_split[0];
        let url = `${url_base}/products/${this.product.handle}`;
        if(this.variant) 
          url += `?variant=${this.variant.id}`;
        return url;
      },
      variant() {
        return this.productGroup.variants.find(v => v.is_selected);
      },
      featuredImage() {
        if(this.product.images_info && this.product.images_info.length) {
          return this.product.images_info[0].src
        }
        return noImageSrc;
      },
      altImages() {
        return this.product.images_info.filter(i => i.src != this.featuredImage);
      },
      productTags() {
        if(this.tag_mappings && this.tag_mappings.length) {
          return this.product.tags
            .reduce((matches, t) => {
              const tagSplit = t.split(':');
              const mapping = this.tag_mappings.find(tm => {
                return tm.prefix.toLowerCase() == tagSplit[0].toLowerCase() && tm.visible;
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
      hasOnlyDefaultVariant() {
        let has_only_default_variant = false;
        if(this.product.options_with_values.length == 1) {
          let values = this.product.options_with_values[0].values;
          has_only_default_variant = values.length == 1 && values[0].title.indexOf("Default") >= 0;
        }
        return has_only_default_variant;
      },
      tagsToAdd() {
        let tagsToShow = null;
        if(this.tag_mappings && this.tag_mappings.length) {
          tagsToShow = this.product.tags
            .reduce((matches, t) => {
              const tagSplit = t.split(':');
              const mapping = this.tag_mappings.find(tm => {
                return tm.prefix.toLowerCase() == tagSplit[0].toLowerCase() && tm.add_to_cart;
              });
              if(mapping) {
                matches.push({mapping: mapping, tag: t})
              }
              return matches;
            }, [])
        }
        return tagsToShow;
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
    methods: {
      ...mapActions('cart', ['addItem']),
      ...mapActions('global', ['openCartDrawer', 'openSizeChart']),
      ...mapActions('products', {
        setProductId(dispatch, payload) { dispatch('setProductId', payload) },
        setProducts(dispatch, payload) { dispatch('setProducts', payload) },
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

          if (variant && this.product)
            history.replaceState(null, '', this.productUrl);
        }
      }),
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
      addQty() {
        this.quantity++
      },
      decQty() {
        if(this.quantity > 1)
          this.quantity--;
      },
      addToCart() {
        if(!this.variant) 
          console.log('Unable to add item to cart, variant not found')
        
        const properties = {};
        if(this.giftMessage) {
          properties["Gift Message"] = this.giftMessage;
        }
        if(this.tagsToAdd) {
          this.tagsToAdd.forEach((t,index) => {
            const keyValMap = t.mapping.prop_key_value;
            const split = keyValMap.split(":");
            if(split.length > 1) {
              const key = split[0] == '${prefix}' ? t.mapping.prefix : split[0];
              let val = split[1]
              if(split[1] == '${label}')
                val = t.mapping.label
              else if(split[1] == '${tag}'){
                const tagSplit = t.tag.split(":");
                val = tagSplit.length > 1 ? tagSplit[1] : tagSplit[0];
              }
  
              properties[key.trim()] = val.trim();
            } else {
              properties[`item${index}`] = keyValMap || t.tag;
            }
          })
        }
        this.addItem({id: this.variant.id, quantity: this.quantity, properties})
          .then(_ => {
            this.openCartDrawer();
          });
      },
      /**
       * Returns -1 if variant combination doesn't exist, 1 if variant is available, 0 if variant exists but is not available or has no inventory
       */
      isAvailable(position, value) {
        const opt = this.productGroup.options_with_values.map(o => { 
          if(position == o.position)
            return { position, selected_value: value };
          return { position: o.position, selected_value: o.selected_value }
        });
        
        const variant = this.getVariant(opt);
        if(!variant)
          return -1;
        return variant.available ? 1 : 0
      },
      setMainSwiper(thumbSwiper) {
        this.swiperMainOptions = {
          mousewheel: true, 
          autoplay: false, 
          loop: true,
          zoom: true,
          thumbs: {
            swiper: thumbSwiper
          }
        }
      },
      scrollToImage(index) {
        $('body,html').animate({ scrollTop: $(`.product-images .product-image:eq(${index})`).offset().top - 75 }, 100);
      },

      displayVideoAfterOnloadPage() {
        window.onload = function () { 
          $("#product-video").show();
          console.log('show')
      }
      },

      onclickPlayVideo() {
        $("#product-video")[0].play();
      },
    }
  })
})

<template>
  <div class="responsive-img" :class="{'swiper-zoom-container': zoom, 'is-by-ratio': ratio}" :style="ratio" ref="imgContainer">
    <img :src="resized" v-if="useSrcSet" :srcset="srcSet" sizes="100vw" />
    <img :src="resized" v-else />
  </div>
</template>

<script>
import {getSizedImageUrl} from '../utils/common';

export default {
  props: {
    src: String,
    size: String,
    zoom: [String, Object],
    useSrcSet: Boolean,
    maxWidth: Number,
    maxHeight: Number
  },
  computed: {
    resized() {
      if(this.size) {
        return getSizedImageUrl(this.src, this.size)
      } else if(this.maxWidth) {
        return getSizedImageUrl(this.src, `${this.maxWidth}x`)
      } else
        return this.src;
    },
    ratio() {
      if((this.maxWidth || this.maxHeight)) {
        const ratio = (this.maxHeight || 0) / (this.maxWidth || 1) * 100;
        return {
          'padding-top': `${ratio}%`
        }
      }
      return null;
    },
    srcSet() {
      const sizes = ['480x','765x','1000x','1300x','1700x','2000x'];
      if(!this.src)
        return null;
        
      const srcSet = sizes.map(size => `${getSizedImageUrl(this.src, `${size}.progressive`)} ${size.replace('x', 'w')}`);
      return srcSet.join(",")
    }
  },
  mounted() {
    this.$nextTick(_ => {
      if(this.zoom){
        const opt = typeof this.zoom == "string" ? {url: this.zoom} : this.zoom;
        $(this.$refs.imgContainer).zoom(opt)
      }
    })
  },
  watch: {
    zoom: function(val, oldVal) {
      this.$nextTick(_ => {
        if(this.zoom){
          const opt = typeof this.zoom == "string" ? {url: this.zoom} : this.zoom;
          $(this.$refs.imgContainer).zoom(opt)
        }
      })
    }
  }
}
</script>

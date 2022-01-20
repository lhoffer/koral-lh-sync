<template>
  <a :href="mobileZoom ? resized : null" v-bind:[fancyBoxAttr]="true">
    <div class="responsive-img" :class="{'swiper-zoom-container': desktopZoom, 'is-by-ratio': ratio}" :style="ratio" ref="imgContainer">
      <img :src="resized" v-if="useSrcSet" :srcset="srcSet" sizes="100vw" />
      <img :src="resized" v-else />
      <span v-if="zoomFeature" class="image-viewer__zoom-icon">
        <img src="https://cdn.shopify.com/s/files/1/0744/4099/files/zoom-in.png?v=1591086891" alt="zoom" />
      </span>
    </div>
  </a>
</template>

<script>
import {getSizedImageUrl} from '../utils/common';

export default {
  props: {
    src: String,
    size: String,
    zoom: [String, Object],
    useSrcSet: Boolean,
    zoomFeature: Boolean,
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
    },
    desktopZoom() {
      return this.zoom && this.windowWidth >= 768;
    },
    mobileZoom() {
      return this.zoomFeature && this.windowWidth < 768;
    },
    windowWidth() {
      return $(window).width();
    },
    fancyBoxAttr() {
      return this.mobileZoom ? 'data-fancybox' : null;
    }
  },
  mounted() {
    this.$nextTick(_ => {
      if(this.desktopZoom){
        const opt = typeof this.zoom == "string" ? {url: this.zoom} : this.zoom;
        $(this.$refs.imgContainer).zoom(opt)
      }
    });

    if(this.windowWidth < 768) {
      $('[data-fancybox]').fancybox({
        arrows: false,
        infobar: false,
        loop: true,
        buttons: [
          'close'
        ]
      });
    }
  },
  watch: {
    zoom: function(val, oldVal) {
      this.$nextTick(_ => {
        if(this.desktopZoom){
          const opt = typeof this.zoom == "string" ? {url: this.zoom} : this.zoom;
          $(this.$refs.imgContainer).zoom(opt)
        }
      })
    }
  }
}
</script>

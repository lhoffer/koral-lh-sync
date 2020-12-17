<template>
  <div class="product__item-option" 
    v-if="option && (!option.isColor || optionValues.length > 1)"
    :class="[option.isColor ? 'color':'', option.isSize ? 'size':'', !option.isColor && !option.isSize ? handle(option.name):'']">
    <span class="option-name">
      <span class="label">
        <span>{{option.name}}</span>
        <em>{{option.selected_value}}</em>
      </span>
      <span class="extra-slot">
        <slot name="label"></slot>
      </span>
    </span>
     <div class="option-labels">
      <label class="option" 
        v-for="val in optionValues" 
        :key="val.title"
        :title="val.title" 
        :class="{disabled: isAvailable(option.position, val.title) != 1, selected: option.selected_value == val.title, 'option--color': option.isColor}">
        <input 
          type="radio" 
          :value="val.title" 
          :checked="option.selected_value == val.title"
          @click="$emit('selected', {position: option.position, value: val.title})"
        />
        <span class="swatch-wrapper" v-if="option.isColor" v-html="val.image"></span>
        <span v-else>{{val.display || val.title}}</span>
        <div class="tooltip" role="tooltip">{{val.title}}</div>
      </label>
      <a :href="moreHref" v-if="limit > 0 && option.values.length >= limit"><i>+</i><span>More</span></a>
    </div>
  </div>
</template>

<script>
import {handleize} from '~/base-theme/utils/common';

export default {
  props: {
    option: Object,
    moreHref: String,
    isAvailable: Function,
    limit: { type: Number, default: 0 }
  },
  computed: {
    optionValues() {
      if(this.limit > 0)
        return this.option.values.slice(0, this.limit)
      else
        return this.option.values;
    }
  },
  methods: {
    handle(val) {
      return handleize(val)
    }
  }
}
</script>

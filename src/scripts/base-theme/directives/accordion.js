import Vue from 'vue';

Vue.directive('accordion', {
  bind: function(el, binding) {
    let toggle = '.accordion__toggle';
    if(binding.value && binding.value.toggle) {
      toggle = binding.value.toggle;
    }
    $(toggle, el).on('click', function(e) {
      e.preventDefault();
      const parent = $(this).parents('.accordion');
      if(parent.length) {
        if(parent.hasClass('is-active')) {
          parent.removeClass('is-active')
          $(this).attr('aria-expanded', 'false');
        } else {
          $('.accordion', el).removeClass('is-active')
          $('.accordion__title > a').attr('aria-expanded', 'false');
          parent.addClass('is-active');
          $(this).attr('aria-expanded', 'true');
        }
      } else {
        if(!$(this).hasClass('is-active')) {
          $(`${toggle}.is-active`, el).removeClass('is-active');
          $(this).toggleClass('is-active');
        }
      }
    });
  }
})

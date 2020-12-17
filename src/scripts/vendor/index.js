// IMPORTANT: NodeList is polyfill for ie11 
if (window.NodeList && !window.NodeList.prototype.forEach) {
  window.NodeList.prototype.forEach = window.Array.prototype.forEach;
}

import 'es6-promise/auto' // This is needed for vuex
import 'lazysizes';
import 'jquery-zoom';
import 'lity';

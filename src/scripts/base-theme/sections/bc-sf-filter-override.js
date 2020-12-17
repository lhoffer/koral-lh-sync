import store from '../store';

if(window.BCSfFilter) {
  window.BCSfFilter.prototype.buildProductGridItem = function(data, index) {
    return '';
  }
  window.BCSfFilter.prototype.buildProductListItem = function(data) {
    return '';
  }
  window.BCSfFilter.prototype.buildProductListData = function() {
    // this override is to prevent race condition with VueJS for rendering grid items
  }

  //we're overriding swatch display to parse prefixes so background-color works
  window.BCSfFilter.prototype.buildFilterOptionItem = function(a, b, c, d, e, f, g, h, i, j) {
    var k = !!j.hasOwnProperty("keepValuesStatic") && j.keepValuesStatic;
    if ("review_ratings" == d && "text" == this.getSettingValue("general.ratingSelectionStyle"))
        var l = this.getReviewRatingsLabel(i.from);
    else
        var l = this.customizeFilterOptionLabel(b, j.prefix, d);
    if (!0 === k)
        var m = null;
    else
        var m = i.hasOwnProperty("doc_count") ? i.doc_count : 0;
    a = a.replace(/{{itemLabel}}/g, this.buildFilterOptionLabel(b, m, j)),
    a = a.replace(/{{itemLink}}/g, this.buildFilterOptionLink(e, c, d, g, h, k)),
    a = a.replace(/{{itemValue}}/g, encodeURIParamValue(l)),
    a = a.replace(/{{itemTitle}}/g, l),
    a = a.replace(/{{itemFunc}}/g, "onInteractWithFilterOptionValue(event, this, '" + d + "', '" + g + "', '" + h + "', '" + k + "')"),
    a = this.checkFilterOptionSelected(e, c, d, g) ? a.replace(/{{itemSelected}}/g, "selected") : a.replace(/{{itemSelected}}/g, "");
    var n = jQ(a);
    return n.children().attr({
        "data-id": e,
        "data-value": encodeURIParamValue("collection" == d ? c.split(":")[0] : c),
        "data-parent-label": f,
        "data-title": l,
        "data-count": m
    }),
    this.getSettingValue("general.enableSeo") && "collection" != d && n.children().attr("rel", "nofollow"),
    "collection" == d && n.children().attr("data-collection-scope", i.key),
    jQ(n)[0].outerHTML
  }

  const before = window.BCSfFilter.prototype.buildProductList;
  window.BCSfFilter.prototype.buildProductList = function(a,b) {
    if(b == "page" && this.getSettingValue('general.paginationType') == "default") {
      //scroll to top
      window.scrollTo({top: 0, left: 0, behavior: 'smooth'})
    }

    before.call(this, a, b);

    if(b != "page" || (b == "page" && this.getSettingValue('general.paginationType') == "default"))
      store.dispatch('products/setProducts', {products: []})
    
    store.dispatch('products/concatProducts', {products: a});
  }

  window.onSelectFilterOptionItem = function(a, b) {
    jQ(b).data("count") > 0 && (bcsffilter.selectFilter = !0,
    jQ(b).hasClass("selected") ? jQ(b).parent().children().removeClass("selected") : jQ(b).parent().children().addClass("selected"))

    var e = jQ(b).parents('.'+bcsffilter.class.filterOption)
      , f = e.data("type")
      , g = e.data("display-type")
      , h = e.data("select-type")
      , i = e.attr("data-id")
      , j = e.find('.selected.' + bcsffilter.class.filterOptionItem).map(function(i, item) {
        return $(item).data("value");
      }).toArray()
      , k = bcsffilter.buildSubmitLink(i, j, f, g, h);
    bcsffilter.internalClick = !0,
    bcsffilter.onChangeData(k, f, j, i);
  }
}

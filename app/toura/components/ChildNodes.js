dojo.provide('toura.components.ChildNodes');

dojo.require('mulberry._Component');

dojo.declare('toura.components.ChildNodes', mulberry._Component, {
  templateString : dojo.cache('toura.components', 'ChildNodes/ChildNodes.haml'),
  handleClicks : true,

  prepareData : function() {
    this.children = this.node.children || [];
  },

  adjustMarkup : function() {
    if (!this.children.length) {
      this.addClass('empty');
    }
  },

  _clickHandler : function(t, e) {
    dojo.addClass(t, 'tapped');
  }
});

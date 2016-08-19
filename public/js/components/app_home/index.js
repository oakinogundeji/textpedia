'use strict';
module.exports = function ($) {
  return {
    template: require('./template.html'),
    methods: {
      signup: function () {
        return this.$dispatch('show-signup');
      }
    },
    ready: function () {
    }
  };
};

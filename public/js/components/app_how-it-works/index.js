'use strict';
module.exports = {
  template: require('./template.html'),
  methods: {
    showSignup: function () {
      return this.$dispatch('show-signup');
    }
  }
};

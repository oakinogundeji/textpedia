'use strict';
module.exports = function (jQ) {
  return {
    template: require('./template.html'),
    methods: {
      'signup': function () {
        jQ('#closewhyTxtpModal').trigger('click');
        return this.$dispatch('show-signup');
      }
    }
  };
};

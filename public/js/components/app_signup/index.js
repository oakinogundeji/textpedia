'use strict';
module.exports = {
  template: require('./template.html'),
  data: function () {
    return {
      email: '',
      phoneNumber: '',
      submitURL: '/submit'
    };
  },
  methods: {
    showConfirm: function () {
      if(this.email.trim() && this.phoneNumber.trim()) {
        return $('#showDetails').trigger('click');
      }
      return null;      
    },
    submitCreds: function () {
      if(this.email.trim() && this.phoneNumber.trim()) {
        console.log('valid creds');
        var data = {
          email: this.email.trim(),
          phoneNumber: this.phoneNumber.trim()
        };
        this.$http.post(this.submitURL, {
          data: data
        }).
          then(function (res) {
            console.log('server resp', res.data);
            return this.$dispatch('show-confirm');
          }.bind(this)).
          catch(function (info) {
            return console.log('yawa gas', info);
          });
        $('#closesignupModal').trigger('click');
        return this.email = this.phoneNumber = '';
        }
      else {
        return console.log('oops');
      }
    },
    editDetails: function () {
      $("#phone").removeClass("error");
      $("#error-msg").addClass("hide");
      $("#valid-msg").addClass("hide");
      this.email = this.phoneNumber = '';
      return $('#closesignupModal').trigger('click');
    }
  },
  ready: function () {
    var
      $telInput = $("#phone"),
      reset,
      errorMsg = $("#error-msg"),
      validMsg = $("#valid-msg");
    $telInput.intlTelInput({
      utilsScript: "js/utils.js"
    });
    reset = function() {
      $telInput.removeClass("error");
      errorMsg.addClass("hide");
      validMsg.addClass("hide");
    };
    $telInput.blur(function() {
      reset();
      if ($.trim($telInput.val())) {
        if ($telInput.intlTelInput("isValidNumber")) {
          validMsg.removeClass("hide");
          this.phoneNumber = $telInput.intlTelInput("getNumber");
        } else {
          $telInput.addClass("error");
          errorMsg.removeClass("hide");
          this.phoneNumber = '';
        }
      }
    }.bind(this));
    $telInput.on("keyup change", reset);
  }
};

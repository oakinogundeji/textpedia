'use strict';
module.exports = function (jQ) {
  return {
    template: require('./template.html'),
    data: function () {
      return {
        email: '',
        phoneNumber: '',
        submitURL: '/submit',
        showSignupErr: false
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
          var data = {
            email: this.email.trim(),
            phoneNumber: this.phoneNumber.trim()
          };
          this.$http.post(this.submitURL, {
            data: data
          }).
            then(function (res) {
              jQ('#spinner').removeClass('spinner');
              return this.$dispatch('show-confirm', res.data.jwt);
            }.bind(this)).
            catch(function (info) {
              jQ('#spinner').removeClass('spinner');
              if(info.statusText == 'Conflict') {
                let $errMsg = $('#signup-err');
                this.showSignupErr = true;
                $errMsg.fadeIn(200).fadeOut(4500);
                return this.showSignupErr = false;
              }
              else {
                return console.log(info);
              }
            }.bind(this));
          $('#closesignupModal').trigger('click');
          this.email = this.phoneNumber = '';
          return jQ('#spinner').addClass('spinner');
          }
        else {
          return null;
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
};

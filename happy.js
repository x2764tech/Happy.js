(function($){
  function trim(el) {
    return (''.trim) ? el.val().trim() : $.trim(el.val());
  }
  $.fn.isHappy = function (config) {
    var fields = [], item, activated = false;
    
    function getError(error) {
      var errorEl, message = isFunction(error.message) ? error.message() : error.message;
      if (config.errorElement) errorEl = $(config.errorElement).attr('id', error.id)
                                                                .addClass('unhappyMessage')
                                                                .html(error.message);
      else errorEl = $('<span id="'+error.id+'" class="unhappyMessage">'+error.message+'</span>');
      return errorEl;
    }
    function handleSubmit(e) {
      var errors = false, i, l;
      activated = true;
      for (i = 0, l = fields.length; i < l; i += 1) {
        if (!fields[i].testValid()) {
          errors = true;
        }
      }
      if (errors) {
        if (isFunction(config.unHappy)) config.unHappy(e);
        return false;
      } else if (config.testMode) {
        if (window.console) console.warn('would have submitted');
        return false;
      }
    }
    function isFunction (obj) {
      return !!(obj && obj.constructor && obj.call && obj.apply);
    }
    function processField(opts, selector) {
      var field = $(selector),
        err = {
          message: opts.message,
          id: selector.replace(/[^\w]/gi, '') + '_unhappy'
        },
        errorEl = $('#'+err.id).length > 0 ? $('#'+err.id) : getError(err);
      
      if(!field.length) return; // skip unmatched selector
      
      fields.push(field);
      field.testValid = function () {
        var val,
          el = $(this),
          gotFunc,
          error = false,
          temp, 
          required = !!el.get(0).attributes.getNamedItem('required') || opts.required,
          password = (field.attr('type') === 'password'),
          arg = isFunction(opts.arg) ? opts.arg() : opts.arg;
        
        // clean it or trim it
        if (isFunction(opts.clean)) {
          val = opts.clean(el.val());
        } else if (!opts.trim && !password) {
          val = trim(el);
        } else {
          val = el.val();
        }
        
        // write it back to the field
        el.val(val);
        
        // get the value
        gotFunc = ((val.length > 0 || required === 'sometimes') && isFunction(opts.test));
        
        // check if we've got an error on our hands
        if (activated === true && required === true && val.length === 0) {
          error = true;
        } else if (gotFunc) {
          error = !opts.test(val, arg);
        }
        
        temp = errorEl.get(0);
        if (!el.attr('disabled') && error) {
          if (isFunction(err.message)) {
            if (temp.parentNode) temp.parentNode.removeChild(temp);
            errorEl =  getError(err);
          } 
          el.addClass('unhappy');
          config.parentErrorClass && el.parent().addClass(config.parentErrorClass);
          config.insertError ? config.insertError(errorEl, el) : el.before(errorEl);
          return false;
        } else {
          // this is for zepto
          if (temp.parentNode) {
            temp.parentNode.removeChild(temp);
          }
          el.removeClass('unhappy');
          config.parentErrorClass && el.parent().removeClass(config.parentErrorClass);
          return true;
        }
      };
      field.unbind((config.when && config.when.replace(/\b(?=\s|$)/g,'.happy')) || 'blur.happy');
      field.bind((config.when && config.when.replace(/\b(?=\s|$)/g,'.happy')) || 'blur.happy', field.testValid);
    }
    
    for (item in config.fields) {
      processField(config.fields[item], item);
    }
    
    if (config.submitButton) {
      $(config.submitButton).click(handleSubmit);
    } else {
      this.unbind('submit.happy');
      this.bind('submit.happy', handleSubmit);
    }
    return this;
  };
})(this.jQuery || this.Zepto);
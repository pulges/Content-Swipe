(function(window) {

  function getsupportedprop(p){
    var root = document.documentElement;

    for (var i=0; i<p.length; i++) {
      if (p[i] in root.style) {
        return p[i];

        break;
      }
    }
    return null;
  }

  var isTouch = 'ontouchstart' in window,
      cssTransform = getsupportedprop(['transform', 'MozTransform', 'webkitTransform', 'msTransform', 'OTransform']),
      cssTransitionD = getsupportedprop(['transitionDuration', 'MozTransitionDuration', 'webkitTransitionDuration', 'msTransitionDuration', 'OTransitionDuration']);

  var defaults = {
    box_element: '.swipable-box',
    move_threshold: 0.15,
    tap_threshold: 0.05,
    fixed_stops: true
  };

  var Scroller = function(element, options) {
    this.el = element;

    this.settings = defaults;
    for (var option in options) {
      this.settings[option] = options[option];
    }

    this.idx = 0;
    this.x = 0;

    this.init();
  };

  Scroller.prototype = {

    init: function() {
      this.boxes = this.el.querySelectorAll(this.settings.box_element);
      this.boxW = this.boxes[0].offsetWidth;
      this.el.addEventListener((isTouch ? 'touchstart' : 'mousedown'), this.start.bind(this));
    },

    mX: function(event) {
      return (isTouch) ? event.targetTouches[0].pageX :  event.pageX;
    },

    start: function(event) {
      event.preventDefault();

      this.startEl = event.target;
      this.startX = this.endX = this.mX(event);

      if (cssTransitionD) {
        this.el.style[cssTransitionD] = "0s";
      }

      this.moveCallback = this.move.bind(this);
      this.endCallback = this.end.bind(this);

      if (isTouch) {
        document.addEventListener('touchmove', this.moveCallback);
        document.addEventListener('touchend', this.endCallback);
      } else {
        document.addEventListener('mousemove', this.moveCallback);
        document.addEventListener('mouseup', this.endCallback);
      }
    },

    move: function(event) {
      event.preventDefault();

      var val;

      if (this.startX) {
        this.endX = this.mX(event);

        val = this.x + (this.endX - this.startX);

        if (cssTransform) {
          this.el.style[cssTransform] = "translate3d(" + val +"px,0px,0px)";
        } else {
          this.el.style.left = val + 'px';
        }
      }
    },

    end: function (event) {
      if (this.settings.fixed_stops && this.startX !== null && this.endX !== null) {
        this.move_to_closest();
        this.startEl = event.target;

        /* detect tap */
        var moveX = Math.abs(this.startX - this.endX);
        if (this.startEl && moveX <= this.settings.tap_threshold * this.boxW) {
          this.triggerEvent(this.startEl, 'tap');
        }
      }

      this.startX = this.endX = this.startEl = null;

      if (isTouch) {
        document.removeEventListener('touchmove', this.moveCallback);
        document.removeEventListener('touchend', this.endCallback);
      } else {
        document.removeEventListener('mousemove', this.moveCallback);
        document.removeEventListener('mouseup', this.endCallback);
      }
    },

    move_to_closest: function () {
      var moveX = this.startX - this.endX,
          i = Math.round((-1 * this.x) / this.boxW),
          moveThreshold = this.settings.move_threshold * this.boxW;

      if (moveX > moveThreshold && i + 1 < (this.boxes.length)) {
        i++;
      } else if (((-1) * moveX) > moveThreshold && i - 1 >= 0){
        i--;
      }

      this.move_to(i);
    },

    move_to: function(index, fast) {
      var newloc = this.boxW * index;

      this.idx = index;
      this.x = -1 * newloc;

      if (cssTransitionD) {
        this.el.style[cssTransitionD] = (fast) ? "0s" : "0.5s";
      }

      if (cssTransform) {
        this.el.style[cssTransform] = "translate3d(" + this.x + "px,0px,0px)";
      } else {
        this.el.style.left = this.x + 'px';
      }

      var callback = function() {
        this.triggerEvent(this.el, 'scrollstop', {currentIndex: index});
      }

      if (fast) {
        callback.apply(this);
      } else {
        setTimeout(callback.bind(this), 500);
      }
    },

    next: function() {
      if(this.idx + 1 < this.boxes.length){
        this.move_to(this.idx + 1);
      }
    },

    previous: function() {
      if (this.idx - 1 >= 0) {
        this.move_to(this.idx - 1);
      }
    },

    triggerEvent: function(element, type, data) {
      var event,
          eventData;

      if (data) {
        eventData = data
      } else {
        eventData = {};
      }

      if (window.CustomEvent) {
        event = new CustomEvent(type, {detail: eventData});
      } else {
        event = document.createEvent('CustomEvent');
        event.initCustomEvent(type, true, true, eventData);
      }

      element.dispatchEvent(event);
    }
  };

  window.Scroller = Scroller;

})(window);

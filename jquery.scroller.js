(function($) {

    function getsupportedprop(p){
        var root=document.documentElement;
        for (var i=0; i<p.length; i++) {
            if (p[i] in root.style) {
                return p[i];
            }
        }
        return null;
    }
    
    var isTouch = ('ontouchstart' in window ) ? true : false,
        cssTransform = getsupportedprop(['transform', 'MozTransform', 'webkitTransform', 'msTransform', 'OTransform']),
        cssTransitionD = getsupportedprop(['transitionDuration', 'MozTransitionDuration', 'webkitTransitionDuration', 'msTransitionDuration', 'OTransitionDuration']);
    
    var defaults = {
        box_element: '.swipable-box',
        move_treshold: 0.15,
        tap_treshold: 0.05,
        fixed_stops: true
    };
    
    var Scroller = function($element, options) {
        this.$el = $element;
        this.settings = $.extend(defaults, options);
        this.idx = 0;
        this.x = 0;
        this.init();
    };
    
    Scroller.prototype = {
        
        init: function() {
            this.$boxes = this.$el.find(this.settings.box_element);
            this.boxW = this.$boxes.outerWidth();
            this.$el.on((isTouch) ? 'touchstart' : 'mousedown', $.proxy(this.start, this));
        },
        
        mX: function(event) {
            return (isTouch) ? event.originalEvent.targetTouches[0].pageX :  event.pageX;
        },
        
        start: function(event) {
            event.preventDefault();
            this.startEl = event.target;  
            this.startX = this.endX = this.mX(event);
            cssTransitionD && (this.$el.get(0).style[cssTransitionD] = "0s");
            if (isTouch) {
                $(document).on({
                    'touchmove.scroller': $.proxy(this.move, this),
                    'touchend.scroller': $.proxy(this.end, this)
                });
            } else {
                $(document).on({
                    'mousemove.scroller': $.proxy(this.move, this),
                    'mouseup.scroller': $.proxy(this.end, this)
                });
            }
        },
        
        move: function(event) {
            var val;
            event.preventDefault();
            if (this.startX) {
                this.endX = this.mX(event);
                val = this.x + (this.endX - this.startX);
                if (cssTransform) {
                    this.$el.get(0).style[cssTransform] = "translate3d(" + val +"px,0px,0px)";
                } else {
                    this.$el.css({'left': val + 'px'});
                }
            }   
        },
        
        end: function (event) {
            if (this.settings.fixed_stops && this.startX !== null && this.endX !== null) {
                this.move_to_closest();
                this.startEl = event.target;  

                /* detect tap */
                var moveX = Math.abs(this.startX - this.endX);
                if (this.startEl && moveX <= this.settings.tap_treshold * this.boxW) {
                    $(this.startEl).trigger('tap');
                }
            }
            
            this.startX = this.endX = this.startEl = null;
            $(document).off('.scroller');
        },
        
        move_to_closest: function () {
            var moveX = this.startX - this.endX,
                i = Math.round((-1 * this.x) / this.boxW),
                moveTreshold = this.settings.move_treshold * this.boxW;

            if (moveX > moveTreshold && i + 1 < (this.$boxes.length)) {
                i++;
            } else if (((-1) * moveX) > moveTreshold && i - 1 >= 0){
                i--;
            }
            this.move_to(i);
        },
        
        move_to: function(index, fast) {
            var newloc = this.boxW * index;
            this.idx = index;
            this.x = -1 * newloc;
            if (cssTransform && cssTransitionD) {
                this.$el.get(0).style[cssTransitionD] = (fast) ? "0s" : "0.5s";
                this.$el.get(0).style[cssTransform] = "translate3d(" + this.x + "px,0px,0px)";
            } else {
                this.$el.stop();
                (fast) ? this.$el.css({'left': this.x}) : this.$el.animate({'left': this.x}, 800);
            }
            if (!fast) {
                setTimeout($.proxy(function () {
                    this.$el.trigger('scrollstop', [index]);
                }, this), 810);
            }
        },
        
        next: function() {
            if(this.idx + 1 < this.$boxes.length){
                this.move_to(this.idx + 1);
            }
        },

        previous: function() {
            if (this.idx - 1 >= 0) {
                this.move_to(this.idx - 1);
            }
        } 
    };
    
    $.fn.scroller = function (options) {
        if ($(this).data('plugin_scroller')) {
           return $(this).data('plugin_scroller'); 
        } else {
            return this.each(function () {
                if (!$.data(this, 'plugin_scroller')) {
                    $(this).data('plugin_scroller', new Scroller($(this), options));
                }
            });
        }
    };
    
})(jQuery);
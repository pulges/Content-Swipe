$.support.touch = ('ontouchstart' in window );

var scroller = function() {
    this.start_x = null;
    this.end_x = null;
    this.start_offset = null;
    this.scrollable_element = null;
    this.scroller_elemets = null;
    this.x=0;
    this.current_index =0;
    this.fixed_stops = true;
    this.fixed_stop_width = 0;
    this.max_stops = 0;
    this.move_treshold = 0.3;
    this.is_touch = $.support.touch;
    this.tap_treshold = 0;
    this.tap = function(){ };
    this.after_stop =  function(index){  };
    this.do_vertical = false;
    this.start_element = null;
    this.bindLive = false;

    var me = this;

    function isset(v){
        return(typeof v != 'undefined');
    }

    function mouse_x(event){
        return (isset(event.originalEvent.targetTouches)) ? event.originalEvent.targetTouches[0].pageX : event.pageX;
    }

    this.bind_events = function(){
        if(this.is_touch){
            this.bind_touch_events();
        } else {
            this.bind_click_events();
        }
    };

    function start(e){
        e.preventDefault();
        me.start_element = e.target;  
        me.start_x = me.end_x = mouse_x(e);
        if($.browser.webkit){
            me.scrollable_element.css("-webkit-transition-duration", "0s");
        }
    };

    function move(e){
        e.preventDefault();
        if(me.start_x !== null && me.scrollable_element !== null){
            me.end_x = mouse_x(e);
            var val = me.x+(me.end_x-me.start_x);
            if($.browser.webkit){
                me.scrollable_element.css("-webkit-transform", "translate3d("+val +"px,0px,0px)");
            } else {
                me.scrollable_element.css({'left':val+'px'});
            }
        }
    };

    function end(e){
       // e.preventDefault();
        if(me.fixed_stops && me.start_x !== null && me.end_x !== null && me.scrollable_element !== null){
            me.move_to_closest();
            me.start_element = e.target;  

            /* detect tap */
            var move_x = Math.abs(me.start_x - me.end_x);
            if (move_x <= me.tap_treshold * me.fixed_stop_width) {
                if( me.start_element != null ) { me.tap( me.start_element ); }
            }
        }

        me.start_x = me.end_x = me.start_element = null;
    };

    function cancel(e){
        e.preventDefault();
        if(me.fixed_stops && me.start_x !== null && me.end_x !== null && me.scrollable_element !== null){
            me.move_to_closest();
        }
        me.start_x = me.end_x = me.start_element = null;
    };

    this.move_to_closest = function (){
        var move_x = this.start_x-this.end_x,
            curr_i = Math.round((-1*this.x) / this.fixed_stop_width),
            new_i = curr_i,
            newloc = this.fixed_stop_width*(curr_i);

        if(move_x > this.move_treshold*this.fixed_stop_width && curr_i+1 <= (this.max_stops)){
            new_i = curr_i+1;
        }

        if(((-1)*move_x) > this.move_treshold*this.fixed_stop_width && curr_i-1 >= 0){
             new_i = curr_i-1;
        }

        newloc = Math.round(this.fixed_stop_width*(new_i));
        this.current_index = new_i;
        this.x = -1*(newloc);

        if($.browser.webkit){
            this.scrollable_element.css("-webkit-transition-duration", "0.5s");
            this.scrollable_element.css("-webkit-transform", "translate3d("+(-1*newloc) +"px,0px,0px)");
        } else {
            this.scrollable_element.stop().animate({'left': (-1*newloc)},800);
        }

        setTimeout ($.proxy( function () { this.after_stop(new_i); }, this ), 800);

    };

    this.move_to = function(index, nostop){
        var newloc = this.fixed_stop_width*(index);
        if($.browser.webkit){
            this.scrollable_element.css("-webkit-transition-duration", "0.5s");
            this.scrollable_element.css("-webkit-transform", "translate3d("+(-1*newloc) +"px,0px,0px)");
        } else {
            this.scrollable_element.stop().animate({'left': (-1*newloc)},800);
        }
        this.current_index = index;
        this.x = -1*(newloc);
        if(typeof nostop == "undefined") { setTimeout ($.proxy( function () { this.after_stop(index); }, this ), 850); }
    };

    this.next = function(){
        if(this.current_index+1 <= this.max_stops){
            this.move_to(this.current_index+1);
        }
    };

    this.previous = function(){
        if(this.current_index-1 >= 0){
            this.move_to(this.current_index-1);
        }
    };

    /* set image with index to viewport center */
    this.center_to_index = function (index){
        if (this.scrollable_element !== null){
            if(isset(index)){
                this.current_index = index;
            } else {
                index = this.current_index;
            }
            var loc = -1*((index)*this.fixed_stop_width);
            if($.browser.webkit){
                this.scrollable_element.css({
                    "-webkit-transform": "translate3d("+loc+"px,0px,0px)",
                    "-webkit-transition-duration": "0s"
                });
            } else {
                this.scrollable_element.stop().css('left',loc+'px');
            }
            this.x = loc;
        }
    };

    this.bind_touch_events = function(){
        if(this.scroller_elemets !== null){
            if (this.bindLive) {
                this.scroller_elemets.live({
                    'touchstart': start,
                    'touchmove': move,
                    'touchend': end,
                    'touchcancel': cancel
                });
            } else {
                this.scroller_elemets.bind({
                    'touchstart': start,
                    'touchmove': move,
                    'touchend': end,
                    'touchcancel': cancel
                });
            }
        }
    };
        
    this.bind_click_events = function() {
        if(this.scroller_elemets !== null){
            if (this.bindLive) {
                this.scroller_elemets.live({
                    'mousedown': start,
                    'mousemove': move,
                    'mouseup': end,
                    'mouseout': cancel
                });
            } else {
                this.scroller_elemets.bind({
                    'mousedown': start,
                    'mousemove': move,
                    'mouseup': end,
                    'mouseout': cancel
                }); 
            }
        }
    };
};
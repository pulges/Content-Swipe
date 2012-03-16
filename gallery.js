var swipe_gallery = function ($el) {
    this.$el = (typeof $el != "undefined") ? $el : $(document);
    this.link_class= 'swipe_gallery';
    this.numbers_class = 'swipe-gallery-count';
    this.list = [];
    this.index = 0;
    this.category = '';
    this.popup = null;
    this.overlay  = null;
    this.vertical_treshold = 0.99;
    this.horizontal_treshold = 0.80;
    this.working = false;
    this.pic_scroll = null;
    this.overlay_template = '<div class="gray-overlay"></div>';
    this.template =  '<div class="gallery-popup">\
                    <div class="gallery-next"></div>\
                    <div class="gallery-prev"></div>\
                    <div class="gallery-close-big"></div>\
                    <div class="gallery-images-outer-wrap">\
                        <div class="gallery-images-wrap">\
                        </div>\
                    </div>\
                  </div>';
    this.loader_template = '<div class="gallery-loader-wrap">\
                            <div class="gallery-loader">\
                                <div class="bar1"></div>\
                                <div class="bar2"></div>\
                                <div class="bar3"></div>\
                                <div class="bar4"></div>\
                                <div class="bar5"></div>\
                                <div class="bar6"></div>\
                                <div class="bar7"></div>\
                                <div class="bar8"></div>\
                            </div>\
                        </div>';
};

swipe_gallery.prototype = {
    init: function (){
        this.get_lists();
        this.set_links();
        this.set_numbers();
        this.pic_scroll = new scroller();
    },

    isTouchDevice: function () {
        return $.support.touch;
    },

    isAndroid: function () {
        var ua = navigator.userAgent.toLowerCase();
        return ua.indexOf("android") > -1;
    },

    format_template: function (s,inserts) {
        var t = s;
        for (var i  in inserts) {
            var regx = new RegExp('{'+i+'}','gi');
            t = t.replace(regx,inserts[i]);
        }
        return t;
    },

    show: function (src,cat) {
        if (this.isAndroid()) {
            $(document).scrollTop(0).bind('scroll.gallery', function() {
               if ($(document).scrollTop() > 0) { $(document).scrollTop(0); } 
            });
        }
        var me = this;
        if (this.isset(this.list[cat])) {
            this.index = this.get_index(src,cat);
            this.category = cat;

            var overlay = $(this.overlay_template);
            overlay.css('opacity',0);
            $('body').prepend(overlay);
            overlay.fadeTo("normal",0.9);
            this.overlay = overlay;

            var pop = $(this.format_template(this.template,{
                            'title': this.list[cat][this.index].title
                        }));
       
            if ( this.isTouchDevice() ) {
                pop.addClass('isTouch');
                pop.find('.gallery-next').get(0).addEventListener("touchend", function() {
                    me.next();
                }, false );
                pop.find('.gallery-prev').get(0).addEventListener("touchend", function() {
                    me.prev();
                }, false ); 
                $('.gallery-close-big').die('touchend').live("touchend", function() {
                    me.close();
                });
            } else {
                pop.find('.gallery-next').click( function(){
                    me.next();
                });

                pop.find('.gallery-prev').click( function(){
                    me.prev();
                });
                $('.gallery-close-big').die('click.gallery').live("click.gallery", function() {
                    me.close();
                });
        
            }

            $(document).bind('keydown.gallery',$.proxy(function(event){
                switch(event.which){
                    case 39: /* fw */
                        this.next();
                    break;
                    case 37:
                        this.prev();
                    break;
                    case 27:
                        this.close();
                    break;
                }
            },me));
        
            $(document).bind('mousewheel', $.proxy(function(event, delta) {
                var dir = delta > 0 ? 'Up' : 'Down';
                switch(dir){
                    case 'Down':
                        this.next();
                    break;
                    case 'Up':
                        this.prev();
                    break;
                }
                return false;
            },this));
        
            this.pic_scroll.scrollable_element = pop.find( '.gallery-images-wrap' );
            this.pic_scroll.scroller_elemets = pop.find( '.gallery-images-wrap' );

            this.pic_scroll.fixed_stop_width = $(window).width();
            this.pic_scroll.max_stops = this.list[cat].length-1;
            this.pic_scroll.bind_events();
            this.pic_scroll.center_to_index(this.index);
        
            this.pic_scroll.after_stop = $.proxy( function (ind) {
                this.index = ind;
                $.proxy( this.show_hide_btns, this )(); 
            }, this );
            pop.css('opacity',0);
            $('body').prepend(pop);
            pop.fadeTo("normal",1);
            this.popup = pop;
            this.set_top();
            this.loading_show();
            this.show_hide_btns();        
            this.make_all_img_element(this.index, cat, function () {});
        }
    },

    make_all_img_element: function ( index, cat, f ){
        var imgs_wrap     = this.popup.find( '.gallery-images-wrap' ),
            max           = this.list[cat].length-1,
            img_tpl       = $( '<div class="gallery-image-wrap-box">\
                                    <div class="gallery-image-wrap">\
                                          <div class="gallery-image">' + this.loader_template + '</div>\
                                          <div class="gallery-image-bottom">\
                                                <div class="gallery-count"></div>\
                                                <div class="gallery-image-title"></div>\
                                          </div>\
                                    </div>\
                                </div>' ). width( $(window).width() ).css({ 'min-height':'10px' }),
            img_w_c       = img_tpl.clone();
        
        img_w_c.find('.gallery-image-title' ).html(this.list[cat][index].title );
        img_w_c.find('.gallery-count').html((index + 1) + '/' + (max + 1));
        imgs_wrap.width( ( max + 1 ) * $(window).width() ).html(img_w_c);

        this.preload_image( this.list[cat][index].src, $.proxy( function(img_c){
            img_w_c.find('.gallery-loader-wrap').remove();
            img_w_c.find('.gallery-image').append(img_c);
            var s_c = this.get_image_size(img_c);
            $(img_c).height(s_c.height);
            $(img_c).width(s_c.width);
            $(img_c).show();
            img_w_c.find('.gallery-image-wrap').width(s_c.width);
            this.set_top(img_c);
        }, this ));

        if ( index < max ) {
            for ( var incr = index+1; incr <= max; incr++) {
                ( $.proxy( function(inc) {
                    var img_i = img_tpl.clone();
                    img_i.find('.gallery-image-title' ).html( this.list[cat][inc].title );
                    img_i.find('.gallery-count').html((inc + 1) + '/' + (max + 1));
                    imgs_wrap.append(img_i);
                
                    this.preload_image( this.list[cat][inc].src, $.proxy( function(img) {
                        img_i.find('.gallery-loader-wrap').remove();
                        img_i.find('.gallery-image').append(img);
                        var s = this.get_image_size(img);
                        img.height(s.height);
                        img.width(s.width);
                        img.show();
                        img_i.find('.gallery-image-wrap').width(s.width);
                        this.set_top(img);
                    }, this ));
                }, this ))(incr);
            }
        }

        if ( index > 0 ) {
            for ( var decr = index-1; decr >= 0; decr-- ) {
                ( $.proxy( function(dec){
                    var img_d = img_tpl.clone();
                    img_d.find( '.gallery-image-title' ).html( this.list[cat][dec].title );
                    img_d.find('.gallery-count').html((dec + 1) + '/' + (max + 1));
                    imgs_wrap.prepend(img_d);
                
                    this.preload_image( this.list[cat][dec].src, $.proxy( function(img) {
                       img_d.find('.gallery-loader-wrap').remove();
                       img_d.find('.gallery-image').append(img);
                       var s= this.get_image_size(img);
                       img.height(s.height);
                       img.width(s.width);
                       img.show();
                       img_d.find('.gallery-image-wrap').width(s.width);
                       this.set_top(img);
                    }, this ));
                }, this ))(decr);
            }
        }
    
        f();
    },

    close: function () {
        this.popup.remove();
        this.overlay.remove();
        this.popup = null;
        this.overlay = null;
        this.pic_scroll.after_stop = function () { };
        $(document).unbind('keydown.gallery');
        $(document).unbind('mousewheel');
        $(document).unbind('scroll.gallery');
    },

    show_hide_btns: function () {
        var max = this.list[this.category].length -1;
        if(this.index >= max){
            this.popup.find('.gallery-next').hide();
        } else {
            this.popup.find('.gallery-next').show();
        }

        if(this.index <= 0){
            this.popup.find('.gallery-prev').hide();
        } else {
            this.popup.find('.gallery-prev').show();
        }
    },

    next: function () {
        if ( this.index + 1 < this.list[this.category].length ) {
            this.index++;
            this.pic_scroll.next();
            $.proxy( this.show_hide_btns, this )();
        }
    },

    prev: function() {
        if ( this.index - 1 >= 0 ) {
            this.index--;
            this.pic_scroll.previous();
            $.proxy( this.show_hide_btns, this )();
        }
    },

    get_image_size: function (img) {
        var h = img.outerHeight(),
            w = img.outerWidth(),
            ratio = w/h,
            wh = $(window).height(),
            ww = $(window).width(),
            img_box = $(img).parents('.gallery-image-wrap').eq(0),
            title_h = img_box.find('.gallery-image-bottom').outerHeight();
        
        if (title_h > wh * 0.5){
            title_h = wh * 0.5;
        }

        if (wh * this.vertical_treshold < h + title_h ) {
            h = wh * this.vertical_treshold - title_h;
            w = h * ratio;
        }

        if (ww * this.horizontal_treshold < w) {
            w = ww * this.horizontal_treshold;
            h = w/ratio;
        }
    
        if (w < 0) { w = 0; }
        if (h < 0) { h = 0; }

        return { width: w, height: h };
    },

    preload_image: function (img,f) {
        var i = $('<img />').load(function(){
            f($(this));
        }).attr('src',img);
    },

    set_top: function(img) {
        var img_box = $(img).parents('.gallery-image-wrap').eq(0),
            title_hh = img_box.find('.gallery-image-bottom').outerHeight(),
            title_h = ( title_hh > $(window).height() * 0.5 ) ? $(window).height() * 0.5 : title_hh ,
            h = img_box.find('.gallery-image').outerHeight() + title_h,
            wh = $(window).height(),
            top = (wh/2)-(h/2);
        
        if (top<0) { top = 0; }
        img_box.css({
            'margin-top': top + 'px'
        });
    },

    set_img_box_width: function() {
        this.popup.find('.gallery-image-wrap-box').width( $(window).width() );
        this.popup.find('.gallery-images-wrap').width( $(window).width() * this.list[this.category].length );
        this.pic_scroll.fixed_stop_width = $(window).width();
        this.pic_scroll.center_to_index();
    },

    get_index: function (src,cat) {
        var index = 0;
        if (this.isset(this.list[cat])) {
            var cat_list = this.list[cat];
            for (var i in cat_list){
                if ( cat_list[i].src == src ) { index = i; }
            }
        }
        return parseInt(index,10);
    },

    isset: function (v) {
        return(typeof v != 'undefined');
    },

    set_links: function () {
        var me = this;
        $('.'+this.link_class, this.$el).click( function(e) {
            e.preventDefault();
            me.show($(this).attr('href'), $(this).attr('data-category'));
        });
    },

    set_numbers: function () {
        var me = this;
        $('.'+this.numbers_class, this.$el).each(function(){
            var src = $(this).attr('data-src'),
                cat = $(this).attr('data-category'),
                max = me.list[cat].length,
                index = me.get_index(src,cat)+1;
            $(this).html(index+'/'+max);
        });
    },

    get_lists: function () {
        var me = this;
        $('.'+this.link_class, this.$el).each(function () {
            var src = $(this).attr('href'),
                title = $(this).attr('data-title'),
                category = $(this).attr('data-category');

            if(!me.isset(me.list[category])){ me.list[category] = []; }
            me.list[category].push({
                'src': src,
                'title': title
            });
        });
    },


    loading_show: function () {
            var loader = $(this.loader_template);
            this.popup.find('.gallery-image').prepend(loader);
    },

    loading_hide: function () {
            this.popup.find('.gallery-loader-wrap').remove();
    },

    resize: function () {
        if ($('.gallery-popup').length > 0) {
            var img =  this.popup.find('.gallery-image img'),
                me = this;
            img.css({
                'visibility': 'hidden',
                'width':'auto',
                'height': 'auto'
            });
            img.each( function() {
                var s = me.get_image_size( $(this) );
                $(this).css({
                    'width':s.width+'px',
                    'height': s.height+'px',
                    'visibility': 'visible'
                });
                $(this).parents('.gallery-image-wrap').eq(0).width(s.width);
            
                me.set_top( $(this) );
                me.set_img_box_width();
            });
        };
    }
};
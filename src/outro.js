    
    //Expose on window in case we want to instantiate via the SpriteClip constructor instead of via the plugin
    window.SpriteClip = SpriteClip;
    window.SpriteClipEvent = SpriteClipEvent;


    //Register as jQuery plugin
    $.fn["spriteClip"] = function (options) {

        return this.each(function() {
            if ( ! $.data(this, "spriteClip") ) {
                $(this).data("spriteClip", new SpriteClip(this, options));
            }
        });

    };
    
    
} (jQuery));
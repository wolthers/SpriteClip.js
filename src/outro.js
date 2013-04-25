    
    //Register as jQuery plugin
    $.fn["spriteClip"] = function (options) {

        return this.each(function() {
            if ( ! $.data(this, "spriteClip") ) {
                $(this).data("spriteClip", new SpriteClip(this, options));
            }
        });

    };
    
    //Return for AMD but also expose on window in case user want to instantiate "clasically"
    return window.SpriteClip = SpriteClip;
    
}));
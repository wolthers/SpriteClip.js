    
    var SpriteClipEvent = {
        
        /**
            @property {String} ENTER_FRAME - Is dispatched just after the background-position of a clip is updated
        */
        ENTER_FRAME: "enterFrame",
        
        /**
            @property {String} PLAYING - Is dispatched by each clip when it starts to play
                                         A special case is when a playing clip is told to play a different direction - then it will
                                         dispatch SpriteClipEvent.STOPPED followed by SpriteClipEvent.PLAYING
        */
        
        PLAYING: "playing",
        /**
            @property {String} STOPPED - Is dispatched by each clip when it stops playing
                                         A special case is when a playing clip is told to play a different direction - then it will
                                         dispatch SpriteClipEvent.STOPPED followed by SpriteClipEvent.PLAYING
        */
        STOPPED: "stopped"
    }
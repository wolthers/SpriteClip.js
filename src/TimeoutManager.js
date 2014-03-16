    
    /**
        @description    Because we only want 1 timeout for any number of clips that are running at the same framerate,
                        we handle the updating of playing clips in this manager so for any number of clips that are running the same
                        framerate, only 1 timeout will be running.
    */
    var TimeoutManager = (function () {
        
        var _timeouts = {};

        /**
            @public
            @static
            @description    Registers a clip for updating
        */
        function register (clip) {
           
            var frameRate = clip.frameRate;
            
            //If no timeout is running for given framerate, create a new instance of Timeout that will handle updating
            //of all registered clips at that framerate
            if (!(_timeouts[frameRate] instanceof Timeout)) {
                _timeouts[frameRate] = new Timeout(frameRate);
            }
            
            //Register the clip on the timeout
            _timeouts[frameRate].register(clip);
        }


        /**
            @public
            @static
            @description    Unregisters a clip for updating
            @param {SpriteClip} - The clip to unregister
        */
        function unregister (clip) {
            
            var frameRate = clip.frameRate,
                timeout = _timeouts[frameRate];
            
            //If there is a timeout for the given framerate, unregister the clip
            if (timeout instanceof Timeout) {

                timeout.unregister(clip);
                
                //If clip was last for given frameRate, delete the reference
                if (timeout.clips.length < 1) {
                    delete _timeouts[frameRate];
                }
            }

        }
        
        
        //Expose
        return {
            register: register,
            unregister: unregister
        };

    }())
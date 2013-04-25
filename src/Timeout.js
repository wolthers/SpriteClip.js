    
    /**
        @constructor
        @description        Represents a timeout that runs at a given framerate
    */
    function Timeout (frameRate) {
        this._frameRate = frameRate;
        this.clips = [];
    }

    Timeout.prototype = {
        
        clips: undefined,
        _frameRate: undefined,
        _timeout: undefined,


        /**
            @public
            @description    Register a clip for rendering at the instances framerate - start the timeout if clip was the first to be added
        */
        register: function (clip) {
            
            this.clips.push(clip);
            if(this.clips.length === 1) {
                this._start();
            }

        },
        

        /**
            @public
            @description    Unregister a clip for rendering - will stop the timeout if the clip was the last remaining
        */
        unregister: function (clip) {

            var clips = this.clips,
                i = clips.length - 1;
                
            //Looks for the clip and remove it
            for ( ; i >= 0 ; i-- ) {
                if (clips[i] === clip) {
                    clips.splice(i, 1);
                    break;
                }
            }

            //If removed clip was the last, kill the timeout
            if(clips.length === 0) {
                this._stop();
            }
        },


        /**
            @private
            @description    Start a timeout at the instance's framerate
        */
        _start: function () {

            this._timeout = setTimeout($.proxy(this._update, this), 1000 / this._frameRate);
            
        },


        /**
            @private
            @description    Stops a timeout at the instance's framerate
        */
        _stop: function () {

            //Stop and delete the timeout
            clearTimeout(this._timeout);
            delete this._timeout;
        },


        /**
            @private
            @description    The loop that is responsible for updating all registered clips
        */
        _update: function () {
            
            var clips = this.clips,
                clip,
                i = clips.length - 1;

            //Render all the clips
            for ( ; i >= 0 ; i-- ) {

                //Save a refence to the current clip for performance
                clip = clips[i];
                
                //Determine if clip is playing forwards or backwards
                if (clip.currentDirection === 1) {
                    clip.nextFrame();
                }
                else {
                    clip.prevFrame();
                }

                //Check if we should stop at current frame - it's ok to access "private" properties on the clip because the manager is not exposed
                if (clip.currentFrame === clip._frameToStopAt || clip._hasStopAt(clip.currentFrame)) {
                    clip.stop();
                }
            }

            //Repeat
            this._timeout = setTimeout($.proxy(this._update, this), 1000 / this._frameRate);
        }
    }
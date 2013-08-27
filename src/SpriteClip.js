    
    /**
        @constructor
        @param {HTMLElement} elem - The containing DOM node
        @param {Object} [options] - An object literal with properties that will override any default settings of same name
    */
    function SpriteClip (element, options) {
        
        //Make sure we get a proper instance
        if(!(this instanceof SpriteClip)) {
            return new SpriteClip(element, options);
        }
        
        //Save a reference to the dom element and jquery-wrapped dom element
        this.el = element;
        this.$el = $(element);

        //The element HAS an eventdispatcher instead of BEING an eventdispatcher. We use a dummy jQuery element for dispatching
        //custom event because jQuery elements already have a great event system (.on, .off, .triggerHandler, .trigger etc.)
        this.$dispatcher = $("<div />");

        //Merge passed options into default settings (deep merge so references are wiped)
        this._settings = $.extend(true, {}, this._settings, options);

        //Expose totalFrames
        this.totalFrames = this._settings.totalFrames;

        //Expose frameRate - NB: Property is considered READ_ONLY - Changing will not affect the fps at which the clip plays
        this.frameRate = this._settings.frameRate;

        //Expose layout - NB: Property is considered READ_ONLY - Changing layout after instantiation will not affect
        this.layout = this._settings.layout;

        //Use frameWidth and-height options if passed or default to the elements width/height without border
        this.frameWidth = this._settings.frameWidth || this.$el.width() + parseInt(this.$el.css("padding-left"), 10) + parseInt(this.$el.css("padding-right"), 10);
        this.frameHeight = this._settings.frameHeight || this.$el.height() + parseInt(this.$el.css("padding-top"), 10) + parseInt(this.$el.css("padding-bottom"), 10);

        //Validate input to make sure we can work with what we've got
        this._validateInitialInput();

        //Get the initial frames array
        this._frames = this._getFramePositions();
    };

    /**
        @static
        @description    Autocomplete for events.
    */
    SpriteClip.Event = {
        
        /**
            @property {String} ENTER_FRAME - Is dispatched just after the background-position of a clip is updated
        */
        ENTER_FRAME: "enterFrame",
        
        /**
            @property {String} PLAYING - Is dispatched by each clip when it starts to play
                                         A special case is when a playing clip is told to play a different direction - then it will
                                         dispatch SpriteClip.Event.STOPPED followed by SpriteClip.Event.PLAYING
        */
        
        PLAYING: "playing",
        /**
            @property {String} STOPPED - Is dispatched by each clip when it stops playing
                                         A special case is when a playing clip is told to play a different direction - then it will
                                         dispatch SpriteClip.Event.STOPPED followed by SpriteClip.Event.PLAYING
        */
        STOPPED: "stopped"
    };

    SpriteClip.prototype = {
        
        //Public - init stuff we are going to need as undefined for performance
        el: undefined,
        $el: undefined,
        $dispatcher: undefined,
        totalFrames: undefined,
        frameRate: undefined,
        currentFrame: 1,
        currentDirection: 1,
        isPlaying: false,
        layout: undefined,

        //Private
        _timeout: undefined,
        _frameToStopAt: undefined,
        _frames: [],
        
        /*
            
        */
        _settings: {
            /**
                @property {Integer} totalFrames - Required - The number of frames the sprite and thereby the animation contains. All frames must be equally spaced in the sprite.
            */
            totalFrames: undefined,
            
            /**
                @property {Integer} [frameRate=30] - The framerate that the animation runs at - NB: cannot be altered after instantiation
            */
            frameRate: 30,
            
            /**
                @property {Number[]} - An array of frames to stop at - can be changed after instantiation with the stops method
            */
            stops: [],
            
            /**
                @property {String} [layout="horizontal"] - Must be either "horizontal" or "vertical" depending how the sprite sheet is laid out - Defaults to "horizontal"
            */
            layout: "horizontal",
            
            /**
                @property {Number} [frameWidth={Elements width}] - Optional - The width of each frame - Defaults to the width of the container plus padding minus border
            */
            frameWidth: undefined,
            
            /**
                @property {Number} [frameHeight={Elements height}] - Optional - The height of each frame- Defaults to the width of the container plus padding minus border
            */
            frameHeight: undefined
            
        },
        
        
        /**
            @public
            @description                    Setter for the stops array - overrides this._settings.stops if passed
            @param {Array} [stops]          Optional - An array of frames to stop at
            @returns                        Returns a read only clone of _settings.stops
        */
        stops: function (stops) {

            if (typeof stops !== "undefined") {

                //Make sure that argument stops is an array if passed
                if (stops instanceof Array) {
                    this._settings.stops = stops;
                }
                else {
                    throw new Error("TypeError: If provided, argument \"stops\" must be an array.");
                }
            }
            return $.extend(true, [], this._stops);
        },


        /**
            @public
            @description                    Jumps to a given frame and plays from there
            @param {Number} frame           The frame to jump to
        */
        gotoAndPlay: function (frame) {

            this._validateFrameInput(frame);
            this.stop();
            this.currentFrame = frame;
            this._showFrame(frame);
            this.play();
        },


        /**
            @public
            @description                    Jumps to a given frame and stops
            @param {Number} frame           The frame to jump to
        */
        gotoAndStop: function (frame) {

            this._validateFrameInput(frame);
            this.currentFrame = frame;
            this._showFrame(frame);
            this.stop();
        },
        

        /**
            @public
            @description                    Jumps to a given frame and rewinds from there
            @param {Number} frame           The frame to jump to
        */
        gotoAndRewind: function (frame) {

            this._validateFrameInput(frame);
            this.stop();
            this.currentFrame = frame;
            this._showFrame(frame);
            this.rewind();
        },
        

        /**
            @public
            @description                    Plays to a given frame and stops
            @param {Number} frame           The frame to stop at
        */
        playtoAndStop: function (frame) {

            this._validateFrameInput(frame);
            this.play(frame, 1);
        },
        
        
        /**
            @public
            @description                    Rewinds to a given frame and stops
            @param {Number} frame           The frame to stop at
        */
        rewindtoAndStop: function (frame) {

            this._validateFrameInput(frame);
            this.play(frame, -1);
        },

        
        /**
            @public
            @description                    Shows next frame
        */
        nextFrame: function () {
            
            if (this.currentFrame < this.totalFrames) {
                this.currentFrame += 1;
            } else {
                this.currentFrame = 1;
            }
            this._showFrame(this.currentFrame);
        },
        
        
        /**
            @public
            @description                    Shows previous frame
        */
        prevFrame: function () {
            
            if (this.currentFrame > 1) {
                this.currentFrame -= 1;
            } else {
                this.currentFrame = this.totalFrames;
            }
            this._showFrame(this.currentFrame);
        },

        
        /**
            @public
            @description                            Plays or rewinds the clip
            @param {Number} [frameToStopAt=None]    Optional - The frame the clip should stop at
            @param {Number} [direction=1]           Optional - The direction the clip should play. Defaults to 1 (forward) if anything but -1 is passed
        */
        play: function (frameToStopAt, direction) {

            //Default to 1
            direction = direction === -1 ? -1 : 1;

            //Cancel any running timeouts if we have changed direction
            if (this.isPlaying && direction !== this.currentDirection) {
                this.stop(); //Hammertime!
            }

            //If eg. playToAndStop or rewindToAndStop was called, we need to know at what frame to stop at
            this._frameToStopAt = frameToStopAt;
            this.currentDirection = direction;
            
            if (!this.isPlaying) {
                TimeoutManager.register(this);
                this.isPlaying = true;

                //Dispatch SpriteClipEvent.PLAYING and send along the instance in the payload
                this.$dispatcher.triggerHandler(SpriteClip.Event.PLAYING, this);
            }

        },
        
        
        /**
            @public
            @description                    Plays the animation backwards
        */
        rewind: function () {

            this.play(undefined, -1);
        },
        
        
        /**
            @public
            @description                    Stops the clip by unregistering the it in the TimeoutManager
        */
        stop: function () {

            if (this.isPlaying) {
                TimeoutManager.unregister(this);
                this.isPlaying = false;

                //Dispatch SpriteClipEvent.STOPPED and send along the instance in the payload
                this.$dispatcher.triggerHandler(SpriteClip.Event.STOPPED, this);
            }

        },
        
        
        /**
            @private
            @description                    Updates the UI and dispatches ENTER_FRAME
        */
        _showFrame: function (frame) {
            
            this.$el.css("background-position", this._frames[frame - 1]);

            //Dispatch SpriteClipEvent.ENTER_FRAME and send along the instance in the payload
            this.$dispatcher.triggerHandler(SpriteClip.Event.ENTER_FRAME, this);
        },
        

        /**
            @private
            @helper
            @description                    Check if there is a stop at the current frame
            @param  {Number} frame          Required - the frame to check
            @returns                        Returns true if there is a stop
                                            Returns false if there is not a stop
        */
        _hasStopAt: function (frame) {
            
            var i = this._settings.stops.length - 1;
            for ( ; i >= 0 ; --i) {

                if (this._settings.stops[i] === frame) {
                    return true;
                }
            }
            return false;
        },


        /**
            @private
            @helper
            @description            Gets a cached string array of the frames corresponding background-positions
            @returns {String[]}     Returns an array of strings, where each item corresponds to the background-position of the frame
        */
        _getFramePositions: function () {

            var frames = [],
                currentPositions = (this.$el.css("background-position") || this.$el.css("backgroundPositionX") + " " + this.$el.css("backgroundPositionY")).split(" "),
                i = 0, 
                len = this.totalFrames, 
                x, 
                y;

            if (this._settings.layout === "horizontal") {

                y = currentPositions[1];

                for (; i < len; i++) {
                    x = -i * this.frameWidth + "px";
                    frames.push(x + " " + y);
                }
            }
            else {

                x = currentPositions[0];

                for (; i < len; i++) {
                    y = -i * this.frameHeight + "px";
                    frames.push(x + " " + y);
                }
            }
            
            return frames;
        },


        /**
            @private
            @helper
            @description                    Validates that the passed frame is in bounds
        */
        _validateFrameInput: function (frame) {
            
            if (typeof frame !== "number") {
                throw new Error("Argument Error: argument \"frame\" must be a number.");
            }
            if( frame < 1 || frame > this.totalFrames ) {
                throw new Error("Argument Error: argument \"frame\" is out of bounds.");
            }
        },


        /**
            @private
            @helper
            @description                    Makes sure we can work with what we have
        */
        _validateInitialInput: function () {

            if (this._settings.layout !== "vertical" && this._settings.layout !== "horizontal") {
                throw new Error("options property \"layout\" must be either \"horizontal\" or \"vertical\".");
            }
            if (isNaN(parseInt(this.frameRate, 10))) {
                throw new Error("options property \"frameRate\" must be parsable as an integer.");
            }
            if (typeof this.totalFrames !== "number") {
                throw new Error("options proberty \"totalFrames\" must be a number");
            }
            if (this._settings.layout === "horizontal" && isNaN(this.frameWidth)) {
                throw new Error("this.frameWidth is not a number. Make sure this.$el.width() is a Number when we instantiate or pass an explicit value in options.");
            }
            else if (this._settings.layout === "vertical" && isNaN(this.frameHeight)) {
                throw new Error("this.frameHeight is not a number. Make sure this.$el.height() is a Number when we instantiate or pass an explicit value in options.");
            }
        }
    }

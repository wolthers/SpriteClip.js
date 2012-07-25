/**!
    Copyright (C) 2012 Michael Wolthers Nielsen, http://moredots.dk

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
*/

/**!
    @author - Michael Wolthers Nielsen @MichaelWolthers http://moredots.dk
    @contributors - Kristoffer Kjelde @stofferk munkey.dk
    @description - SpriteClip jQuery plugin that provides an object with an interface similar to the ActionScript 3.0 MovieClip
    @version - 1.01

    1.01
        - Changed rewindToAndStop method name to rewindtoAndStop for case consistency (like as3 gotoAndStop)
        - Changed playToAndStop method name to playtoAndStop for case consistency (like as3 gotoAndStop)
        - Added a public read only property for layout - either "horizontal" or "vertical" that matches what was passed in via settings
        - Added event types PLAY and STOP that are dispatched when play() and stop() are called

    @TODO:
    - Fix ENTER_FRAME
*/
(function ($) {
    
    "use strict";

    var SpriteClipEvent = {
        /**
            @property {String} ENTER_FRAME - Is dispatched whenevery a new frame is shown
        */
        ENTER_FRAME: "enterFrame",
        /**
            @property {String} PLAY - Is dispatched whenever play is called
        */
        PLAY: "play",
        /**
            @property {String} STOP - Is dispatched whenever stop is called
        */
        STOP: "stop"
    };


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
            //Trigger all eventhandlers bound to the PLAY event
            clip.$dispatcher.triggerHandler(SpriteClipEvent.PLAY);
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
                    clip.$dispatcher.triggerHandler(SpriteClipEvent.STOP);
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
            @description    Start a timeout at the instance's framerate - will only start if no timeout is currently running
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

                clip = clips[i];
                
                //Determine if we play or rewind - it's ok to access private properties on the clip because the manager is not exposed
                if (clip._currentDirection === 1) {
                    clip.nextFrame();
                }
                else {
                    clip.prevFrame();
                }

                //Check if we should stop at current frame - it's ok to access private properties on the clip because the manager is not exposed
                if (clip.currentFrame === clip._frameToStopAt || clip._frameHasStop(clip.currentFrame)) {
                    clip.stop();
                }
            }

            //Repeat
            this._timeout = setTimeout($.proxy(this._update, this), 1000 / this._frameRate);
        }
        
    };


    /**
        @description    Because we only want 1 timeout for any number of clips that are running at the same framerate,
                        we handle the updating of playing clips in this manager so for any number of clips that are running the same
                        framerate, only 1 timeout will be running.
    */
    var TimeoutManager = (function () {
        
        var _timeouts = {};

        /**
            @public
            @description    Registers a clip for updating
        */
        function register (clip) {
           
            var frameRate = clip.frameRate;
            
            //If no timeout is running for given framerate, add it
            if (!(_timeouts[frameRate] instanceof Timeout)) {
                _timeouts[frameRate] = new Timeout(frameRate);
            }
            
            //Register the clip on the instance
            _timeouts[frameRate].register(clip);
        }


        /**
            @public
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

    }());




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
        this.elem = element;
        this.$elem = $(element);

        //The element HAS an eventdispatcher instead of BEING an eventdispatcher. We use a dummy jQuery elemt for this because
        //jQuery elements already have a great event system (.bind, .on, .off, .triggerHandler, .trigger etc.)
        this.$dispatcher = $("<div />");

        //Merge passed options into default settings (deep merge so references are wiped)
        this._settings = $.extend(true, {}, this._settings, options);

        //Expose totalFrames and frameRate - note that these will be READY_ONLY and changing them
        //will not affect the framerate at which the instance plays
        this.totalFrames = this._settings.totalFrames;
        this.frameRate = this._settings.frameRate;

        //Use frameWidth and-height options if passed or default to the elements width/height
        this.frameWidth = this._settings.frameWidth || this.$elem.width() + parseInt(this.$elem.css("padding-left"), 10) + parseInt(this.$elem.css("padding-right"), 10);
        this.frameHeight = this._settings.frameHeight || this.$elem.height() + parseInt(this.$elem.css("padding-top"), 10) + parseInt(this.$elem.css("padding-bottom"), 10);

        //Validate input to make sure we can work with what we've got
        this._validateInitialInput();

    }
    
    SpriteClip.prototype = {
        
        //Public - init stuff we are going to need as undefined for performance
        elem: undefined,
        $elem: undefined,
        $dispatcher: undefined,
        totalFrames: undefined,
        frameRate: undefined,
        currentFrame: 1,
        isPlaying: false,
        
        //Private
        _timeout: undefined,
        _currentDirection: undefined,
        _frameToStopAt: undefined,


        _settings: {
            /**
                @property {Integer} totalFrames - Required - The number of frames that sprite and thereby the animation contains. All frames should be equally spaced in the sprite.
            */
            totalFrames: undefined,
            
            /**
                @property {Integer} [frameRate=30] - The FPS that the animation runs at - cannot be altered after instantiation
            */
            frameRate: 30,
            
            /**
                @property {Number[]} - An array of frames to stop at - can be changed after instantiation with the stops method
            */
            stops: [],
            
            /**
                @property {String} [layout="horizontal"] - Must be either horizontal or vertical depending how the sprite sheet is laid out - Defaults to horizontal
            */
            layout: "horizontal",
            
            /**
                @property {Number} [frameWidth={Elements width}] - Optional - If frameWidth isn't passed, the animation will default to the width of the container plus padding minus border
            */
            frameWidth: undefined,
            
            /**
                @property {Number} [frameHeight={Elements height}] - Optional - If frameWidth isn't passed, the animation will default to the width of the container plus padding minus border
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
            @description
            @param {Number} [frameToStopAt]        Optional - The frame the animation should stop at
            @param {Number} [direction=1]   Optional - The direction the animation should play. Defaults to 1 (forward) if anything but -1 is passed
        */
        play: function (frameToStopAt, direction) {
            

if (this.isPlaying && frameToStopAt !== this._frameToStopAt && direction !== this._currentDirection) {
                //Cancel any running timeouts
                
                this.stop(); //Hammertime!
}

                //If ie. playToAndStop or rewindToAndStop was called, we need to know at what frame to stop at
                this._frameToStopAt = frameToStopAt;
                this._currentDirection = direction === -1 ? -1 : 1;
if (!this.isPlaying) {
                TimeoutManager.register(this);

                this.isPlaying = true;
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
            @description                    Stops the animation unregistering the clip in the TimeoutManager
        */
        stop: function () {

            if (this.isPlaying === true) {
                TimeoutManager.unregister(this);
                this.isPlaying = false;
            }

        },
        

        
        /**
            @private
            @description                    Handles the background-position shift centrally
        */
        _showFrame: function (frame) {
            
            //Calculate how far we need to move
            var distanceToMove,
                currentPositions = (this.$elem.css("background-position") || this.$elem.css("backgroundPositionX") + " " + this.$elem.css("backgroundPositionY")).split(" "),
                x,
                y;

            if (this._settings.layout === "horizontal") {
                distanceToMove = (frame - 1) * this.frameWidth;
                x = -distanceToMove;
                y = parseInt(currentPositions[1], 10);
            }
            else {
                distanceToMove = (frame - 1) * this.frameHeight;
                x = parseInt(currentPositions[0], 10);
                y = -distanceToMove;
            }

            //Set the new background position on the element
            this.$elem.css("background-position", x + "px" + " " + y + "px");

            //Trigger all eventhandlers bound to the ENTER_FRAME event
            this.$dispatcher.triggerHandler(SpriteClipEvent.ENTER_FRAME);
        },
        

       


        
        /**
            @private
            @helper
            @description                    Check if there is a stop at the current frame
            @param  {Number} frame          Required - the frame to check
            @returns                        Returns true if there is a stop
                                            Returns false if there is not a stop
        */
        _frameHasStop: function (frame) {
            
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
                throw new Error("this.frameWidth is not a number. Make sure this.$elem.width() is a Number when we instantiate or pass an explicit value in options.");
            }
            else if (this._settings.layout === "vertical" && isNaN(this.frameHeight)) {
                throw new Error("this.frameHeight is not a number. Make sure this.$elem.height() is a Number when we instantiate or pass an explicit value in options.");
            }
        }

    };
    
    
    
    //Expose on window in case we want to instantiate "normally" instead of via the plugin
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
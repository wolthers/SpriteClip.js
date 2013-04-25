/**
    Changelog:
    1.05
        - Now, when events are dispatched, a reference to the instance is passed along
    1.04
        - Fixed demos so they work with the new project architecture - also updated to jQuery 1.9.1
        - Added AMD factory
        - Moved SpriteClipEvent so it is no longer global. It is now a static member of SpriteClip and is accessed via SpriteClip.Event.ENTER_FRAME, SpriteClip.Event.PLAYING etc. 
        - Removed docs as the output was ugly - will replace with another doc library once researched
    1.03
        - Split the project into seperate classes
        - Added grunt to build the project - To begin with uglification, concatenation and jsdoc3 - see docs folder for documentation
    1.02
        - Renamed SpriteClipEvent.PLAY and SpriteClipEvent.STOP to .PLAYING and .STOPPED and made sure that they are dispatched like so:
          STOPPED: when a clip is stopped completely or when a playing clip is told to play in a different direction
          PLAYING: when a clip that isnt playing starts to play - including when a playing clip is told to play in a different direction
        - Rewrote a lot of comments

    1.01
        - Changed rewindToAndStop method name to rewindtoAndStop for case consistency (like as3 gotoAndStop)
        - Changed playToAndStop method name to playtoAndStop for case consistency (like as3 gotoAndStop)
        - Added a public read only property for layout - either "horizontal" or "vertical" that matches what was passed in via settings
        - Added event types PLAY and STOP that are dispatched when play() and stop() are called
*/
(function (factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["jquery"], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    
    //Force EC5 strict mode
    "use strict"
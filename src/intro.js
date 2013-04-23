/**
    Changelog:
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
(function ($) {
    
    "use strict"
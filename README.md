spriteclip.js
====

Frame-by-frame animations in JS made easy by using an interface similar to AS3's MovieClip


Project home page: http://moredots.dk/projects/spriteclip/


Introduction:
-------------
spriteclip.js is a jQuery plugin that makes it easy to make snazzy frame-by-frame animations of an image sprite by emulating the functionality of the MovieClip class in ActionScript 3.0. 

Once instantiated, you get access to an instance with familiar methods and properties like:

	clip.play();
	clip.stop();
	clip.gotoAndPlay();
	clip.gotoAndStop();
	clip.nextFrame();
	clip.prevFrame();

	clip.currentFrame
	clip.isPlaying
	clip.frameRate


.. Plus extra methods like:

	clip.playtoAndStop();
	clip.gotoAndRewind();
	clip.rewind();
	clip.rewindtoAndStop();


Instantiation:
-----------
	var options = {
	        //Required - {Number}
	        totalFrames: 6,
	 
	        //Optional - {Number} - Default = 30 - The frames per second that the animation plays - Cannot be changed after instantiation
	        frameRate: 2,
	 
	        //Optional - {Number} - Default = {elements width + padding without border} - The width of each frame.
	        frameWidth: 35,
	 
	        //Optional - {Number} - Default = {elements height + padding without border} - The height of each frame
	        frameHeight: 100,
	 
	        //Optional - {String} - Default = "horizontal" - Must be either "horizontal" or "vertical" - Determines which way the sprite is laid out
	        layout: "horizontal",
	 
	        //Optional - {Array}  - Default = [] - An array of frame numbers to stop at - can be set after instantiation with the stops() method
	        stops: []
	     },
	     bernard;
	 
	//Call the plugin
	$("#bernard").spriteClip(options);
	bernard = $("#bernard").data("spriteClip");
	 
	//Equivalent to:
	bernard = new SpriteClip(document.getElementById("bernard"), options);
spriteclip.js
====

Frame-by-frame animations in JS made easy by using an interface similar to AS3's MovieClip



Introduction:
-------------
spriteclip.js is a jQuery plugin that makes it easy to make snazzy frame-by-frame animations of an image sprite by emulating the functionality of the MovieClip class in ActionScript 3.0. 

Once instantiated, you get access to an instance with familiar methods, properties and events like:

	clip.play();
	clip.stop();
	clip.gotoAndPlay();
	clip.gotoAndStop();
	clip.nextFrame();
	clip.prevFrame();

	clip.currentFrame
	clip.totalFrames
	clip.frameRate

	SpriteClipEvent.ENTER_FRAME

.. Plus extra sugar like:
	
	clip.playtoAndStop();
	clip.gotoAndRewind();
	clip.rewind();
	clip.rewindtoAndStop();

	clip.isPlaying

	SpriteClipEvent.PLAYING
	SpriteClipEvent.STOPPED

Instantiation:
-----------
The Spriteclip object is exposed as a jQuery plugin but all logic is kept in a classic object. This means that you can choose to instantiate either via the plugin or via the SpriteClip constructor. 

If you instantiate via the plugin, the instance is stored in the jQuery elements data-spriteClip attribute so it can easily be retrieved through the DOM.

	var options = {
	        totalFrames: 6, 		//Required - the number of frames in the sprite
	        frameRate: 30, 			//Optional - the framerate the clip should play at
	        frameWidth: 35, 		//Optional - width of each frame - defaults to elements width + padding - border
	        frameHeight: 100, 		//Optional - height of each frame - defaults to elements height + padding - border
	        layout: "horizontal", 	//Optional - the layout of the sprite
	        stops: [] 				//Optional - an array of frames to stop at
	     },
	     clip;
	 
	//Call the plugin
	$("#domElement").spriteClip(options);
	clip = $("#domElement").data("spriteClip");
	 
	//Equivalent to:
	clip = new SpriteClip(document.getElementById("bernard"), options);


Events:
You subscribe to the instance's events through it's $dispatcher property. 
	
	ENTER_FRAME:
	clip.$dispatcher.on(SpriteClipEvent.ENTER_FRAME, function() {
		//Stuff that should be done every time a new frame is shown
	}):

	PLAYING:
	clip.$dispatcher.on(SpriteClipEvent.PLAYING, function() {
		//Stuff that should be done when the clip starts playing
	}):	

	STOPPED:
	clip.$dispatcher.on(SpriteClipEvent.STOPPEd, function() {
		//Stuff that should be done when the clip stops playing
	}):	

For a more detailed demo, check out <a href="moredots.dk/projects/spriteclip/demos/apidemo.html" target="_blank">moredots.dk/projects/spriteclip/demos/apidemo.html</a>



Performance:
-----------
- Only 1 timeout pr. frameRate:
When a clip is played/stopped, it is registered/unregistered in a central timeout manager, which is responsible for updating all playing clips. This means that if we have 5 clips playing at 20 fps, and 5 at 30 fps, only 2 timeouts are running. One every 20th of a second and one every 30th.
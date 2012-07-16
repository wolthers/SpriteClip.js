spriteclip.js
====

Frame-by-frame animations in JS made easy by using an interface similar to AS3's MovieClip



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
The Spriteclip object is exposed as a jQuery plugin but all logic is kept in a classic object. This means that you can choose to instantiate either via the plugin or via the SpriteClip constructor. 

If you instantiate via the plugin, the instance is kept in the jQuery elements data-spriteClip attribute.

	var options = {
	        totalFrames: 6, 		//Required - the number of frames in the sprite
	        frameRate: 30, 			//Optional - the framerate the clip should play at
	        frameWidth: 35, 		//Optional - width of each frame - defaults to elements width, padding and border
	        frameHeight: 100, 		//Optional - height of each frame - defaults to elements height, padding and border
	        layout: "horizontal", 	//Optional - the layout of the sprite
	        stops: [] 				//Optional - an array of frames to stop at
	     },
	     clip;
	 
	//Call the plugin
	$("#domElement").spriteClip(options);
	clip = $("#domElement").data("spriteClip");
	 
	//Equivalent to:
	clip = new SpriteClip(document.getElementById("bernard"), options);

Performance:
-----------
- Only 1 timeout pr. frameRate:
When a clip is played/stopped, it is registered/unregistered in a central timeout manager, which is responsible for updating all playing clips
This means that if we have 5 clips playing at 20 fps, and 5 at 30 fps, only 2 timeouts are running. One every 20th of a second and one every 30th.
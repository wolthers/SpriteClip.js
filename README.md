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
	        totalFrames: 6, 		//Required
	        frameRate: 2, 			//Optional
	        frameWidth: 35, 		//Optional
	        frameHeight: 100, 		//Optional
	        layout: "horizontal", 	//Optional
	        stops: [] 				//Optional
	     },
	     clip;
	 
	//Call the plugin
	$("#domElement").spriteClip(options);
	clip = $("#bernard").data("spriteClip");
	 
	//Equivalent to:
	clip = new SpriteClip(document.getElementById("bernard"), options);
SpriteClip.js
====

Frame-by-frame animations in JS made easy by using an interface similar to AS3's MovieClip.


Overview:
-------------
SpriteClip.js is a jQuery plugin that makes it easy to make snazzy frame-by-frame animations like <a href="http://moredots.dk/projects/spriteclip/demos/demo1.html" target="_blank">this</a> by emulating the functionality of the MovieClip class in ActionScript 3.0.

It works by animating the background-image property of a dom node where the "frames" are spaced out equally. Eg. if the sprite is laid out horizontally and each frame is 20px wide, frame 1 will be at background-position: 0 0 and frame 2 will be at background-position: -20px 0

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

	SpriteClip.Event.ENTER_FRAME (dispatched through clip.$dispatcher)

.. Plus extra sugar like:
	
	clip.playtoAndStop();
	clip.gotoAndRewind();
	clip.rewind();
	clip.rewindtoAndStop();

	clip.isPlaying

	SpriteClip.Event.PLAYING (dispatched through clip.$dispatcher)
	SpriteClip.Event.STOPPED (dispatched through clip.$dispatcher)


Background:
-------------
The project was inspired by the neat rollovers on <a href="http://rallyinteractive.com" target="_blank">http://rallyinteractive.com</a>, that prompted me to think that the reason that you almost never see these awesome yet relatively simple animations that were so common in the flash days, must be that the tools for creating them in Javascript were none existant.

I thought that a MovieClip class in Javascript would be a great base as that is the very first class you learn to work with in Flash and hence the learning curve would be flat for as many developers as possible. That is also why I have aimed to make an interface that is as consistent with the flash interface as possible and only added a few commonly used methods and properties like rewind() and isPlaying. Further additions can then easily be made in an class that inherits from SpriteClip.


Instantiation:
-----------
The SpriteClip object is exposed as a jQuery plugin but all logic is kept in a classic object. This means that you can choose to instantiate either via the plugin or via the SpriteClip constructor. 

If you instantiate via the plugin, the instance is stored in the jQuery elements data-spriteClip attribute so that later, it can easily be retrieved through the DOM. Note the lowercase s.

	var options = {
	        totalFrames: 6, 		//Required - the number of frames in the sprite
	        frameRate: 30, 			//Optional - the framerate the clip should play at
	        frameWidth: 35, 		//Optional - width of each frame - defaults to elements width + padding - border
	        frameHeight: 100, 		//Optional - height of each frame - defaults to elements height + padding - border
	        layout: "horizontal", 	//Optional - the layout of the sprite - "horizontal" or "vertical"
	        stops: [] 				//Optional - an array of frames to always stop at - can be set with the stops method
	     },
	     clip;
	 
	//Call the plugin
	$("#domElement").spriteClip(options);
	clip = $("#domElement").data("spriteClip");
	 
	//Equivalent to:
	clip = new SpriteClip(document.getElementById("domElement"), options);


Events:
-----------
Each instance HAS an eventdispatcher attached instead of BEING an eventdispatcher. This means that you subscribe to the instance's events through it's $dispatcher property. The $dispatcher is nothing but a dummy jQuery element that isn't attached to the DOM, which we use because jQuery has a great event system built in with methods like .on(), .off(), .trigger() and .triggerHandler() 
	
	//Events that can be subscribed to are ENTER_FRAME, STOPPED and PLAYING
	clip.$dispatcher.on(SpriteClip.Event.ENTER_FRAME, function(e, clip) {
		//Stuff that should be done every time a new frame is shown
	});



Demos:
-----------
- Detailed API demo: <a href="http://moredots.dk/projects/spriteclip/demos/apidemo.html" target="_blank">moredots.dk/projects/spriteclip/demos/apidemo.html</a>
- The rallyinteractive rollovers implemented in spriteclip.js: <a href="http://moredots.dk/projects/spriteclip/demos/demo1.html" target="_blank">moredots.dk/projects/spriteclip/demos/demo1.html</a>



Performance:
-----------
- Only 1 timeout pr. frameRate:
When a clip is played/stopped, it is registered/unregistered in a central timeout manager, which is responsible for updating all playing clips. This means that if we have 5 clips playing at 20 fps, and 5 at 30 fps, only 2 timeouts are running. One every 20th of a second and one every 30th.
- Cached frame positions:
In 1.06, all background-positions are cached on instantiation, so we don't need to calculate before entering a new frame. This dramatically increases performance. Inspired by Jeremy Petrequin's jsMovieclip



Support:
-----------
IE6+ and all modern browsers.
jQuery 1.6+


Building:
-----------
First, clone a copy of the SpriteClip git repo by running:

	git clone git://github.com/wolthers/SpriteClip.js.git

Install the grunt-cli package so that you will have the correct version of grunt available from any project that needs it. This should be done as a global install:

	npm install -g grunt-cli

Enter the SpriteClip directory and install the Node dependencies, this time without specifying a global install:

	cd {SpriteClip directory} && npm install

Make sure you have grunt installed by testing:

	grunt -version

Then, to get a complete, uglifyed, concatenated version of SpriteClip, type the following:

	grunt

The concatenated version of SpriteClip will be put in the dist/ subdirectory, along with the uglifyed version.

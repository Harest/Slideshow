# Slideshow
This is a slideshow in HTML / JS which shows random images / videos of an existing files list.  
[Online version available here](http://www.i-volve.net/lab/slideshow/).

## Current version features :  
* Random slideshow of HTML5 videos webm / mp4 / ogg and any images, including gif ;  
* Keyboards controls (prev, next, pause, increasing/decreasing timer) ;  

## Improvements ideas :  
* UI for custom variables, and maybe more user-ajustable stuff (max-height, min-width, bottom or top, etc.) ;

## Why ?  
I didn't find any soft able to display pictures including gif properly in a slideshow. XnView for instance isn't able to loop gif and will skip to the next file at the end of the animation.

## How it works ?  
Like i said, it's in html/js. Details and editable variables can be found in the js/main.js file. I'll copy details here too :  
> HOW IT WORKS  
	You need a .txt with one filepath you want to see / line.
	It can be any image format including gif, and any video format supported by html5.
	In Windows for instance, you can use something like this on a directory :
	dir "D:\Documents\Images" /A-D /S /b /-p /o:gen >List_Files.txt  
	
> NB : If you're using the script locally via file://, you may need to [follow these advices](http://kb.mozillazine.org/Links_to_local_pages_do_not_work).

> CONTROLS  
	Left arrow : Previous file  
	Right arrow : Next file (random if not already existing)  
	Up/Down arrow : Increase/Decrease the timer  
	Spacebar : Pause (be careful to unfocus the "Browse" button first)
	Echap : Display/Hide the config window

*Note the code is probably not great. I didn't code for a while.*

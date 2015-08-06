/* HOW IT WORKS
	First, since there's issues running this without server (via file:// for instance),
	install one with WampServer or anything like that. You'll need to
	configure the DocumentRoot parameter in httpd.conf (Apache config file) 
	in a way your server will be able to access the files.
	
	Secondly, you need a .txt with one filepath you want to see / line.
	It can be any image format including gif, and any video format supported by html5.
	In Windows for instance, you can use something like this on a directory :
	dir "D:\Documents\Images" /A-D /S /b /-p /o:gen >List_Files.txt

CONTROLS
	Left arrow : Previous file
	Right arrow : Next file (random if not already existing)
	Up/Down arrow : Increase/Decrease the timer
	Spacebar : Pause (be careful to unfocus the "Browse" button first)
*/
var arrF = new Array(); // Files list
var arrFS = new Array(); // Files displayed
var nextF; // Var used to display the next file or not with Interval
var nF = 0; // Current number of the file displayed ; Used to go back in the history
var precFunc; // Precedent function to prevent too much reset of setInterval
var maxHeight = window.innerHeight-30; // Maximum height an image should be to avoid overflow
// ---------- VARIABLES BELOW CAN BE MODIFIED
var extE = "txt,zip,js,css,db,htm,swf,wmv,avi,mpg,mpeg,mkv,flv,nfo,mp3,wav"; // Extensions excluded
var extImg = "jpg,jpeg,gif,png,bmp"; // Images Extensions
var extVid = "mp4,webm,ogg"; // Video Extensions
var timer = 5000; // Set default timer to 5 seconds
var pause = false; // Pause disabled by default
var rootSrc = "file://"; // This is the root directory of your files, can be empty if not needed
var regDrive = null; // RegExp to remove the drive letter of all the filenames if needed - eg: /D:\\/gi
var minWidth = 600; // Minimum width an image should be in pixels
// ---------- VARIABLES ABOVE CAN BE MODIFIED

// Get the files list
function handleFileSelect(evt) {
	var f = evt.target.files[0];
	var reader = new FileReader();
	
	reader.onload = function(theFile) {
		arrF = theFile.target.result.split(/\r\n|\r|\n/g);
		console.log(arrF.length+' files found.');
		initSlideshow();
	};
	reader.readAsText(f);
}

// Start the slideshow
function initSlideshow() {
	var nfMax = arrFS.length;
	console.log("Starting the Slideshow. Timer : "+timer+" nF : "+nF+" nFMax : "+nfMax);
	if (nfMax == 0 || nfMax == nF) {
		if (nfMax == nF && nfMax != 0) clearInterval(nextF);
		if (nfMax == 0) setTimer(0);
		nextF = setInterval(showRandFile, timer);
		showRandFile(); // First display
		document.getElementById('files').blur();
	} else {
		clearInterval(nextF);
		nextF = setInterval(showNextFile, timer);
	}
}

// Choose a random file to display
function showRandFile() {
	if (arrF.length != 0) {
		console.log("Selecting a new file...");
		var fileOk = false;
		var ext;
		var re = /(?:\.([^.]+))?$/;
		// Select a random file
		while (fileOk != true) {
			var randF = Math.floor(Math.random()*(arrF.length-1));
			var toDisplay = arrF[randF];
			ext = re.exec(toDisplay)[1].toLowerCase();
			if (extE.match(ext) == null) fileOk = true;
			//delete arrF[randF];
		}
		
		if (regDrive != null) toDisplay = toDisplay.replace(regDrive,"");
		toDisplay = toDisplay.replace(/\\/gi,"/");
		console.log("File found : "+toDisplay);
		
		arrFS.push(toDisplay);
		// Display the file
		displayFile(toDisplay);
		nF++;
		precFunc = "Rand";
	}
}

// Display the file
function displayFile(toDisplay) {
	var re = /(?:\.([^.]+))?$/;
	var ext = re.exec(toDisplay)[1].toLowerCase();
	if (extImg.match(ext)) {
		document.getElementById('displayF').innerHTML = '<img src="'+rootSrc+encodeURI(toDisplay)+'" alt="" id="cImg" onload="updateImgDim();" style="max-height: '+maxHeight+'px; min-width: '+minWidth+'px;" />';
	} else if (extVid.match(ext)) {
		document.getElementById('displayF').innerHTML = '<video controls autoplay id="vid"><source src="'+rootSrc+encodeURI(toDisplay)+'" type="video/'+ext+'"></video>';
		if (pause == false) {
			console.log("Video displayed, starting pause.");
			setPause(); // Putting the slideshow in pause mode for the video
			document.getElementById('vid').addEventListener('ended', videoEnded, false); // Release the slideshow at the end of the video
		}
	}
	console.log("File "+nF+" displayed.");
}

// After the end of a video : Removing ended event and releasing the slideshow
function videoEnded() {
	document.getElementById('vid').removeEventListener('ended', videoEnded, false);
	console.log("Video ended, releasing the slideshow.");
	setPause();
}

// Show previous file(s)
function showPrevFile() {
	if (arrFS.length > 1 && nF > 0) {
		console.log("Displaying previous file.");
		if (pause == false && precFunc != "Prev") {
			console.log("Changing slideshow function to showNextFile().");
			clearInterval(nextF);
			nextF = setInterval(showNextFile, timer);
		}
		if (nF == arrFS.length) nF--;
		nF--;
		if (arrFS[nF] != undefined) {
			var toDisplay = arrFS[nF];
			displayFile(toDisplay);
			precFunc = "Prev";
		}
	}
}

// Show next file(s)
function showNextFile() {
	if (arrFS.length-1 > nF) {
		console.log("Displaying next file.");
		if (pause == false && precFunc != "Next") {
			console.log("Changing slideshow function to showNextFile().");
			clearInterval(nextF);
			nextF = setInterval(showNextFile, timer);
		}
		nF++;
		if (arrFS[nF] != undefined) {
			var toDisplay = arrFS[nF];
			displayFile(toDisplay);
			precFunc = "Next";
		}
	} else {
		nF = arrFS.length;
		if (pause == true) {
			showRandFile();
		} else {
			initSlideshow();
		}
	}
}

// Change pause status
function setPause() {
	pause = !pause;
	console.log("Pause set : "+pause);
	if (pause == true) {
		document.getElementById('pause_button').value = "Release";
		clearInterval(nextF);
	} else {
		document.getElementById('pause_button').value = "Pause";
		initSlideshow();
	}
}

// Changer timer value
function setTimer(add) {
	timer = timer + add;
	if (timer < 1000) timer = 1000;
	console.log("New timer : "+timer);
	if (arrFS.length > 0) {
		clearInterval(nextF);
		nextF = setInterval(showRandFile, timer);
		console.log(nextF);
	}
	document.getElementById('timer').innerHTML = timer/1000 + " seconds";
}

// Update dimensions properties for the image
function updateImgDim() {
	// Update maximum height to avoid overflow
	var cMaxHeight = window.innerHeight-30;
	if (cMaxHeight != maxHeight) {
		maxHeight = cMaxHeight;
		console.log("CSS Updated with max-height = "+maxHeight);
	}
	// Keeping aspect-ratio of the image
	var cImg = document.getElementById("cImg");
	var imgW = cImg.naturalWidth;
	var imgH = cImg.naturalHeight;
	if (imgH > maxHeight) {
		var diffH = (maxHeight-imgH)/imgH;
		var newWidth = parseInt(imgW*(1+diffH));
		if (minWidth > newWidth) cImg.style.minWidth = "";
		cImg.style.width = newWidth;
	}
}

// Keystrokes
function keyStrokes(event) {
	var ek = event.keyCode;
	if (ek == 32) setPause(); // spacebar
	if (ek == 37) showPrevFile(); // right arrow
	if (ek == 39) showNextFile(); // right arrow
	if (ek == 38) setTimer(+1000); // up arrow
	if (ek == 40) setTimer(-1000); // down arrow
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);
document.getElementById('pause_button').addEventListener('click', setPause, false);
document.onkeydown = keyStrokes;

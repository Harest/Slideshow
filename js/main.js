/* HOW IT WORKS
	You need a .txt with one filepath you want to see / line.
	It can be any image format including gif, and any video format supported by html5.
	In Windows for instance, you can use something like this on a directory :
	dir "D:\Documents\Images" /A-D /S /b /-p /o:gen >List_Files.txt
	
	NB : If you're using the script locally via file://, you may need to follow these advices :
	http://kb.mozillazine.org/Links_to_local_pages_do_not_work

CONTROLS
	Left arrow : Previous file
	Right arrow : Next file (random if not already existing)
	Up/Down arrow : Increase/Decrease the timer
	Spacebar : Pause (be careful to unfocus the "Browse" button first)
	Echap : Display/Hide the config window
*/
var arrF = []; // Files list
var arrFS = []; // Files displayed
var nextF; // Var used to display the next file or not with Interval
var nF = 0; // Current number of the file displayed ; Used to go back in the history
var precFunc; // Precedent function to prevent too much reset of setInterval
var maxHeight = window.innerHeight-30; // Maximum height an image should be to avoid overflow
// ---------- VARIABLES BELOW CAN BE MODIFIED
var extImg = "jpg,jpeg,gif,png,bmp"; // Images Extensions
var extVid = "mp4,webm,ogg"; // HTML5 Video Extensions
var extVidObj = "avi,wmv,flv,divx,mpg,mpeg"; // Object Video Extensions
var timer = 5000; // Set default timer to 5 seconds
var pause = false; // Pause disabled by default
var rootSrc = "file://"; // This is the root directory of your files, can be empty if not needed
var regDrive = null; // RegExp to remove the drive letter of all the filenames if needed - eg: /D:\\/gi
var minWidth = 600; // Minimum width an image should be in pixels
var expireDays = 30; // How long until the config cookie will expire
var keyShortcuts = {
pause: 32,
prev: 37,
next: 39,
incTimer: 38,
decTimer: 40,
configW: 27
};
// ---------- VARIABLES ABOVE CAN BE MODIFIED

// Get the files list
function handleFileSelect(evt) {
	var f = evt.target.files[0];
	var reader = new FileReader();
	
	reader.onload = function(theFile) {
		var tmpArray = theFile.target.result.split(/\r\n|\r|\n/g);
		var nbItems = tmpArray.length;
		// Extensions checking
		for (var i = 0; i < nbItems; i++) {
			var ext = tmpArray[i].split('.').pop().toLowerCase();
			if (extImg.match(ext) || extVid.match(ext) || extVidObj.match(ext)) arrF.push(tmpArray[i]);
		}
		// Ramdomizing the array
		arrF = randArray(arrF);
		
		console.log(arrF.length+' files found.');
		initSlideshow();
	};
	reader.readAsText(f);
}

// Start the slideshow
function initSlideshow() {
	if (arrF.length != 0) {
		var nfMax = arrFS.length;
		console.log("Starting the Slideshow. Timer : "+timer+" nF : "+nF+" nFMax : "+nfMax);
		if (nfMax == 0 || nfMax == nF) {
			if (nfMax == nF && nfMax != 0) clearInterval(nextF);
			if (nfMax == 0) setTimer(0);
			nextF = setInterval(showCurrentFile, timer);
			showCurrentFile(); // First display
			document.getElementById('files').blur();
		} else {
			clearInterval(nextF);
			nextF = setInterval(showNextFile, timer);
		}
	}
}

// Display the current file
function showCurrentFile() {
	var nbFiles = arrF.length;
	if (nbFiles != 0) {
		if (nbFiles-1 < nF) { // Reset the slideshow if we reach the end.
			arrF = randArray(arrF);
			arrFS = [];
			nF = 0;
			console.log("End of files queue reached. Slideshow shuffled and reset.");
		}
		var toDisplay = arrF[nF];
		
		if (regDrive != null) toDisplay = toDisplay.replace(regDrive,"");
		toDisplay = toDisplay.replace(/\\/gi,"/");
		console.log("Displaying file : "+toDisplay);
		
		arrFS.push(toDisplay);
		// Display the file
		displayFile(toDisplay);
		nF++;
		precFunc = "Current";
	}
}

// Display the file
function displayFile(toDisplay) {
	var ext = toDisplay.split('.').pop().toLowerCase();
	if (extImg.match(ext)) {
		document.getElementById('displayF').innerHTML = '<img src="'+rootSrc+encodeURI(toDisplay)+'" alt="" id="cImg" onload="updateImgDim();" style="max-height: '+maxHeight+'px; min-width: '+minWidth+'px;" />';
	} else if (extVid.match(ext)) {
		document.getElementById('displayF').innerHTML = '<video controls autoplay id="vid"><source src="'+rootSrc+encodeURI(toDisplay)+'" type="video/'+ext+'"></video>';
		if (pause == false) {
			console.log("Video displayed, starting pause.");
			setPause(); // Putting the slideshow in pause mode for the video
			document.getElementById('vid').addEventListener('ended', videoEnded, false); // Release the slideshow at the end of the video
		}
	} else if (extVidObj.match(ext)) {
		document.getElementById('displayF').innerHTML = '<object id="vid" data="'+rootSrc+encodeURI(toDisplay)+'" type="video/'+ext+'" height="'+maxHeight+'" width="'+parseInt((maxHeight/9)*16)+'"><param name="autoplay" value="true"></object>';
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

// Show previous file(s) already displayed
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

// Show next file(s) already displayed
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
			showCurrentFile();
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
		nextF = setInterval(showCurrentFile, timer);
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

// Display / Hide the config window
function showWindowConfig() {
	if (document.getElementById('intro') != undefined) document.getElementById('intro').style.visibility = "hidden";
	var configW = document.getElementById('configW');
	if (configW.style.visibility == "hidden") {
		document.getElementById('confTimer').value = timer/1000;
		document.getElementById('confExtImg').value = extImg;
		document.getElementById('confSaved').src = "img/space.png";
		configW.style.visibility = "visible";
	} else {
		configW.style.visibility = "hidden";
	}
}

// Saving the configuration (cookie)
function saveConfig() {
	// TODO check and save all config parameters
	var form = document.forms['configure'];
	var newTimer = parseInt(form['confTimer'].value);
	timer = (newTimer > 1) ? newTimer*1000 : 1000;
	extImg = form['confExtImg'].value;
	var confSaved = document.getElementById('confSaved');
	writeCookie() ? confSaved.src = "img/check.png" : confSaved.src = "img/error.png";
	setTimeout(function(){ confSaved.src = "img/space.png" }, 2000);
}

// Return the config in a JSON String
function serializeConfig() {
	var data = '{"timer":"'+timer+'", "extImg":"'+extImg+'"}';
	// TODO adding all config parameters
	return data;
}

// Writing the config cookie
function writeCookie() {
    var d = new Date();
    d.setTime(d.getTime() + (expireDays*24*60*60*1000));
	document.cookie = serializeConfig()+';path=/;expires='+d.toUTCString();
	if (document.cookie) {
		console.log("Config saved in a cookie.");
		return true;
	}
	return false;
}

// Checking and reading the config cookie
function readCookie() {
	var c = document.cookie.split(';');
	if (c[0]) {
		data = JSON.parse(c[0]);
		var newTimer = parseInt(data['timer']);
		timer = (newTimer > 1000) ? newTimer : 1000;
		extImg = data['extImg'];
		return true;
	}
	return false;
}

// Randomize an array
function randArray(array) {
	var itemsLeft = array.length, tmpItem, randIndex;
	while (itemsLeft !== 0) {
		randIndex = Math.floor(Math.random() * itemsLeft);
		itemsLeft -= 1;
		tmpItem = array[itemsLeft];
		array[itemsLeft] = array[randIndex];
		array[randIndex] = tmpItem;
	}
	return array;
}

// Keystrokes
function keyStrokes(event) {
	var ek = event.keyCode;
	if (ek == keyShortcuts.pause) setPause(); // spacebar
	if (ek == keyShortcuts.prev) showPrevFile(); // right arrow
	if (ek == keyShortcuts.next) showNextFile(); // right arrow
	if (ek == keyShortcuts.incTimer) setTimer(+1000); // up arrow
	if (ek == keyShortcuts.decTimer) setTimer(-1000); // down arrow
	if (ek == keyShortcuts.configW) showWindowConfig(); // echap
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);
document.getElementById('pause_button').addEventListener('click', setPause, false);
document.getElementById('config_img').addEventListener('click', showWindowConfig, false);
document.getElementById('config_close').addEventListener('click', showWindowConfig, false);
document.onkeydown = keyStrokes;
readCookie();
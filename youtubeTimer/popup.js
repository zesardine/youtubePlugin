//by ZeSardine

//CONTAINS THE JAVASCRIPT WHICH CONTROLS THE CONTENT WITHIN THE POPUP (TIMER, READING SETTINGS)

var maxTime = 3; //max time that you can set on the slider

changeTime();
document.addEventListener('DOMContentLoaded', function() {
	
	if(!!document.getElementById("timer")){
		document.getElementById("timer").innerHTML = "--:--:--"; //Set timer initially so it's not weird
	}
	
	//JAVASCRIPT FOR COLLAPSIBLE SETTINGS
	//honestly just copied this
	var coll = document.getElementsByClassName("collapsible");
	var i;

	for (i = 0; i < coll.length; i++) {
		coll[i].addEventListener("click", function() { //On click on collapsible button
			this.classList.toggle("active");
			//Following expands the content
			var content = this.nextElementSibling;
			if (content.style.maxHeight){
				content.style.maxHeight = null;
			} else {
				content.style.maxHeight = content.scrollHeight + "px";
			} 
		});
	}
	
	//JAVASCRIPT FOR SLIDER STUFF
	var slid = document.getElementsByClassName("slider");
	var j;

	for (j = 0; j < slid.length; j++) {
		updateSliders(slid[j], true); //Initially updates sliders to correct values
		slid[j].addEventListener("input", function() {
			updateSliders(this, false); //updates slides when they are moved
		});
	}
	
	//CREATES INTERVAL TO CHANGE CLOCK EVERY SECOND
	clearInterval(updateClock);
	var updateClock = setInterval(() => { 
		changeTime();
	}, 1000);
}, false);

function updateSliders(obj, get){
	var keyTmp = obj.id.toString(); //Since the sliders have id equivalent to the value they change in local storage, we get that
	var value = obj.value;
	var stringThing;
	
	if(keyTmp === "timeLimit"){
		if(value > maxTime){obj.value = maxTime}
	}
	
	if(get){
		chrome.storage.local.get([keyTmp], function(result) { //Use the id as a key
			value = result[keyTmp]; //Get the id value from the result
			obj.value = value; //Set it to that
			updateSliderText(obj);
		});
	}else{
		updateSliderText(obj);
		var send = {};
		send[keyTmp] = obj.value; //Had to do object stuff to make this work
		chrome.storage.local.set(send, function() {}); //Sets value in local storage to the value of the slider
	}
}

function updateSliderText(obj){ //Changes id to something more humanly pretty (capitalize and spaces)
	stringThing = obj.id[0].toUpperCase() + obj.id.slice(1); //First letter of id to uppercase
	stringThing = stringThing.replace(/([A-Z])/g, ' $1').trim(); //Adds space in front of upercase letters
	var appendix = "";
	if(obj.id === "timeLimit"){appendix = " hrs"}
	obj.previousElementSibling.innerHTML = stringThing + ": " + obj.value + appendix; //Sets the tag above the slider
}

function changeTime(){
	chrome.storage.local.get(['currentTime'], function(result) { //Gets the current time set by content.js
		document.getElementById("timer").innerHTML = new Date(Math.round(result.currentTime) * 1000).toISOString().substr(11, 8); //Sets the timer to that value (ISOstring formats it to look cool)
	});
}

chrome.runtime.onMessage.addListener(
	function(request, sender) {
		if(request.message == "setClockOnNonYoutubePage"){
			//Just change the time to the sent totalTime and hold it there until youtube opened again
			document.getElementById("timer").innerHTML = new Date(Math.round(request.totalTime) * 1000).toISOString().substr(11, 8); //Sets the timer to that value (ISOstring formats it to look cool)
		}
	}
);
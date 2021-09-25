//by ZeSardine

//CONTAINS THE JAVASCRIPT THAT CALCULATES THE CURRENT CLOCK TIME, DETERMINES IF THIS IS MORE THAN TIME LIMIT

var tabOpen = true; //Boolean for whether a youtube tab is opened and visible
var currentTime = 0; //Time that is displayed on clock
var lockedTimeLimit = 2; //Time Limit, is reset every night

var ready = true; //Just a flag to make sure stuff works

//Following variables are used to calculate current youtube time
var totalYoutubeTime;
var startTimeYoutube;

var modalTitle = "HI";
var modalText = "So... You've been here for quite a while now...";

//Only updates timer if youtube is indeed open (since according to manifest, content scripts only run on urls containing youtube.com). 
//REMEMBER, THIS IS NOT THE TIMER SCRIPT, it's only the visualization. The timer is located in backgroud.js

//CHECK TABOPEN SO SCRIPT DOESN'T RUN ON ALL YOUTUBE TABS ----------------------------------

//Make sure tab is open
tabOpen = true;

//Change the tabOpen when you switch tabs
document.addEventListener("visibilitychange", function() {
  if (document.visibilityState === 'visible') { //set tabopen to true if tab is visible
    tabOpen = true;
	console.log("Tab opened");
  } else {
    tabOpen = false;
	ready = false;
	console.log("Tab closed");
  }
});

//Set tabopen initially if visibility hasn't been changed
if (document.visibilityState === 'visible') { //set tabopen to true if tab is visible
    tabOpen = true;
	console.log("Tab open");
  } else {
    tabOpen = false;
	console.log("Tab close");
  }

//Communication with background
chrome.runtime.onMessage.addListener(
	function(request, sender) {
		if(request.message == "sendTimes"){ //Sends the interval start time and total time
			console.log("From background: " + request.startTime + ", " + request.totalTime);
			//Sets all the necessary variables
			startTimeYoutube = request.startTime;
			totalYoutubeTime = request.totalTime;
			lockedTimeLimit = request.timeLimit;
			//console.log(lockedTimeLimit);
			ready = true;
			calculateTime();
		}else if(request.message == "setClockOnNonYoutubePage"){ //Sends a quick command to set clocks on sites that aren't youtube
			currentTime = request.totalTime;
			chrome.storage.local.set({"currentTime": currentTime}, function() {}); //Save current time to local storage
		}
	}
);

//CALCULATE CURRENT TIME --------------------------------------------------------------

//Calculates timer to display
function calculateTime(){
	if(tabOpen){ //If youtube is indeed open
		var timeNow = (new Date)/1000; //Get time now
		currentTime = timeNow - new Date(startTimeYoutube)/1000 + totalYoutubeTime; //Calculate current time spent on youtube
		chrome.storage.local.set({"currentTime": currentTime}, function() {}); //Save current time to local storage
		checkLimit();
	}
}

//POPUP WINDOW

//Creates fancy popup window, most of this function is just css to make it look decent
function createCustomAlert(txt) {
	d = document;

	if(d.getElementById("modalContainer")) return;

	mObj = d.getElementsByTagName("body")[0].appendChild(d.createElement("div"));
	mObj.id = "modalContainer";
	mObj.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
	mObj.style.position="absolute";
	mObj.style.top="0";
	mObj.style.width="100%";
	mObj.style.height=d.documentElement.scrollHeight + "px";
	mObj.style.left="0px";
	mObj.style.zIndex="10000";
  
	alertObj = mObj.appendChild(d.createElement("div"));
	alertObj.id = "alertBox";
	if(d.all && !window.opera) alertObj.style.top = document.documentElement.scrollTop + "px";
	alertObj.style.left = "33%";
	alertObj.style.visiblity="visible";
	alertObj.style.position="relative";
	alertObj.style.width="33%";
	alertObj.style.height="120px";
	alertObj.style.marginTop="50px";
	alertObj.style.border="2px solid #fff";
	alertObj.style.backgroundColor="#fff";
	alertObj.style.backgroundRepeat="no-repeat";
	alertObj.style.top="10%";

	h1 = alertObj.appendChild(d.createElement("h1"));
	h1.appendChild(d.createTextNode(modalTitle));
	h1.style.margin = "0";
	h1.style.font="bold 2em Raleway,arial";
	h1.style.backgroundColor="#cf1717";
	h1.style.color="#FFF";
	h1.style.borderBottom="1px solid #cf1717";
	h1.style.padding="10px 0 10px 5px";

	msg = alertObj.appendChild(d.createElement("p"));
	//msg.appendChild(d.createTextNode(txt));
	msg.innerHTML = txt;
	msg.style.textAlign = "center";
	msg.style.margin = "10px";
	msg.style.font="1.5em Raleway,arial";

	btn = alertObj.appendChild(d.createElement("a"));
	btn.id = "closeBtn";
	btn.appendChild(d.createTextNode("Okay"));
	btn.href = "#";
	btn.focus();
	btn.onclick = function() { removeCustomAlert();return false; }
	btn.style.display="block";
	btn.style.position="absolute";
	btn.style.padding="7px";
	btn.style.width="10%";
	btn.style.textTransform="uppercase";
	btn.style.textAlign="center";
	btn.style.color="#FFF";
	btn.style.backgroundColor="#cf1717";
	btn.style.textDecoration="none";
	btn.style.bottom = "0";
	btn.style.left = "45%";
	btn.style.font="1.5em Raleway,arial";
	alertObj.style.display = "block";
  
}

//Removes the popup window
function removeCustomAlert() {
	if(currentTime > lockedTimeLimit*3600){
		chrome.storage.local.set({"modalOpened": true}, function() {}); //sets modalOpened to true so it doesn't appear again
	}
	document.getElementsByTagName("body")[0].removeChild(document.getElementById("modalContainer")); //removes modal
}

//CHECK TIME LIMIT FUNCTION --------------------------------------------------------------------
//Background.js doesn't actually contain the current time, thus, this script also has to determine if you've passed the time limit

function checkLimit(){
	//console.log(currentTime);
	if(currentTime > lockedTimeLimit*3600 && ready){ //check if you've gone over the timeLimit
		//console.log("Over limit");
		chrome.storage.local.get(['difficulty'], function(result) {
			executeAction(result.difficulty/10); //calls an  action in actions.js
		});
		chrome.storage.local.get(['modalOpened'], function(result) {
			if(!result.modalOpened){ //if modal hasn't been opened
				//console.log(result.modalOpened);
				createCustomAlert(modalText); //open the modal
			}
		});
	}
}

calculateTime();
clearInterval(moreClock);
//Runs the calculate time function once a second
var moreClock = setInterval(function(){
	calculateTime();
}, 1000);

//OLD CALCULATE TIME FUNCTION
/*var totalYoutubeTime = 0;
var timeNow = (new Date)/1000;
chrome.storage.local.get(['totalTime'], function(result) {
	totalYoutubeTime = result.totalTime; //Get the total time on youtube - current session (cause the interval isn't added until you click on other tab)
});
chrome.storage.local.get(['startTime'], function(result) {
	currentTime = timeNow - new Date(result.startTime)/1000 + totalYoutubeTime; //timeNow-new Date calculate current session, add total time to that
});
chrome.storage.local.set({"currentTime": currentTime}, function() {}); //save the current time to localstorage
*/
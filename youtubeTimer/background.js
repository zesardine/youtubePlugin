//by ZeSardine

//CONTAINS THE JAVASCRIPT THAT FORMS THE BASIS OF THE CLOCK, RUNS IN BACKGROUND

var totalTime = 0; //total time on youtube
chrome.storage.local.get(['currentTime'], function(result) {
	totalTime = result.currentTime ?? 0; //sets the totalTime if it's already saved (if after plugin reset there's a saved value)
	chrome.storage.local.set({"currentTime": totalTime}, function() {}); //saves that to localStorage
});
var interval = [0, 0, 0]; //first item is overwrite flag (0 means youtube isn't on, 1 means it was already open), second is time you opened youtube, third is time you left youtube
var lockedTimeLimit = 2; //the locked time limit for the day

//SET VARIABLES
chrome.storage.local.set({"difficulty": 3}, function() {}); 
chrome.storage.local.set({"timeLimit": lockedTimeLimit}, function() {});  
chrome.storage.local.set({"modalOpened": false}, function() {});

//LOG TIME WHEN TAB CHANGES --------------------------------------------------------------

//Log time when tab is updated (eg. you click on a video in your recommended)
chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
	if (changeInfo.status == 'complete') {
		chrome.tabs.getSelected(function(tab){trackTime(tab.url, new Date, tabId);}); //sends the current tab into the trackTime function below
		chrome.tabs.sendMessage(tabId, {message: "generateAction"}); //generates the potential action for this tab to do
	}
});
//Log time when you click on different tab (this doesn't work)
/*chrome.tabs.onActiveChanged.addListener( function (tabId, selectInfo) {
	chrome.tabs.getSelected(function(tab){trackTime(tab.url, new Date, tabId);});
});*/

//Okay so apparently the above thing isn't the right way, so here's the correct way:
chrome.tabs.onActivated.addListener( function (activeInfo) {
	chrome.tabs.getSelected(function(tab){trackTime(tab.url, new Date, tab.id);}); //sends the current tab into the trackTime function below
});

//LOG FUNCTION -------------------------------------------------------------------------

//Log time function, creates interval if the tab is youtube, closes interval if it's a different tab (and youtube was open before)
function trackTime(url, date, tabid){
	if(url.includes("youtube.com")){
		if(interval[0] == 0){ //If this is a new interval
			interval[0] = 1; //Set flag to 'youtube open' state
			interval[1] = date; //Set start time of interval to current time
			//chrome.storage.local.set({"startTime": interval[1].toString()}, function() {}); //save start time of interval to local storage
		}
		chrome.tabs.sendMessage(tabid, {message: "sendTimes", startTime: interval[1].toString(), totalTime: totalTime, timeLimit: lockedTimeLimit});
	}else{ //If site isn't Youtube
		if(interval[0] !== 0){ //If an interval is in session
			interval[2] = date; //Set end time of interval to current time
			var dif = (interval[2] - interval[1])/1000; //Caculate length of interval
			totalTime+=dif; //Add that to totaltime
			//chrome.storage.local.set({"totalTime": totalTime}, function() {}); // save to local storage
			interval = [0, 0, 0]; //reset interval array
			//alert(totalTime);	
		}
		chrome.tabs.sendMessage(tabid, {message: "setClockOnNonYoutubePage", totalTime: totalTime}); //Basically, set the clocks on pages that aren't youtube
	}
}

//RESET TIMER FUNCTION -------------------------------------------------------------------

//Reset timer at 23:59:59 every day
function setMidnightFlag(){
	var now = new Date();
	//Get the time until next midnight
	var millisTill = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 0) - now; //Gets the time till 23:59:59
	if (millisTill <= 0) {
		 millisTill += 86400000; // try again tomorrow if time has already passed.
	}
	setTimeout(function(){
		chrome.storage.local.get(['timeLimit'], function(result) { //Gets the current timeLimit set by sliders content.js
			//Reset total time and also flags and interval
			totalTime = 0;
			interval = [0, 0, 0]; 
			//Save reset time and flags
			chrome.storage.local.set({"modalOpened": false}, function() {}); //Allow modal window popup to open tomorrow
			lockedTimeLimit = result.timeLimit; //Sets the time limit for the next day to the value read from the slider
			//Call the interval function (in case youtube is open during the reset)
			chrome.tabs.getSelected(null, function(tab) {
				chrome.tabs.sendMessage(tab.id, {message: "setClockOnNonYoutubePage", totalTime: totalTime}); //If youtube isn't open, just set timer to 0
				trackTime(tab.url, new Date, tab.id); //Start a new interval if youtube is open
				//alert((tab.url).toString()); 
			});
		});
		setMidnightFlag(); //Set for next midnight!
	}, millisTill);
}
setMidnightFlag();

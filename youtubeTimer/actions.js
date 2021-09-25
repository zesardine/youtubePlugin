//by ZeSardine

//CONTAINS THE JAVASCRIPT FUNCTIONS WHICH ARE RUN AFTER YOU GO OVER THE LIMIT

//Redirect links used by replaceLinks function
var jokeLinks = ["/watch?v=2yJgwwDcgV8", "/watch?v=dQw4w9WgXcQ"];

//Texts used by displayTexts function
var jokeTexts = ["Stop watching youtube you lazy pig", "You sooo dumm"];

//Just saving the video div to a variable
var videoElement = document.getElementsByClassName("html5-main-video")[0];

//Stuff to generate which action to use for which video
var actionToBeExecuted = Math.random(); //Just a random
var actionDone = false; //This flag gets set to true if it's an action that only has to happen once, like replacing links or showing text
var actions = 6; //Amount of actions that can be executed, used for the random

//Generates which action should be done for the next video
function generateAction(){
	actionToBeExecuted = Math.random(); //Resets the random
	actionDone = false; //Resets the flag
	//console.log("Numthing: " + actionToBeExecuted);
}

//Actually executes/decides whether to execute an action
function executeAction(chance){
	//Go through all the joke links and make sure that those run without any problems. It wouldn't be as funny if you got rickrolled and before the music starts, you get a quote in place of the video
	for(var i = 0; i < jokeLinks.length; i++){
		if(window.location.href.includes(jokeLinks[i])) return 0;
	}
	//Checks whether a non-repetitive action has been done and a random number is smaller than the chance inputed
	if(actionDone === false && Math.random() < chance){
		tmpRnd = Math.floor(actionToBeExecuted*actions); //Creates an integer from the random
		//console.log("act: " + tmpRnd);
		switch(tmpRnd){ //Decides which action to do
			case 0: displayText(); actionDone = true; break;
			case 1: replaceLinks(); break; //Just so even when new links load, it still works
			case 2: randomSkip(); break;
			case 3: videoActions("p"); break;
			case 4: videoActions("m"); break;
			case 5: videoActions("r"); break;
		}
	}
}

//Replaces video with text.
function displayText(){
	chrome.storage.local.get(['difficulty'], function(result) {
		videoActions("p"); //Pause video so it stops playing (due to some reason audio can keep going, idk why)
		document.getElementById("ytd-player").innerHTML = 
		'<div id="container" style="background-color: black; position: absolute; width:100%; height:100%;">' +
			'<div style="position: absolute; top:50%; left:50%; -ms-transform: translate(-50%, -50%);transform: translate(-50%, -50%);">' +
				'<h1 style="color: white;">' + jokeTexts[Math.floor(Math.random()*jokeTexts.length)] + '</h1>' +
			'</div>' +
		'</div>';
	});
}

//Skips to a random point in the video, this function doesn't set the action done flag, so it can happen multiple times in one tab
function randomSkip(){
	if(!videoElement.paused){
		videoElement.currentTime = videoElement.duration/50*Math.floor(Math.random()*50);
	}
}

//The act parameter can have three states, p pauses the video, m mutes the video, r changes the playback rate
function videoActions(act){
	switch(act){
		case "p":
			document.getElementsByClassName("html5-main-video")[0].pause();
			break;
		case "m":
			document.getElementsByClassName("html5-main-video")[0].muted = true;
			break;
		case "r":
			document.getElementsByClassName("html5-main-video")[0].playbackRate = 0.1 + Math.floor(Math.random()*20)*0.1;
	}
}

//Goes through all video links on the website and changes them to one of the links in the jokelinks
function replaceLinks(){
	var anchorstst = document.getElementsByTagName("a");
	for (var i = 0; i < anchorstst.length; i++) {
		if(anchorstst[i].classList.contains("ytd-thumbnail") || anchorstst[i].classList.contains("ytd-compact-video-renderer") || anchorstst[i].classList.contains("ytd-grid-video-renderer")){
			anchorstst[i].href = jokeLinks[Math.floor(Math.random()*jokeLinks.length)];
			anchorstst[i].classList.remove("yt-simple-endpoint");
			anchorstst[i].style = "text-decoration: none;";	
		}
	}
}

chrome.runtime.onMessage.addListener(
	function(request, sender) {
		if(request.message == "generateAction"){ //Message is sent when you open a new youtube tab
			generateAction(); //Gives the youtube tab an action that it should execute and also resets the actionDone flag
		}
	}
);
// Contains text of the email
var content = "";
//Attachment present
var isAttachmentPresent = false;
//Attachment link
var attachment = "";



//Starts here
function runOnPage(callback){
  chrome.runtime.onConnect.addListener(function(port) {
  console.assert(port.name == "lprotct-chrome");
  port.onMessage.addListener(function(msg) {
		content = msg.email;
	 	if (msg.attachment != undefined)
	 		attachment = msg.attachment;
	 	isAttachmentPresent = msg.attachment_present;
	 	if (content == ""){
	 		appendMessage("Email not read")
	 	} else {
	 		callback(content);
	 	}});
	});
}

function setEmailOnPage(emailtext){
	var finalText = emailtext.replace(/\s{2,}/g,' ');;
	document.getElementById('status').innerText = finalText;
	if(isAttachmentPresent)
		document.getElementById('attachment_status').innerText = " Detected";
	else
		document.getElementById('attachment_status').innerText = " Not Detected";


}


var port = null;

var getKeys = function(obj){
   var keys = [];
   for(var key in obj){
      keys.push(key);
   }
   return keys;
}


function appendMessage(text) {
  document.getElementById('response').innerHTML += text + "</br>";
}

function updateUiState() {
  if (port) {
    document.getElementById('connect-button').style.display = 'none';
  } else {
    document.getElementById('connect-button').style.display = 'block';
  }
}

function sendNativeMessage() {
if (content == ""){
	 		appendMessage("Can't read email. Please refresh the browser page/tab")
	 	} else {
message = {"text": content, "attachment_present":isAttachmentPresent, "attachment_link": attachment};
	
  sendPostData(message)
  appendMessage("Message sent to desktop client");	 	
  }
}

function onNativeMessage(message) {
  appendMessage("Received message: <b>" + JSON.stringify(message) + "</b>");
}

function onDisconnected() {
  appendMessage("Failed to connect: " + chrome.runtime.lastError.message);
  port = null;
  updateUiState();
}

function downloadAttachment(){
	if (attachment === ""){
		appendMessage("No attachment detected")
	} else {
	chrome.tabs.create({ url: attachment });
	}
}

function connect() {
  var hostName = "lprotct";
  appendMessage("Connecting to native messaging host <b>" + hostName + "</b>")
  port = chrome.runtime.connectNative(hostName);
  port.onMessage.addListener(onNativeMessage);
  port.onDisconnect.addListener(onDisconnected);
  updateUiState();
}

document.addEventListener('DOMContentLoaded', function () {

  document.getElementById('send-message-button').addEventListener(
      'click', sendNativeMessage);
  document.getElementById('download-attachment').addEventListener(
      'click', downloadAttachment);
  updateUiState();
});


var tabs = {};
var tabIds = [];


focusedWindowId = undefined;
currentWindowId = undefined;


var urls = ["https://mail.google.com/mail/u/0/h/", "https://mail.google.com/mail/u/0/#"];

function printURL(){
	urls.forEach(function(url){
		
		reg = new RegExp(url+"[^]*")
		for (var i = 0; i < tabIds.length; i++){
		if ((reg.exec(tabs[tabIds[i]].url)) != null){
			if ((tabs[tabIds[i]].url.substring(0,34)) === urls[1]){
			appendMessage("Detected email Gmail on tab " + "<b>" + tabs[tabIds[i]].title) + "</b>";
			appendMessage("Detected email on url: " + "<a target=\"_blank\" href=\"" + tabs[tabIds[i]].url + "\">" + tabs[tabIds[i]].url + "</a>");

			} else {
			appendMessage("Detected email Gmail HTML mode on tab " + "<b>" + tabs[tabIds[i]].title) + "</b>";
			appendMessage("Detected email on url: " + "<a target=\"_blank\" href=\"" + tabs[tabIds[i]].url + "\">" + tabs[tabIds[i]].url + "</a>");

			}
			
			}

		}

	});
				appendMessage("Select the email link you want to read")

}

function loadWindowList(callback) {
  chrome.windows.getAll({ populate: true }, function(windowList) {
 
    for (var i = 0; i < windowList.length; i++) {
      windowList[i].current = (windowList[i].id == currentWindowId);
      windowList[i].focused = (windowList[i].id == focusedWindowId);
      for (var j = 0; j < windowList[i].tabs.length; j++) {
        tabIds[tabIds.length] = windowList[i].tabs[j].id;
        tabs[windowList[i].tabs[j].id] = windowList[i].tabs[j];
      }
    }

  callback();

  });
}

function sendPostData(content){
	var xhr = new XMLHttpRequest();
xhr.open("POST", "http://127.0.0.1:5000/send", true);
xhr.setRequestHeader('Content-Type', 'application/json');
console.log("Content")
console.log(content)
console.log("json")
console.log(JSON.stringify(content))
xhr.send(JSON.stringify(content));
}


runOnPage(setEmailOnPage);
loadWindowList(printURL);



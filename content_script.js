
var isAttachmentPresent = false;
var lastRefreshedURL = document.URL;

function initConnection(){
	var port = chrome.runtime.connect({name: "lprotct-chrome"});
	return port;
}


var port = initConnection();

// GET EMAIL

function getEmailGmailHTML(port){
	var x = document.getElementsByClassName('msg');
	if ((x != null) && (x.length > 0)){
		var emailText =	document.getElementsByClassName('msg')[0].innerText;
		var attachment_link  = getAttachment()
		detectAttachment(function(){
			console.log(attachment_link)
			console.log('damn')
			port.postMessage({email: emailText, attachment_present: isAttachmentPresent, attachment: attachment_link});
		});
		
		console.log(emailText);
	}
}

function getEmailGmail(port){
	var x = document.getElementsByClassName('AO');
	if ((x != null) && (x.length > 0)){
		var emailText =	document.getElementsByClassName('AO')[0].innerText;
		port.postMessage({email: emailText});
		console.log(emailText);
	}
}

 
// GET ATTACHMENT

function getAttachment(){
	/*  Bad hack to get download link from mail 
		Use a better way to get link */
	var emailAttachment = document.getElementsByTagName('td');
	try {
		var link = emailAttachment[38].children[0].href
	} catch (err){
		var link = emailAttachment[42].children[0].href

	}
	return link;
}

function detectAttachment(callback){
	var emailAttachment = document.getElementsByClassName('att');
	if ((emailAttachment != null) && (emailAttachment.length > 0)){
		isAttachmentPresent = true;
		console.log("Attachment detected")
	}
	callback();
}



function startAtThis(){
var urls = ["https://mail.google.com/mail/u/0/h/", "https://mail.google.com/mail/u/0/#", "http://127.0.0.1/emails/"];

for (i = 0; i < urls.length; i++){
	var regex = new RegExp(urls[i]+"[^]*");
	if ( regex.exec(lastRefreshedURL) != null && i == 0){
		getEmailGmailHTML(port);
	}
	if ( regex.exec(lastRefreshedURL) != null && i == 1){
		getEmailGmail(port);
	}
	if ( regex.exec(lastRefreshedURL) != null && i == 2){
		getEmailGmailHTML(port);
	}
}

}


startAtThis();


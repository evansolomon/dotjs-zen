function tab2domain(tab) {
	var myregexp = /[a-z][a-z0-9+\-.]*:\/\/(www\.)?([a-z0-9\-_.~%]*)/i;
	var match = myregexp.exec(tab.url);
	if (match != null) {
		result = match[2];
	} else {
		result = false;
	}
	return result;
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if(changeInfo.status != "loading" || tab.url == null) return;
    var url = 'http://localhost:3131/'+encodeURIComponent(tab2domain(tab));
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function(){
        if(xhr.readystate != 4 || r.status != 200) return;
        js = xhr.responsetext;
        chrome.tabs.executeScript(tabId, {code:js});
    };
    xhr.send();
});
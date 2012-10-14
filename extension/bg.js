function tab2domain(tab) {
    if (!tab.url) return;
    var match = tab.url.match(/^(?:https?)?:\/\/(?:www\.)?([a-z0-9\-_.~%]*)/i);
    if (match) return match[1];
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status != "loading") return;
    var domain = tab2domain(tab);
    if (!domain) return;
    var url = 'http://localhost:3131/' + encodeURIComponent(domain);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState != 4 || xhr.status != 200) return;
        console.log(xhr);
        chrome.tabs.executeScript(tabId, {
            code: xhr.responseText
        });
    };
    xhr.send();
});

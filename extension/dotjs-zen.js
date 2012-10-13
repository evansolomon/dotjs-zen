var script=document.createElement('script');
var url='http://localhost:3131/'+encodeURIComponent(window.location.hostname);

var r=new XMLHttpRequest();
r.open('GET',url, true);
r.onreadystatechange=function(){
    if(r.readyState!=4) return;
    if(r.status!=200) return console.log('dotjsII: HTTP '+r.status);
    script.textContent=r.responseText;

    if(document.readyState=='complete') append();
    else document.addEventListener('DOMContentLoaded',append);
};
r.send();

function append(){
    document.head.appendChild(script);
}

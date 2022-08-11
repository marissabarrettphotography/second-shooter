(function() {
    var origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        console.log(arguments);
		
        this.addEventListener('load', function() {
            console.log(this.getAllResponseHeaders());
        });
		
        origOpen.apply(this, arguments);
    };
    var origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function() {
        console.log(arguments);
        origSend.apply(this, arguments);
    };
})();

console.log(document.cookie);

console.log(_pt$.userInfo);

function onReady() {
    console.log("Hello Chapter 1");

    var clock = new com.andres.AlarmClock( "clock" );
    var clock2 = new com.andres.TextClock( "clock2", -360, "CST" );
    var clock3 = new com.andres.Clock( "clock3", 360, "X");
}

Date.__interval = 0;
Date.__aDates = [];
Date.addToInterval = function(date) {
    this.__aDates.push(date);

    if ( !Date.__interval ) {
        Date.__interval = setInterval(function() {Date.updateDates()}, 1000);
        console.log(Date.__interval);
    }
}

Date.updateDates = function() {
    for ( var i=0; i < this.__aDates.length; i++) {
        if ( this.__aDates[i] instanceof Date ) {
            this.__aDates[i].updateSeconds();
        }
        else if (this.__aDates[i] instanceof Function) {
            this.__aDates[i]();
        }
    }
}

Date.prototype.updateSeconds = function() {
    this.setSeconds(this.getSeconds() + 1);
}

Date.prototype.autoClock = function(isAuto) {
    clearInterval(this.clockInterval);
    if ( isAuto ) {
        Date.addToInterval(this);
    }
}

var com = com || {};
    com.andres = com.andres || {};

com.andres.Clock = function(id, offset, label) {
    offset = offset || 0;
    label = label || "";
    var d = new Date();
    var offset = (offset + d.getTimezoneOffset())*60*1000; 
    this.d = new Date(offset+d.getTime());
    this.d.autoClock(true);
    this.id = id;
    this.label = label;
    
    this.tick(true);
    var that = this;
    Date.addToInterval(function() {
        that.updateClock();
    });
}


com.andres.Clock.prototype.tick = function(isTick) {
    this.isTicking = isTick;    
}

com.andres.Clock.prototype.version = "1.00";
com.andres.Clock.prototype.updateClock = function()  {
    if ( this.isTicking) {
         var date = this.d;
        
         var clock = document.getElementById( this.id );
    
         clock.innerHTML = this.formatOutput(date.getHours(),date.getMinutes(),date.getSeconds(),this.label);
    }
};

com.andres.Clock.prototype.formatOutput = function(h,m,s,l) {
    return this.formatDigits(h) + ":" + this.formatDigits(m) + ":" + this.formatDigits(s) + " " + l;
}

com.andres.Clock.prototype.formatDigits = function(val) {
    if ( val < 10 ) {
        val = "0" + val;
    }

    return val;
};

com.andres.TextClock = function(id, offset, label) {
    com.andres.Clock.apply(this,arguments);
}

com.andres.TextClock.prototype = Object.create(com.andres.Clock.prototype);
com.andres.TextClock.prototype.constructor = com.andres.TextClock;
com.andres.Clock.prototype.version = "1.01";
com.andres.TextClock.prototype.formatOutput = function(h,m,s,l) {
    return this.formatDigits(h) + " Hour " + this.formatDigits(m) + " Minutes " + this.formatDigits(s) + " Seconds " + l;
}


com.andres.AlarmClock = function(id, offset, label) {
    com.andres.Clock.apply(this,arguments);
    this.doUpdate = true;
    this.dom = document.getElementById(id);
    this.dom.contentEditable = true;
    var that = this;
    this.dom.addEventListener('focus', function(e){
        this.innerHTML = this.innerHTML.slice(0,this.innerHTML.lastIndexOf(':'));
        that.tick(false);
    });


    this.dom.addEventListener('blur', function(e){
        var a = this.innerHTML.split(":");
        that.almH = parseInt(a[0]);
        that.almM = parseInt(a[1]);
        if ((that.almH >= 0 && that.almH<24) && (that.almM >= 0 && that.almM < 60)) {
            var event = new Event("restart_tick");
            this.dispatchEvent(event);
        }
        
    });

    this.dom.addEventListener("restart_tick", function () {  
        that.tick(true);
    });
}

com.andres.AlarmClock.prototype = Object.create(com.andres.Clock.prototype);
com.andres.AlarmClock.prototype.constructor = com.andres.AlarmClock;
com.andres.AlarmClock.prototype.formatOutput = function(h,m,s,l) {
    if ( h==this.almH && m==this.almM) {
        return "Alarm WAKE UP";
    }
    else {
        return com.andres.Clock.prototype.formatOutput.apply(this,arguments);
    }
}


window.onload = onReady;


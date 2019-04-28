// Game assets have loaded
function loaded() {
    play();
}

// Play game
function play() {

    var el_images = document.getElementById('images');

    
    for(var i=0; i<num_antdecs; i++){
        var img_index = Math.floor(Math.random()*num_antdecs);
        var newAntDec = new AntDec(pick_antdec());
        newAntDec.add(el_images);
    }
}

// UI buttons
button_ant.addEventListener('click', function(e){
    e.preventDefault();
    button_handle(1);
});
button_dec.addEventListener('click', function(e){
    e.preventDefault();
    button_handle(2);
});


// Game assets
var antdecs = ['ant1', 'ant2', 'ant3', 'ant4', 'ant5', 'dec1', 'dec2', 'dec3', 'dec4', 'dec5'];
var num_antdecs = antdecs.length;

var last_index = 0;
function pick_antdec(){
    var img_index;
    do {
        img_index = Math.floor(Math.random()*num_antdecs);
    } while (img_index == last_index);

    last_index = img_index;
    return  antdecs[img_index];
}


// Multi-browser document load detection
// https://plainjs.com/javascript/events/running-code-when-the-document-is-ready-15/
if (document.readyState!='loading'){
    loaded();
}else if (document.addEventListener){
    document.addEventListener('DOMContentLoaded', loaded);
}else{
    document.attachEvent('onreadystatechange', function(){
        if (document.readyState=='complete') loaded();
    });
}

// Helper functions for classList access
function hasClass(el, className) {
    return el.classList ? el.classList.contains(className) : new RegExp('\\b'+ className+'\\b').test(el.className);
}

function addClass(el, className) {
    if (el.classList) el.classList.add(className);
    else if (!hasClass(el, className)) el.className += ' ' + className;
}

function removeClass(el, className) {
    if (el.classList) el.classList.remove(className);
    else el.className = el.className.replace(new RegExp('\\b'+ className+'\\b', 'g'), '');
}

// /////////////////////////////////
// // ANTDEC class                //
// /////////////////////////////////

class AntDec{
    constructor(img){
        this._rotation = (Math.random()*6)-3; // random angle between -3 and +3
        this._played  = false;
        this._answer = 0; // 0 = not assigned, 1 = ANT, 2 = DEC
        this._guess = 0;  // 0 = no guess, 1 = ANT, 2 = DEC
        this._was_correct = false;

        this._start_time = 0;

        this._img = img;
        this._obj = null;
        this.create_element();
    }

    create_element(){
        this._obj = document.createElement('div');
        this._obj.style.transform = 'rotate('+this._rotation+'deg)';
        this._obj.style['background-image'] = 'url(assets/antdecs/'+this._img+'.jpg)';
        addClass(this._obj, 'image');

        if(this._img.substr(0,3) == "ant"){
            this._answer == 1;
        }else if(this._img.substr(0,3) == "dec"){
            this._answer == 2;
        }
    }

    add(container){
        return container.appendChild(this._obj);
    }
    remove(){

    }
}
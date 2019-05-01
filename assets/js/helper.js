
// Cross-browser support for requestAnimationFrame
const w = window;
const requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;



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



// Multi-browser document load detection
// https://plainjs.com/javascript/events/running-code-when-the-document-is-ready-15/
function await_load(callback){
    if (document.readyState!='loading'){
        callback();
    }else if (document.addEventListener){
        document.addEventListener('DOMContentLoaded', callback);
    }else{
        document.attachEvent('onreadystatechange', function(){
            if (document.readyState=='complete'){
                callback();
            }
        });
    }
}


// Button press handler for mobile / desktop
// Uses jQuery PEP (polyfill for pointer events)
function attach_button_handler(button, callback){
    button.addEventListener('pointerdown', function(e){
        e.preventDefault();
        callback();
    });
    button.addEventListener('click', function(e){
        e.preventDefault();
    });
}

// Game assets have loaded
function loaded() {
    // Show play button?
}

var el_images      = document.getElementById('images');
var el_timing_bar  = document.getElementById('timing_bar');
var el_score       = document.getElementById('my_score');
var el_final_score = document.getElementById('final_score');

// Score details
var antdecs = [];
var score = {
    max_time: 2000,

    played: 0,
    current: 0,
    points: 0,

    playing: false
};

// Start game
function start_game() {

    // Populate initial ant+decs
    el_images.innerHTML = '';
    antdecs = [];
    for(var i=0; i<20; i++){
        add_antdec();
    }

    // Reset scores
    score.played = 0;
    score.current = 0;
    score.points = 0;
    
    // Reset HTML
    removeClass(document.body,"game_over");
    removeClass(document.body,"loaded");
    el_score.innerHTML = score.points;

    // Start game loop
    score.playing = true;
    antdecs[score.current].start_timer();
    game_loop();

}

// Play game
function game_loop() {

    var time_left = performance.now() - antdecs[score.current].get_start_time(); 

    if(time_left > score.max_time){
        game_over();
    }else{
        // Update timing bar
        var time_perc = (time_left/score.max_time)*100;
        el_timing_bar.style.height = time_perc+'%';
    } 
    
    // Do this loop again ASAP
    if(score.playing){
        requestAnimationFrame(game_loop);
    }
}


// Next image
function next_image(){
    antdecs[score.current].remove();

    var extra_points = Math.round( (score.max_time - (performance.now() - antdecs[score.current].get_start_time())) / 10);
    score.points += extra_points; // to avoid subtracting points from a rounding error 
    el_score.innerHTML = score.points;

    score.current++;
    antdecs[score.current].start_timer();
    score.played++;
}

// Game over
function game_over(){
    score.playing = false;

    addClass(document.body,"game_over");
    el_final_score.innerHTML = score.points;
}

// Add new antdec to stack
function add_antdec(){
    var newAntDec = new AntDec(pick_antdec());
    newAntDec.add(el_images);
    antdecs.push(newAntDec);
}

// UI buttons
button_start.addEventListener('touchend', function(e){
    e.preventDefault();
    start_game();
});
button_play_again.addEventListener('touchend', function(e){
    e.preventDefault();
    start_game();
});
button_ant.addEventListener('touchend', function(e){
    e.preventDefault();
    button_handle(1);
});
button_dec.addEventListener('touchend', function(e){
    e.preventDefault();
    button_handle(2);
});
function button_handle(antordec){
    antdecs[score.current].set_guess(antordec);
    if(antdecs[score.current].is_correct()){
        next_image();
    }else{
        game_over();
    }
}


// Game assets
var antdec_assets = ['ant1', 'ant2', 'ant3', 'ant4', 'ant5', 'dec1', 'dec2', 'dec3', 'dec4', 'dec5'];
var num_antdec_assets = antdec_assets.length;

var last_index = 0;
function pick_antdec(){
    var img_index;
    do {
        img_index = Math.floor(Math.random()*num_antdec_assets);
    } while (img_index == last_index);

    last_index = img_index;
    return  antdec_assets[img_index];
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
            this._answer = 1;
        }else if(this._img.substr(0,3) == "dec"){
            this._answer = 2;
        }
    }

    set_guess(guess){
        this._guess = guess;
        if(this._guess == this._answer){
            this._was_correct = true;
        }
    }
    start_timer(){
        this._start_time = performance.now();
        return this.get_start_time();
    }
    get_start_time(){
        return this._start_time;
    }

    is_correct(){
        return this._was_correct;
    }

    add(container){
        return container.insertBefore(this._obj, container.childNodes[0] || null);
    }
    remove(){
        return this._obj.parentNode.removeChild(this._obj);
    }
}
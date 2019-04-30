
// Game assets have loaded
function loaded() {
    // Show play button?

    console.log("Hello! 🙋 \n\n"+

    "If you know what you're doing, you can probably hack this game right here. \n"+
    "But remember, cheats are only cheating themselves. \n"+
    "So behave (and have fun)! \n \n"+
    "George");

    add_antdec_bg();
}

var num_antdecs_added = 0;
function add_antdec_bg(){
    if(!score.playing){
        var newAntDec = new AntDec(pick_antdec());
        var new_img = newAntDec.add(el_loading_images);
        new_img.style.left = ((Math.random()*el_loading_images.offsetWidth)-(110/2)) + 'px'; // to offset half way to the left
        new_img.style.top = ((Math.random()*el_loading_images.offsetHeight)-(150/2)) + 'px'; // to offset half way to the top
        new_img.style['z-index'] = num_antdecs_added;
    
        num_antdecs_added++;
    
        if(num_antdecs_added<50){
            new_img.style['animation'] = 'none';
            add_antdec_bg();
        }else{
            setTimeout(add_antdec_bg,1000);
        }
    }
}

var el_loading_images = document.getElementById('loading_images');
var el_images         = document.getElementById('images');
var el_timing_bar     = document.getElementById('timing_bar');
var el_score_adds     = document.getElementById('score_additions');
var el_score          = document.getElementById('my_score');
var el_final_score    = document.getElementById('final_score');
var el_actual_who     = document.getElementById('actual_who');


// Score details
var antdecs = [];
var score = {
    max_time: 1500,
    scaler: 50,

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
    for(var i=0; i<5; i++){
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
    el_loading_images.innerHTML = '';
    el_score_adds.innerHTML = '';
    num_antdecs_added = 0;

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

        // Set position
        el_timing_bar.style.height = time_perc+'%';
    } 
    
    // Do this loop again ASAP
    if(score.playing){
        requestAnimationFrame(game_loop);
    }
}


// Next image
function next_image(){

    // Update HTML display effects
    antdecs[score.current].remove();
    addClass(document.body,"bg_flash");
    setTimeout(function(){
        removeClass(document.body,"bg_flash");
    },150);

    // Add extra points to score
    var extra_points = Math.round( (score.max_time - (performance.now() - antdecs[score.current].get_start_time())) / score.scaler);
    score.points += extra_points; // to avoid subtracting points from a rounding error 
    el_score.innerHTML = score.points;

    // Add marker to show extra points
    var new_score_plus = document.createElement('div');
    new_score_plus.style['margin-left'] = (Math.random()*150 - 75) + 'px';
    new_score_plus.style.top = (Math.random()*30) + 'px';
    new_score_plus.innerHTML = "+" + extra_points;
    addClass(new_score_plus, 'new_score');
    el_score_adds.appendChild(new_score_plus); 

    // Load in next ant/dec and increment position counter
    score.current++;
    antdecs[score.current].start_timer();
    score.played++;

    // Add new one to stack
    add_antdec();
}

// Game over
function game_over(){
    score.playing = false;

    addClass(document.body,"game_over");
    el_final_score.innerHTML = score.points;
    if(antdecs[score.current].was_guessed()){
        el_actual_who.innerHTML = "that was " + antdecs[score.current].get_correct_name();
    }else{
        el_actual_who.innerHTML = "too slow";
    }
    
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
var antdec_assets = [];
for(var i=1; i<=20; i++){    // number of antdecs in folder
    antdec_assets.push('ant'+i);
    antdec_assets.push('dec'+i);
}
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

        this._img = img+'.jpg';
        this._obj = null;
        this.create_element();
    }

    create_element(){
        this._obj = document.createElement('div');
        this._obj.style.transform = 'rotate('+this._rotation+'deg)';
        this._obj.style['background-image'] = 'url(assets/antdecs/'+this._img+')';
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
    get_correct_name(){
        if(this._answer == 1){
            return "Ant";
        }else if(this._answer == 2){
            return "Dec";
        }else{
            return "???";
        }
    }

    is_correct(){
        return this._was_correct;
    }
    was_guessed(){
        return (this._guess > 0) ? true : false;
    }

    add(container){
        return container.insertBefore(this._obj, container.childNodes[0] || null);
    }
    remove(){
        return this._obj.parentNode.removeChild(this._obj);
    }
}
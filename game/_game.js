
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
    if(!rules.playing){
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
var el_end            = document.getElementById('end');
var el_final_score    = document.getElementById('final_score');
var el_actual_who     = document.getElementById('actual_who');


// Score details
var antdecs = [];
var score = {
    played: 0,
    points: 0
};
var rules = {
    max_time: 1500,
    curr_max_time: 0,
    scaler: 50,
    current: 0,

    playing: false
}

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
    score.points = 0;
    rules.current = 0;
    rules.curr_max_time = rules.max_time;
    num_antdecs_added = 0;
    
    // Reset HTML
    removeClass(document.body,"game_over");
    removeClass(document.body,"loaded");
    el_score.innerHTML = score.points;
    el_loading_images.innerHTML = '';
    el_score_adds.innerHTML = '';
    // TODO: Remove end game ant/dec here as well

    // Start game loop
    rules.playing = true;
    antdecs[rules.current].start_timer();
    game_loop();

}

// Play game
function game_loop() {

    var time_left = performance.now() - antdecs[rules.current].get_start_time(); 

    if(time_left > rules.curr_max_time){
        game_over();
    }else{
        // Update timing bar
        var time_perc = (time_left/rules.curr_max_time)*100;

        // Set position
        el_timing_bar.style.height = time_perc+'%';
    } 
    
    // Do this loop again ASAP
    if(rules.playing){
        requestAnimationFrame(game_loop);
    }
}


// Next image
function next_image(){

    // Update HTML display effects
    antdecs[rules.current].remove();
    addClass(document.body,"bg_flash");
    setTimeout(function(){
        removeClass(document.body,"bg_flash");
    },150);

    // Add extra points to score
    var extra_points = Math.round( (rules.max_time - (performance.now() - antdecs[rules.current].get_start_time())) / rules.scaler);
    score.points += extra_points; // to avoid subtracting points from a rounding error 
    el_score.innerHTML = score.points;

    // Make next round a little faster
    rules.curr_max_time -= 5;

    // Add marker to show extra points
    var new_score_plus = document.createElement('div');
    new_score_plus.style['margin-left'] = (Math.random()*150 - 75) + 'px';
    new_score_plus.style.top = (Math.random()*30) + 'px';
    new_score_plus.innerHTML = "+" + extra_points;
    addClass(new_score_plus, 'new_score');
    el_score_adds.appendChild(new_score_plus); 

    // Load in next ant/dec and increment position counter
    rules.current++;
    antdecs[rules.current].start_timer();
    score.played++;

    // Add new one to stack
    add_antdec();
}

// Game over
function game_over(){
    rules.playing = false;

    addClass(document.body,"game_over");
    el_final_score.innerHTML = score.points;
    antdecs[rules.current].add(el_end);

    if(antdecs[rules.current].was_guessed()){
        el_actual_who.innerHTML = "Oops, that was " + antdecs[rules.current].get_correct_name() +'!';
    }else{
        el_actual_who.innerHTML = "Too slow, it was " + antdecs[rules.current].get_correct_name() +'!';
    }
    
}

// Add new antdec to stack
function add_antdec(){
    var newAntDec = new AntDec(pick_antdec());
    newAntDec.add(el_images);
    antdecs.push(newAntDec);
}

// UI buttons for start/restart
attach_button_handler(button_start,start_game);
attach_button_handler(button_play_again,start_game);

// UI buttons for antdec handling
attach_button_handler(button_ant,function(){
    button_handle(1);
});
attach_button_handler(button_dec,function(){
    button_handle(2);
});
function button_handle(antordec){
    antdecs[rules.current].set_guess(antordec);
    if(antdecs[rules.current].is_correct()){
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

await_load(loaded);
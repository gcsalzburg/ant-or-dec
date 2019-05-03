// /////////////////////////////////
// // ANTorDEC Game               //
// /////////////////////////////////

// References to HTML game objects
var el_loading_images = document.getElementById('loading_images');
var el_images         = document.getElementById('images');
var el_timing_bar     = document.getElementById('timing_bar');
var el_score_adds     = document.getElementById('score_additions');
var el_score          = document.getElementById('my_score');
var el_end            = document.getElementById('end');
var el_final_score    = document.getElementById('final_score');
var el_actual_who_image = document.getElementById('actual_who_image');
var el_actual_who     = document.getElementById('actual_who');
var el_button_add_highscore = document.getElementById('button_add_highscore');

// Game objects
var antdec_assets = [];
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

    speed_increaser:5,

    last_antdec_index: 0,

    playing: false
}

// ///////////////////////////////////////////////////// //
// // Main game loop:                                    //
// // loaded()                                           //
// //  -> start_game                                     //
// //   -> game_loop()                                   //
// //     -> game_over()                                 //
// ///////////////////////////////////////////////////// //

// Call loaded() when page is ready
await_load(loaded);

// Game assets have loaded
function loaded() {
    
    // Load in array of ant dec images
    for(var i=1; i<=20; i++){    // number of antdecs in folder
        antdec_assets.push('ant'+i);
        antdec_assets.push('dec'+i);
    }

    // Add submit handler for highscore table
    document.getElementById("score_form").addEventListener("submit",function(e){
        e.preventDefault();
        send_score();
    });

    // Add message to naughty hackers
    console.log("Hello! 🙋 \n\n"+
    "If you know what you're doing, you can probably hack this game right here. \n"+
    "But remember, cheats are only cheating themselves. \n"+
    "So behave (and have fun)! \n \n"+
    "George");

    // Push first background image to homepage
    add_antdec_bg();
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
    score.played = score.points = rules.current = num_antdecs_added = 0;
    rules.curr_max_time = rules.max_time;
    
    // Reset HTML
    set_body_state("is_playing");
    removeClass(document.getElementById('end_highscore'),"show_play_again");
    removeClass(document.getElementById('end'),"hide_highscore_submit");
    el_score.innerHTML = score.points;
    el_loading_images.innerHTML = '';
    el_score_adds.innerHTML = '';
    el_actual_who_image.innerHTML = '';

    // Start game loop
    rules.playing = true;
    antdecs[rules.current].start_timer();
    game_loop();
}

// Play game
function game_loop() {

    // Check for keyboard presses
    check_keys();

    // Get time for left to play this antdec
    var time_left = performance.now() - antdecs[rules.current].get_start_time(); 

    if(time_left > rules.curr_max_time){
        game_over();
    }else{
        // Update timing bar position
        el_timing_bar.style.height = ((time_left/rules.curr_max_time)*100)+'%';
    } 
    
    // Do this loop again ASAP
    if(rules.playing){
        requestAnimationFrame(game_loop);
    }
}

// Game over
function game_over(){
    rules.playing = false;

    set_body_state("is_game_over");
    el_final_score.innerHTML = Math.round(score.points);
    antdecs[rules.current].add(el_actual_who_image);

    if(score.points <= 0){
        addClass(document.getElementById('end'),"hide_highscore_submit");
    }

    if(antdecs[rules.current].was_guessed()){
        el_actual_who.innerHTML = "Oops, that was " + antdecs[rules.current].get_correct_name() +'!';
    }else{
        el_actual_who.innerHTML = "Too slow, it was " + antdecs[rules.current].get_correct_name() +'!';
    } 
}

// ///////////////////////////////////////////////////// //
// // Gameplay                                           //
// ///////////////////////////////////////////////////// //

// Select a random ant or dec, that wasn't the last one we selected
function pick_antdec(){
    var img_index;
    do {
        img_index = Math.floor(Math.random()*antdec_assets.length);
    } while (img_index == rules.last_antdec_index);

    rules.last_antdec_index = img_index;
    return  antdec_assets[img_index];
}

// Add new antdec to stack
function add_antdec(){
    var newAntDec = new AntDec(pick_antdec());
    newAntDec.add(el_images);
    antdecs.push(newAntDec);
}

// When a button or keyboard is pressed
function ant_dec_guessed(antordec){
    antdecs[rules.current].set_guess(antordec);
    if(antdecs[rules.current].is_correct()){
        next_image();
    }else{
        game_over();
    }
}

// Triggers when antdec was correctly guessed
function next_image(){

    // Update HTML display effects
    antdecs[rules.current].remove();
    addClass(document.body,"bg_flash");
    setTimeout(function(){
        removeClass(document.body,"bg_flash");
    },150);

    // Add extra points to score
    var extra_points = (rules.max_time - (performance.now() - antdecs[rules.current].get_start_time())) / rules.scaler;
    score.points += extra_points; // to avoid subtracting points from a rounding error 
    el_score.innerHTML = Math.round(score.points);

    // Make next round a little faster
    rules.curr_max_time -= rules.speed_increaser;

    // Add marker to show extra points
    var new_score_plus = document.createElement('div');
    new_score_plus.style['margin-left'] = (Math.random()*150 - 75) + 'px';
    new_score_plus.style.top = (Math.random()*30) + 'px';
    new_score_plus.innerHTML = "+" + Math.round(extra_points);
    addClass(new_score_plus, 'new_score');
    el_score_adds.appendChild(new_score_plus); 

    // Load in next ant/dec and increment position counter
    rules.current++;
    antdecs[rules.current].start_timer();
    score.played++;

    // Add new one to stack
    add_antdec();
}

// ///////////////////////////////////////////////////// //
// // Highscore control                                  //
// ///////////////////////////////////////////////////// //

function show_highscore(){
    addClass(document.body,"is_highscore");
    document.getElementById('final_highscore').innerHTML = Math.round(score.points);

    document.getElementById("score_table_tbl").getElementsByTagName('tbody')[0].innerHTML = "<tr><td>Loading...</td><td></td></tr>";
    
    // Load highscore table
    fetch_scores();
}

function send_score(){

    postAjax(
        'https://scores.designedbycave.co.uk/a/DydrPV3XLzkZJ9pwoVbA/',
        {
            score: score.points,
            user: document.getElementById("name").value
        },
        function(data){
            try{
                var json = JSON.parse(data);
                if(!json.error){
                    addClass(document.getElementById('end_highscore'),"show_play_again");
                    fetch_scores(parseInt(json.my_row));
                }
            }catch{
                console.log("Score response parse error");
            }
        }
    );
}

function fetch_scores(my_row){
    getCORS('https://scores.designedbycave.co.uk/f/DydrPV3XLzkZJ9pwoVbA/', function(request){
        var data = request.currentTarget.response || request.target.responseText;
        try{
            var json = JSON.parse(data);
            var scores = json.scores;
    
            // Empty table first
            document.getElementById("score_table_tbl").getElementsByTagName('tbody')[0].innerHTML = "";
    
            for (var i=0, len=scores.length; i < len; i++) {
                var classname = "";
                if((my_row>0) && (my_row == parseInt(scores[i].id))){
                    classname = "my_row";
                }
                document.getElementById("score_table_tbl").getElementsByTagName('tbody')[0].innerHTML += '<tr class="'+classname+'"><td>'+scores[i].rank+'</td><td>'+scores[i].user+'</td><td>'+Math.round(scores[i].score)+'</td></tr>';
    
            }
        }catch{
            console.log("Highscore table parse error");
        }
       
    });
}

// ///////////////////////////////////////////////////// //
// // UI controls                                        //
// ///////////////////////////////////////////////////// //

// UI buttons for start/restart
attach_button_handler(button_start,start_game);
attach_button_handler(button_play_again,start_game);
attach_button_handler(button_play_again2,start_game);


// UI buttons for antdec handling
attach_button_handler(button_ant,function(){
    ant_dec_guessed(1);
});
attach_button_handler(button_dec,function(){
    ant_dec_guessed(2);
});

// Highscore buttons
attach_button_handler(button_add_highscore,show_highscore);

// Keyboard handling

var keysDown = {};
var keysUp = {};

addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
    keysUp[e.keyCode] = true;
}, false);

check_keys = function(){
    // Handle key presses
    if(65 in keysDown){         // A
        delete keysDown[65];
        ant_dec_guessed(1);
    }else if(68 in keysDown){   // D
        delete keysDown[68];
        ant_dec_guessed(2);
    }
}


// ///////////////////////////////////////////////////// //
// // Homepage graphics animation effects                //
// ///////////////////////////////////////////////////// //

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


// ///////////////////////////////////////////////////// //
// // Helpers                                            //
// ///////////////////////////////////////////////////// //

function set_body_state(state){
    removeClass(document.body,"is_game_over");
    removeClass(document.body,"is_start");
    removeClass(document.body,"is_highscore");
    removeClass(document.body,"is_playing");
    addClass(document.body,state);
}
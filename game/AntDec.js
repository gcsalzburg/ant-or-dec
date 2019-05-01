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
        this._img_path = 'assets/antdecs/';
        this._obj = null;
        this.create_element();
    }

    create_element(){
        this._obj = document.createElement('div');
        this._obj.style.transform = 'rotate('+this._rotation+'deg)';
        this._obj.style['background-image'] = 'url('+this._img_path+this._img+')';
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
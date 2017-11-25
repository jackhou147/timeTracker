//this is the static js file sent to the front end
//'view' refers to html page
//'$view_' refers to a DOM object or Jquery object, as opposed
//to some data values. Ex: '$("div")'' vs '44'
//Note: for the variable called time_diff: ex:user pauses timer at 00:00:06;
//user resumes timer; 30 seconds later user pauses again; so the time_diff in
//this case is gonna be 30, this 30 seconds is what we send to the server

//---------------------CONSTANTS---------------------------------
const $view_clock = {
    $hour: $(".timer__hours"),
    $minute:$(".timer__minutes"),
    $second: $(".timer__seconds")
};


//-------------------click handlers------------------------------
//click handler for /app timer :  
(function(form, $clock, button){
    //Nov 22 Note: $clock is an object for now.
    
    //------------variables----------------
    var timerOn = false;    //default value, toggle when clicked
    var interval;           //interval to be turned on/off
    let time_passed = {
        hours: Number($clock.$hour.html()),
        minutes: Number($clock.$minute.html()),
        seconds: Number($clock.$second.html()) 
    };
    var time_diff;  //difference between two timer pauses. 
    
    //----------------process----------------
    //set cookie
    Cookies.set("timePassed", 0);
    //attach event listeners
    button.click(toggleTimer); 
    form.submit(handleSubmit);
    
    //----------------function definitions----------------
    function toggleTimer(){
        /*
        Purpose: 
            1. toggles the timer:on/off
            2. if button off, submit data to server w/o refreshing
        */
        
        //process...
        timerOn = timerOn ? false : true;   //toggle timerOn
        if(timerOn){
            console.log("timerOn");
            //1. change button text
            button.html("stop timer");
            //2. start interval
            interval = setInterval(function(){
                //every second, 
                //increment clock by 1sec, then update the view
                time_increment(
                    time_passed, 1, 
                    render_clock, {data: time_passed, view: $clock}
                );  
                
            },1000);
        }else{
            console.log("timer off")
            //1. terminate interval
            clearInterval(interval);
            //2. set cookie
            time_diff = all_to_seconds(time_passed.hours,time_passed.minutes,time_passed.seconds) - Cookies.get("timePassed");
            Cookies.set("timePassed", all_to_seconds(time_passed.hours,time_passed.minutes,time_passed.seconds))
            //3. submit form
            form.submit();
            //4. change button text
            button.html("start timer");
        }
    }
    
    function handleSubmit(e){
        /*
        Purpose: submit {time_passed, subject_name} to server without reloading the page.
        Pre-condition: Jquery
        */
        
        console.log("submit form!");
        console.log(Cookies.get("timePassed"))
        //variables...
        let formData = {    //data to be submitted
            subjectName: $(".subjects-table .active a").html(),    
            timePassed: time_diff
        };
        
        //process...
        //submit post request to server
        $.ajax({
            type        : 'POST', 
            url         : '/app', //send POST request to /app
            data        : formData, //submit formData along with the request
        })
        .done((response) =>{
            console.log("server response:",response);
        })
        
        // prevent the page from refreshing
        return false;
    }
    
})($(".timerForm"), $view_clock, $('.timerForm__toggle-timer'));



//click handler for /app subject-table:  
(function($table){
    //------------variables----------------
    //  left and right buttons
    const $btnLeft = $table.find("i.material-icons").eq(0); 
    const $btnRight= $table.find("i.material-icons").eq(1);
    //  all the li elements except for the left and right buttons
    const $li_arr = $table.find("li:not(.subjects-table__btn)");
    
    //----------------process----------------
    //add click handler to buttons
    $btnLeft.click(goLeft);
    $btnRight.click(goRight);
    $li_arr.click(resetActive);
    
    //----------------function definitions----------------
    function goLeft(){
        /*
        Purpose: table active element is set to the one on the left of 
        current element, or the first one on the right if current element
        is at left most position
        Pre-condition: valid DOM object is given
        */
        
        //variables...
        let cursor = $li_arr.index($("li.active")); //index of the current active element
        let arr_len = $li_arr.length;
        
        //process...
        //1. remove the active class from current active element
        $li_arr[cursor].classList.remove("active");
        //2. subtract 1 from cursor, if new cursor < 0 set cursor to be first on the right
        cursor = (--cursor) > -1 ? cursor : arr_len - 1;
        //3. set the element at the new cursor position to be active
        $li_arr[cursor].classList.add("active");
    }
    
    function goRight(){
        /*
        Purpose: table active element is set to the one on the left of 
        current element, or the first one on the right if current element
        is at left most position
        Pre-condition: valid DOM object is given
        */
        
        //variables...
        let cursor = $li_arr.index($("li.active")); //index of the current active element
        let arr_len = $li_arr.length;
        console.log("arr_len: ",arr_len);
        
        //process...
        //1. remove the active class from current active element
        $li_arr[cursor].classList.remove("active");
        //2. add 1 from cursor, if new cursor >= arr_len set cursor to be first on the left
        cursor = (++cursor) >= arr_len ? 0 : cursor;
        //3. set the element at the new cursor position to be active
        $li_arr[cursor].classList.add("active");
        
    }
    
    function resetActive(){
        /*
        Purpose: set the clicked element to be active, remove
        the active class from the previous element
        */
        //variables...
        let prev_el = $table.find("li.active"); //previous active element
        let new_el = $(this);  //new active element
        
        //process...
        prev_el.removeClass("active");
        new_el.addClass("active");
        //output...
    }
    
})($(".subjects-table"))




//---------------utility functions------------------------------
function all_to_seconds(hr,min,sec){
    /*
    Purpose: convert hr/min/sec to seconds only
    Pre-condition: hr/min/sec must be positive integers.
    Post-condition: an integer is returned
    Note: 
        example: 1 hour 2 minutes 3 seconds --> 3723 seconds
    */
    
    //variables...
    var result;
    //process...
    result = (3600 * hr) + (60 * min) + sec;
    //output...
    return result;
}

function time_increment(units,amt, _callback, _cb_params){
    /*
    Purpose: given a time, increment by amt
    Note: example: 8:43:20 -->increment 1 second --> 8:43:21
    Pre-condition:
        //1. given an object of 3 units: {hr,min,sec}, 
        //2. given an amount of seconds to increment; 
        //3. given a callback function and parameters for it(optional)
        //4. parameters for callback is in an object
    Post-condition: units object is incremented.
    */
    
    //Note: this is not done yet
    units.seconds += amt;
    
    //callback
    if(_callback)
        _callback(_cb_params.data, _cb_params.view);
}

function render_clock(data,view){
    /*
    Purpose: put data(hr,min,sec) into view(DOM objects)
    Pre-condition: 
        1. data is an object: {hr: , min: , sec: }
        2. view is an object: {$hr: $min: , $sec: }
    Note: 
        1. In the key-value pair of view object, value is DOM jquery objects.
            Ex: $("div")
        2. In data object, value is of integer type. Ex: 1,2,3,...
    */
    
    //variables...
    var $second = data.seconds;
    var $minute = data.minutes;
    var $hour = data.hours;
    
    //process...
    //1. if less than 10, put a zero in front as a placeholder
    if($second < 10)
        $second = "0" + $second;
    if($minute < 10)
        $minute = "0" + $minute;
    if($hour < 10)
        $hour = "0" + $hour;
    //2. render to html
    view.$second.html($second);
    view.$minute.html($minute);
    view.$hour.html($hour);
}
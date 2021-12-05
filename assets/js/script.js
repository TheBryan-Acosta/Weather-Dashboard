var searchForm = document.getElementById("citySearch");

//load local storage
loadLocalStorage();
function loadLocalStorage(){
    //assign Localstorage arr to a variable
    var histNames = JSON.parse(localStorage.getItem('searchHistory'));

    //check if histNames is a valid variable
    if(histNames){
        //iterate from the last index to the first
        for(i=histNames.length - 1; i >= 0 ; i--){
            //pass the city name at the specific index to button creation function
            addToHistory(histNames[i]);
        }
    }

};

//Current Weather Data Call
function GetCurrentWeatherData(lat,lon){
    var apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat='+lat+'&lon='+lon+'&exclude=minutely,hourly,alerts&units=imperial&appid=5a204b8bb4ef44421eed155c5a0fefac';

    fetch(apiUrl).then(function(response) {
        if (response.ok){
            response.json().then(function(data) {
                //pass weather data to display
                displayCurrentWeatherData(data);
            });
        }
        
    })
    .catch(function(error) {
    alert("Unable to connect to Weather Data");
    });
};

//get city long and lat from cityName call
function GetLatLong(cityName){
    var apiUrl = 'https://api.openweathermap.org/geo/1.0/direct?q=' + cityName + '&limit=1&appid=5a204b8bb4ef44421eed155c5a0fefac';

    fetch(apiUrl).then(function(response) {
        if (response.ok){
            response.json().then(function(data) {
                // checks if input was valid(data was aquired)
                if(data.length != 0){
                //set the current weather header to city name and current date
                $("#curC").text(data[0].name + ' ' + moment().format('L'));
                // pass latitude and longitude to openWeather call
                GetCurrentWeatherData(data[0].lat, data[0].lon);
                // create a history button with city name
                addToHistory(data[0].name);
                }
                // rejects input and alerts user of a invalid input
                else{
                    alert("Enter a valid city name!");
                }
                
            });
        }
    })
    .catch(function(error) {
    alert("Unable to connect to Weather Data");
    });
};

//on submit form
function formHandler(event) {
    event.preventDefault();
    var cityName = document.getElementById("cityname").value.trim();

    if(cityName){
        GetLatLong(cityName);
    }
    else{
        alert("Please enter a City name");
    }
}


searchForm.addEventListener("submit", formHandler);

//fill current weather data
function displayCurrentWeatherData(weatherData){

    // delete any uv El on new form submit
    $(".uvExist").each(function(){
       $(this).remove();
   });
   // set our list text to temp,windspeed, and humidity
    var listEl = document.querySelector('ul');
    $("#curT").text('Temperature: ' + weatherData.current.temp + ' F');
    $("#curW").text('Windspeed: ' + weatherData.current.wind_speed + ' MPH');
    $("#curH").text('Humidity: '+ weatherData.current.humidity +'%');

    // create our image tag and append to our header
    var cityNameEl = document.querySelector('#curC');
    var Image = document.createElement('img');
    Image.setAttribute("src", 'https://openweathermap.org/img/wn/'+ weatherData.current.weather[0].icon + '.png');
    cityNameEl.appendChild(Image);

    //Here we create our uv index list item
    var UVI = document.createElement("li");
    UVI.setAttribute("class", "uvExist");
    var UVI_COLORBOX = document.createElement("span");
        UVI_COLORBOX.textContent =  weatherData.current.uvi;

        //here is where we set the RED and GREEN color values based on our uv index
        if(weatherData.current.uvi >= 5){
            var UVI_RED = 255;
            var UVI_GREEN = 255 - (((weatherData.current.uvi) - 5)*51);
        }

        else if(weatherData.current.uvi < 5){
            var UVI_RED = 0  + ((weatherData.current.uvi)*51);
            var UVI_GREEN = 255;
        }

        //set css rgb(r,g,b) for the span background color
        UVI_COLORBOX.style.cssText = 'background-color: rgb('+ UVI_RED +', '+UVI_GREEN+', 51)';
        

        //append span to Uv list item
        UVI.textContent = "UV Index: ";
        UVI.appendChild(UVI_COLORBOX);

        //append uv list item to our list
        listEl.appendChild(UVI);
    
    displayFiveDayWeather(weatherData.daily)
}


// here we create our five day forcast boxes
function displayFiveDayWeather(WD){
    $('#showForecast').text('Five day forecast');
    //remove any past boxes
   $(".forebox").each(function(){
       $(this).remove();
   });

    var fivecontainer = document.getElementById("fivedaycontainer");

    // create our tag, set its respective text from our weather data on its index
    // since index 0 is our current day, start at the next index.
    // append the tags to our div, with proper classes for bootstrap
    // again for the uv index color is on a scale from 1-10 (red is 10)
    for(i=1; i < 6;i++){
        var forecast_container = document.createElement("div");
        var Temp = document.createElement("p");
        var Wind = document.createElement("p");
        var Humidity = document.createElement("p");
        var UVI = document.createElement("p");
        var CurrentDate = document.createElement("h4");
        var WeatherIcon = document.createElement("img");
        CurrentDate.textContent = moment().add(i, 'days').format('L');


        forecast_container.appendChild(CurrentDate);

        WeatherIcon.src = 'https://openweathermap.org/img/wn/'+ WD[i].weather[0].icon + '.png';
        WeatherIcon.className = "ForeIcon";
        forecast_container.appendChild(WeatherIcon);

        Temp.textContent = 'Temp: ' + WD[i].temp.day + " °F"
        forecast_container.appendChild(Temp);

        Wind.textContent = "Wind Speed: " + WD[i].wind_speed + "MPH"
        forecast_container.appendChild(Wind);

        Humidity.textContent = "Humidity: " + WD[i].humidity + "%"
        forecast_container.appendChild(Humidity);

        var UVI_COLORBOX = document.createElement("span");
        UVI_COLORBOX.textContent =  WD[i].uvi;

        if(WD[i].uvi >= 5){
            var UVI_RED = 255;
            var UVI_GREEN = 255 - (((WD[i].uvi) - 5)*51);
        }

        else if(WD[i].uvi < 5){
            var UVI_RED = 0  + ((WD[i].uvi)*51);
            var UVI_GREEN = 255;
        }

        UVI_COLORBOX.style.cssText = 'background-color: rgb('+ UVI_RED +', '+UVI_GREEN+', 51)';
        

        UVI.textContent = "UV Index: ";
        UVI.appendChild(UVI_COLORBOX);

        forecast_container.appendChild(UVI);
        
        forecast_container.setAttribute("class", "forebox col-11 col-lg-2");

        $(fivecontainer).append(forecast_container);
    }
    
}

// here I try to make the non repeating history buttons, to keep clutter off the page
function addToHistory(cityName){
    //create our button element
    var new_search =  document.createElement('button');
    var history_container = document.getElementById('prevSearch')
    new_search.className = "btn pastbtn col-12";
    new_search.textContent = cityName;

     var allPrev = history_container.querySelectorAll(".pastbtn");
   
    //if there are buttons already
    if(allPrev[0]){
        //dont do anything if the previous search is the same (we dont want stacking history of the same city)
        if(allPrev[0].textContent == new_search.textContent){
        }

        else {
            //remove any city thats the same before we add it to our history
            $( '.pastbtn:contains(' + new_search.textContent + ')' ).remove();
            history_container.insertBefore(new_search, history_container.firstChild);
            //Now we update our local storage
            StoreToLocal();
        }
     }
     // if there are no history buttons
    else{
        history_container.insertBefore(new_search, history_container.firstChild);
        StoreToLocal();
    }
    //clear our form
    $('#cityname').val('');
};

//create a variable to get all our city names and push it to our local storage in an array;
function StoreToLocal(){
    var searchHistory = [];
    $(".pastbtn").each(function(){
        searchHistory.push($(this).text());
    });

    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

//on history button click, send to display our data
$( "#prevSearch" ).on( "click", ".pastbtn", function() {
  GetLatLong($( this ).text());
});
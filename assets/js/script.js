var searchForm = document.getElementById("citySearch");

loadLocalStorage();
function loadLocalStorage(){
    var histNames = JSON.parse(localStorage.getItem('searchHistory'));
    if(histNames){
        for(i=histNames.length - 1; i >= 0 ; i--){
            addToHistory(histNames[i]);
        }
    }

};

//Current Weather Data Call
function GetCurrentWeatherData(cityName,lat,lon){
    var apiUrl = 'https://api.openweathermap.org/data/2.5/onecall?lat='+lat+'&lon='+lon+'&exclude=minutely,hourly,alerts&units=imperial&appid=5a204b8bb4ef44421eed155c5a0fefac';

    fetch(apiUrl).then(function(response) {
        if (response.ok){
            response.json().then(function(data) {
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
    var apiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + cityName + '&limit=1&appid=5a204b8bb4ef44421eed155c5a0fefac';

    fetch(apiUrl).then(function(response) {
        if (response.ok){
            response.json().then(function(data) {

                if(data.length != 0){
                $("#curC").text(data[0].name + ' ' + moment().format('L'));
                GetCurrentWeatherData(cityName, data[0].lat, data[0].lon);
                addToHistory(data[0].name);
                }

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

//on submit
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

    $(".uvExist").each(function(){
       $(this).remove();
   });

    var listEl = document.querySelector('ul');
    $("#curT").text('Temperature: ' + weatherData.current.temp + ' F');
    $("#curW").text('Windspeed: ' + weatherData.current.wind_speed + ' MPH');
    $("#curH").text('Humidity: '+ weatherData.current.humidity +'%');

    var cityNameEl = document.querySelector('#curC');
    var Image = document.createElement('img');
    Image.setAttribute("src", 'http://openweathermap.org/img/wn/'+ weatherData.current.weather[0].icon + '.png');
    cityNameEl.appendChild(Image);

    var UVI = document.createElement("li");
    UVI.setAttribute("class", "uvExist");
    var UVI_COLORBOX = document.createElement("span");
        UVI_COLORBOX.textContent =  weatherData.current.uvi;

        if(weatherData.current.uvi >= 5){
            var UVI_RED = 255;
            var UVI_GREEN = 255 - (((weatherData.current.uvi) - 5)*51);
        }

        else if(weatherData.current.uvi < 5){
            var UVI_RED = 0  + ((weatherData.current.uvi)*51);
            var UVI_GREEN = 255;
        }

        UVI_COLORBOX.style.cssText = 'background-color: rgb('+ UVI_RED +', '+UVI_GREEN+', 51)';
        

        UVI.textContent = "UV Index: ";
        UVI.appendChild(UVI_COLORBOX);

        listEl.appendChild(UVI);
    
    displayFiveDayWeather(weatherData.daily)
}



function displayFiveDayWeather(WD){
    $('#showForecast').text('Five day forecast');
   $(".forebox").each(function(){
       $(this).remove();
   });

    var fivecontainer = document.getElementById("fivedaycontainer");
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

        WeatherIcon.src = 'http://openweathermap.org/img/wn/'+ WD[i].weather[0].icon + '.png';
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

function addToHistory(cityName){
    var new_search =  document.createElement('button');
    var history_container = document.getElementById('prevSearch')
    new_search.className = "btn pastbtn col-12";
    new_search.textContent = cityName;

     var allPrev = history_container.querySelectorAll(".pastbtn");
   
    if(allPrev[0]){
        if(allPrev[0].textContent == new_search.textContent){
        }

        else {
            $( '.pastbtn:contains(' + new_search.textContent + ')' ).remove();
            history_container.insertBefore(new_search, history_container.firstChild);
            StoreToLocal();
        }
     }

    else{
        history_container.insertBefore(new_search, history_container.firstChild);
        StoreToLocal();
    }

    $('#cityname').val('');
};

function StoreToLocal(){
    var searchHistory = [];
    $(".pastbtn").each(function(){
        searchHistory.push($(this).text());
    });

    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
}

$( "#prevSearch" ).on( "click", ".pastbtn", function() {
  GetLatLong($( this ).text());
});
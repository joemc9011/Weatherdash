$(window).on('load', function () {
    currentLocation();
    checkLocalStorage();
});
var APIKey = "509ece257c59959a170b0423c0230609";
var que = "";
var now = moment();
var currentDate = now.format('MMMM Do YYYY');
var currentTime= now.format ( 'h:mm A')
$("#currentDay").text(currentDate);
$("#currentTime").text(currentTime);

$("#search-button").on("click", function (event) {
    event.preventDefault();

    que = $("#city-input").val();
    if (que === '') {
        return alert('Please Enter Valid City Name! ');
    }
    getWeather(que);

    saveToLocalStorage(que);
});

function createRecentSearchBtn(que) {
    var newLi = $("<li>")
    var newBtn = $('<button>');
    newBtn.attr('id', 'extraBtn');
    newBtn.addClass("button is-small recentSearch");
    newBtn.text(que);
    newLi.append(newBtn)
    $("#historyList").prepend(newLi);
    $("#extraBtn").on("click", function () {
        var newcity = $(this).text();
        getWeather(newcity);
    });
}

function convertToC(fahrenheit) {
    var fTempVal = fahrenheit;
    var cTempVal = (fTempVal - 32) * (5 / 9);
    var celcius = Math.round(cTempVal * 10) / 10;
    return celcius;
  }

function getWeather(que) {
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + que + "&units=imperial&appid=" + APIKey;
    $.ajax({
        url: queryURL,
        method: "GET",
        error: (err => {
            alert("Your city was not found. Check your spelling or enter a city code")
            return;
          })
    }).then(function (response) {
        console.log(response)
        $("#cityList").empty()
        $("#days").empty()
        var celcius = convertToC(response.main.temp);
        var cityMain1 = $("<div col-12>").append($("<h2>" + response.name + ' (' + currentDate + ')' + "</h2>"));
        var image = $('<img class="imgsize">').attr('src', 'http://openweathermap.org/img/w/' + response.weather[0].icon + '.png');     
        var degreeMain = $('<p>').text('Temperature : ' + response.main.temp + ' °F (' + celcius + '°C)');
        var humidityMain = $('<p>').text('Humidity : ' + response.main.humidity + '%');
        var windMain = $('<p>').text('Wind Speed : ' + response.wind.speed + 'MPH');       
        var uvIndexcoord = '&lat=' + response.coord.lat + '&lon=' + response.coord.lon;
        var cityId = response.id;

        displayUVindex(uvIndexcoord);
        displayForecast(cityId);

        cityMain1.append(image).append(degreeMain).append(humidityMain).append(windMain);
        $('#cityList').empty();
        $('#cityList').append(cityMain1);
    });
}
function displayUVindex(uv) {
    $.ajax({ // 
        url: "https://api.openweathermap.org/data/2.5/uvi?appid=" + APIKey + uv,
        method: "GET"
    }).then(function (response) {
        var UVIndex = $("<p><span>");
        UVIndex.attr("class", "badge badge-danger");
        UVIndex.text(response.value);
        $("#cityList").append('UV-Index : ').append(UVIndex);       
    });
}

//function to Display 5 Day forecast
function displayForecast(c) {
    $.ajax({ 
        url: "https://api.openweathermap.org/data/2.5/forecast?id=" + c + "&units=imperial&APPID=" + APIKey,
        method: "GET",
    }).then(function (response) {

        var arrayList = response.list;
        for (var i = 0; i < arrayList.length; i++) {
            if (arrayList[i].dt_txt.split(' ')[1] === '12:00:00') {
                console.log(arrayList[i]);
                var celcius = convertToC(arrayList[i].main.temp);
                var cityMain = $('<div>');
                cityMain.addClass('col forecast bg-primary text-white ml-3 mb-3 rounded>' );
                var date5 = $("<h6>").text(response.list[i].dt_txt.split(" ")[0]);
                var image = $('<img>').attr('src', 'http://openweathermap.org/img/w/' + arrayList[i].weather[0].icon + '.png');
                var degreeMain = $('<p>').text('Temp : ' + arrayList[i].main.temp + ' °F ('+ celcius + '°C)');               
                var humidityMain = $('<p>').text('Humidity : ' + arrayList[i].main.humidity + '%');
                var windMain = $('<p>').text('Wind Speed : ' + arrayList[i].wind.speed + 'MPH');                
                cityMain.append(date5).append(image).append(degreeMain).append(humidityMain).append(windMain);
                $('#days').append(cityMain);
            }
        }
    });
};

function checkLocalStorage() {
    var storedData = localStorage.getItem('queries');
    var dataArray = [];
    if (!storedData) {
        console.log("no data stored");
    } else {
        storedData.trim();
        dataArray = storedData.split(',');
        for (var i = 0; i < dataArray.length; i++) {
            createRecentSearchBtn(dataArray[i]);
        }
    }
};
function saveToLocalStorage(que) {
    var data = localStorage.getItem('queries');
    if (data) {
        console.log(data, que)

    } else {
        data = que;
        localStorage.setItem('queries', data);
    }
    if (data.indexOf(que) === -1) {
        data = data + ',' + que;
        localStorage.setItem('queries', data);
        createRecentSearchBtn(que);
    }
}
$("#clear-history").on("click", function (event) {
    $("#historyList").empty();
});
$(document).ready(function () {
    // grabs text value from search bar
    $("#searchBtn").on("click", function () {
        var searchValue = $("#searchID").val();

        $("#searchID").val("");
        console.log(searchValue);

        searchWeather(searchValue);
        fiveDay(searchValue);
    });

    // returns city search query to search history below search bar
    $(".history").on("click", "li", function () {
        var city = $(this).text()
        searchWeather(city);
        fiveDay(searchValue);
    })
    loadHistory();

});

// data exchange with the web server 
function loadHistory() {
    let searchedCities = localStorage.getItem("weatherApp")
    if (searchedCities) {
        populateSearch(JSON.parse(searchedCities))
    }
}

// function to get city and weather information
function searchWeather(searchText, savedSearch = false) {
    console.log(searchText)
    var todaysDate = formatDate()
    console.log(todaysDate)
    $.ajax({
        type: "GET",
        // API call for all city and weather info expect for UV index
        url: "https://api.openweathermap.org/data/2.5/weather?q=" + searchText + "&appid=09d8fa25ea74f1612920236f8df702cb&units=imperial",
        dataType: "json",
        success: function (data) {
            console.log(data)
            $("#current-city").text(data.name + " " + todaysDate)
            $("#temps").text(data.main.temp + " F")
            $("#humidity").text(data.main.humidity + "%")
            $("#winds").text(data.wind.speed + " MPH")
            var coords = data.coord;
            getUvIndex(coords.lat, coords.lon)
            if (!savedSearch) {
                saveSearch(data.name)
            }

        },
        error: function (error) {
            console.log(error);
        }

    })

}

// function to display date by city name when returning results 
function formatDate() {

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); 
    var yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;
    return today 
}

// function to get UV
function getUvIndex(lat, long) {
    console.log(lat, long)
    $.ajax({
        type: "GET",
        // API call for UV index
        url: "https://api.openweathermap.org/data/2.5/uvi/forecast?appid=09d8fa25ea74f1612920236f8df702cb&lat=" + lat + "&lon=" + long + "&cnt=1",
        dataType: "json",
        success: function (data) {
            console.log(data[0].value)
            $("#uv").text(data[0].value)
        },
        error: function (error) {
            console.log(error);
        }

    })
}
// color for UV index
function uvIndexBack(uvNum) {
    let uv = $("#uv");
    console.log("uv", uvNum);
    if (uvNum >= 0 && uvNum < 3) {
        uv.css("background", "green");
    } else if (uvNum >= 3 && uvNum <= 5) {
        uv.css("background", "yellow");
      } else if (uvNum > 5 && uvNum <= 7) {
        uv.css("background", "darkorange");
      } else if (uvNum > 7 && uvNum <= 10) {
        uv.css("background", "orangered");
      } else if (uvNum > 10) {
        uv.css("background", "red");
      }
    }
// function to return 5 day forecast
function fiveDay(searchText) {
    $.ajax({
        type: "GET",
        url: "https://api.openweathermap.org/data/2.5/forecast?q= " + searchText + " &appid=09d8fa25ea74f1612920236f8df702cb&units=imperial",
        dataType: "json",
        success: function (data) {
            console.log(data)
            $(".wrapperThree").empty();
            for (let i = 0; i < data.list.length; i++) {
                const element = data.list[i];
                if (element.dt_txt.indexOf("15:00:00") !== -1) {
                    console.log(element);
                    var card = $("<div>").addClass("card border-dark mb-3")
                    var cardHeader = $("<div>").addClass("card-header")
                    var cardBody = $("<div>").addClass("card-body text-dark")
                    var temp = $("<p>").addClass("card-text").text("Temp: " + element.main.temp + " F")
                    var humi = $("<p>").addClass("card-text").text("Humidity: " + element.main.humidity + "%")
                    var date = $("<p>").addClass("card-text").text(element.dt_txt.split(" ")[0])
                    cardHeader.append(date)
                    cardBody.append(temp)
                    cardBody.append(humi)
                    card.append(cardHeader, cardBody)
                    $(".wrapperThree").append(card);
                }

            }
        },
        error: function (error) {
            console.log(error);
        }

    })

}
// adds the searches in local storage
function saveSearch(city) {
    let searchedCities = localStorage.getItem("weatherApp");
    if (!searchedCities) {
        searchedCities = []
    } else {
        searchedCities = JSON.parse(searchedCities)
    }
    searchedCities.unshift(city)
    localStorage.setItem("weatherApp", JSON.stringify(searchedCities.slice(0, 7)))
    populateSearch(searchedCities);
}

// function to display search history below the search bar
function populateSearch(cities) {
    $("#searchHistory").empty()
    for (let i = 0; i < cities.length; i++) {
        const element = cities[i];
        let li = $("<li>").addClass("list-group-item").text(element)
        $(li).on("click", function () {
            searchWeather(element, true);
            fiveDay(element);
        })
        $("#searchHistory").append(li)

    }
}
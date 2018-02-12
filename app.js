function getLocation(unit) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(getWeatherInfo);
        // console.log('success');
    } else {
        oP.innerHTML = "Geolocation is not supported by this browser.";
    }
}

function changeUnit() {
    F = $("#tempUnit").is(":checked");
    $("#spinner").css("display","block");
    var location = $("#manual").val();
    if (location == ''){
        if (F) {
            shortUnit = 'F';
            unit = 'imperial';
            var oP = document.getElementById("weather");
            displayTime();
            getLocation();
        } else {
            shortUnit = 'C';
            unit = 'metric';
            var oP = document.getElementById("weather");
            displayTime();
            getLocation();
        }
    } else {
        if (F) {
            shortUnit = 'F';
            unit = 'imperial';
            var oP = document.getElementById("weather");
            displayTime();
            override();
        } else {
            shortUnit = 'C';
            unit = 'metric';
            var oP = document.getElementById("weather");
            displayTime();
            override();
        }
    }

}

function getWeatherInfo(position) {
    var key = 'e1de7aab588a5e9836e5fe62aaf3da7b';
    var forecastURL = "http://api.openweathermap.org/data/2.5/forecast/daily?units=" + unit + "&lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&cnt=10&mode=json&APPID=" + key;
    var currentURL = "http://api.openweathermap.org/data/2.5/weather?units=" + unit + "&lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&APPID="+ key;
    var uvIndexURL = "http://api.owm.io/air/1.0/uvi/current?lat=" + position.coords.latitude + "&lon=" + position.coords.longitude + "&appid=" + key;
    //get current wather info
    $.ajax({
        type: "GET",
        url: currentURL,
        dataType: "json",
        success:function(responseData, status) {
            F = $("#tempUnit").is(":checked");
            if (F) {
                  shortUnit = 'F';
            } else {
                  shortUnit = 'C';
            }
            //store ifo about city and country
            var cityInfo = responseData.name +", NY";
            $("#City").html(cityInfo);

            //get current temperature, weather condition and icon
            var temp = Math.round(responseData.main.temp)
            var wrappedTemp = "<div id='tempAndIcon'><p><span id='mainTemp''>" + Math.round(temp)
            + "\u00b0" + shortUnit + " </span><img class='ui small right floated image' src='img/GIFicons/" + responseData.weather[0].icon + ".gif' /></p></div>";


            //calculate feels like temperature
            var feelTemp = 0;
            if (unit == 'metric') {
                if (temp > 10) {
                var humidity = responseData.main.humidity;
                  var e = 6.122 * Math.pow(10, 7.5 * temp/(237.7+temp)) * humidity / 100;
                  feelTemp = Math.round((e-10) * 5 / 9 + temp);
              } else {
                  var windSpeed = responseData.wind.speed * 3.6;
                  var WindSpeedVariable = Math.pow(windSpeed, 0.16);
                  feelTemp = Math.round(13.12 + temp * 0.6215 - 11.37 * WindSpeedVariable + 0.3965 * WindSpeedVariable);
              }
            } else {
              var tmp = (temp - 32) / 1.8;
              if (temp > 50) {
                  var humidity = responseData.main.humidity;
                  var e = 6.122 * Math.pow(10, 7.5 * tmp/(237.7+tmp)) * humidity / 100;
                  feelTmp = (e-10) * 5 / 9 + tmp;
              } else {
                  var windSpeed = responseData.wind.speed * 3.6;
                  var WindSpeedVariable = Math.pow(windSpeed, 0.16);
                  feelTmp = 13.12 + tmp * 0.6215 - 11.37 * WindSpeedVariable + 0.3965 * WindSpeedVariable;
              }
              feelTemp = Math.round(feelTmp * 1.8 + 32);
            }

            //get weather description
            var situation = responseData.weather;
            var weath = "";
            $.each(situation, function(key,val) {
            weath += "<small class='sub header' style='font-size:40px;'>" + val.description + ", feels like <span id='feelsTemp'>" + feelTemp + "\u00b0" + shortUnit +"</span></small>";
            });
            var weatherInfo = wrappedTemp + weath;
            $("#Major").html(weatherInfo);


            //store today's max and min temp
            var minTemp = Math.round(responseData.main.temp_min);
            var maxTemp = Math.round(responseData.main.temp_max);
            var d = new Date();
            var dayNum = d.getDay();
            var myday = getDayName(dayNum);
            $("#min_max").html("<div class='item'>Next Hour <div id='maxTemp' class='ui circular yellow massive label'>" + maxTemp + "</div> - <div id='minTemp' class='ui circular teal massive label'>" + minTemp + "</div></div>");

            if (temp < 10) {
                $("#illustration").html("<img id='suggestion' class='ui medium image' src='img/illustration/1.png' alt='clothing illustration'>")
            } else {
                $("#illustration").html("<img id='suggestion' class='ui medium image' src='img/illustration/2.png' alt='clothing illustration'>")
            }

            $("#weather").css("display","block");
            $("#spinner").css("display","none");
        }
    });

    //get 5 forecast info
    $.ajax({
        type: "GET",
        url: forecastURL,
        dataType: "json",
        success:function(responseData,status) {

            var d = new Date();
            var dayNum = d.getDay();
            var forecastInfo = "<div class='ui huge header'><b class='ui huge teal header' id='City'>Weather Forecast</b></div>";
            var dataCluster= responseData.list;
            var labels = []
            var maxs = []
            var mins = []

            $.each(dataCluster, function(key, val) {
                var currentDay = getDayName(dayNum);
                forecastInfo += "<div class='six column row'><div class='left floated column'><h1>" + currentDay + "</h1></div><div class='centered column'><img class='ui tini right floated image' src='img/icons/" + val.weather[0].icon + ".png' ></div><div class='right floated column'><div class='ui circular yellow massive label'>" + Math.round(val.temp.max)
                + "</div><div class='ui circular teal massive label'>" + Math.round(val.temp.min) + "</div></div></div>";
                labels.push(currentDay)
                maxs.push(val.temp.max)
                mins.push(val.temp.min)
                dayNum++;


            });

            $("#forecast").html(forecastInfo)

            console.log(dataCluster)
            var chartData = {
                labels: labels,
                datasets: [{
                    label: "daily maximum temperature",
                    borderColor: '#fbbd08',
                    data: maxs,
                    fill: false,
                }, {
                    label: "daily minimum temperature",
                    borderColor: '#00b5ad',
                    data: mins,
                    fill: false,
                }]
            }
            // draw the chart
            makeChart(chartData)
      }
    });

}

function makeChart(data) {
    var ctx = document.getElementById('myChart').getContext('2d');
    // var chart = new Chart(ctx, {
    //     // The type of chart we want to create
    //     type: 'line',

    //     // The data for our dataset
    //     data: {
    //         labels: ["January", "February", "March", "April", "May", "June", "July"],
    //         datasets: [{
    //             label: "My First dataset",
    //             backgroundColor: 'rgb(255, 99, 132)',
    //             borderColor: 'rgb(255, 99, 132)',
    //             data: [0, 10, 5, 2, 20, 30, 45],
    //         }]
    //     },

    //     // Configuration options go here
    //     options: {}
    // });
    var chart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true
        }
    })
}

function getDayName(dayNum){
    if (dayNum % 7 == 0) {
        return "Sun";
    } else if (dayNum % 7 == 1) {
        return "Mon";
    } else if (dayNum % 7 == 2) {
        return "Tue";
    } else if (dayNum % 7 == 3) {
        return "Wed";
    } else if (dayNum % 7 == 4) {
        return "Thu";
    } else if (dayNum % 7 == 5) {
        return "Fri";
    } else if (dayNum % 7 == 6) {
        return "Sat";
    } else {
        return "unknown day";
    }
}

function displayTime() {
  var d = new Date();
  var year = d.getFullYear();
  var month = d.getMonth();
  var date = d.getDate();
  var hours = ("0" + d.getHours()).slice(-2);
  var minutes = ("0" + d.getMinutes()).slice(-2);
}

function convertTimestamp(timestamp) {
    var d = new Date(timestamp * 1000),	// Convert the passed timestamp to milliseconds
		yyyy = d.getFullYear(),
		mm = ('0' + (d.getMonth() + 1)).slice(-2),	// Months are zero based. Add leading 0.
		dd = ('0' + d.getDate()).slice(-2),			// Add leading 0.
		hh = d.getHours(),
		h = hh,
		min = ('0' + d.getMinutes()).slice(-2),		// Add leading 0.
		ampm = 'AM',
		time;

	if (hh > 12) {
		h = hh - 12;
		ampm = 'PM';
	} else if (hh === 12) {
		h = 12;
		ampm = 'PM';
	} else if (hh == 0) {
		h = 12;
	}
	// ie: 2013-02-18, 8:35 AM
	time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

	return time;
}

function override() {
    $("#spinner").css("display","block");
    var location = $("#manual").val();
    var key = 'e1de7aab588a5e9836e5fe62aaf3da7b';
    var forecastURL = "http://api.openweathermap.org/data/2.5/forecast/daily?units=" + unit + "&q=" + location + "&cnt=10&mode=json&APPID=" + key;
    var currentURL = "http://api.openweathermap.org/data/2.5/weather?units=" + unit + "&q=" + location + "&APPID="+ key;
    $.ajax({
        type: "GET",
        url: currentURL,
        dataType: "json",
        success:function(responseData, status) {
            F = $("#tempUnit").is(":checked");
            if (F) {
                  shortUnit = 'F';
            } else {
                  shortUnit = 'C';
            }
            //store ifo about city and country
            var cityInfo = responseData.name +", NY";
            $("#City").html(cityInfo);

            //get current temperature, weather condition and icon
            var temp = Math.round(responseData.main.temp)
            var wrappedTemp = "<div id='tempAndIcon'><p><span id='mainTemp''>" + Math.round(temp)
            + "\u00b0" + shortUnit + " </span><img class='ui small right floated image' src='img/GIFicons/" + responseData.weather[0].icon + ".gif' /></p></div>";


            //calculate feels like temperature
            var feelTemp = 0;
            if (unit == 'metric') {
                if (temp > 10) {
                var humidity = responseData.main.humidity;
                  var e = 6.122 * Math.pow(10, 7.5 * temp/(237.7+temp)) * humidity / 100;
                  feelTemp = Math.round((e-10) * 5 / 9 + temp);
              } else {
                  var windSpeed = responseData.wind.speed * 3.6;
                  var WindSpeedVariable = Math.pow(windSpeed, 0.16);
                  feelTemp = Math.round(13.12 + temp * 0.6215 - 11.37 * WindSpeedVariable + 0.3965 * WindSpeedVariable);
              }
            } else {
              var tmp = (temp - 32) / 1.8;
              if (temp > 50) {
                  var humidity = responseData.main.humidity;
                  var e = 6.122 * Math.pow(10, 7.5 * tmp/(237.7+tmp)) * humidity / 100;
                  feelTmp = (e-10) * 5 / 9 + tmp;
              } else {
                  var windSpeed = responseData.wind.speed * 3.6;
                  var WindSpeedVariable = Math.pow(windSpeed, 0.16);
                  feelTmp = 13.12 + tmp * 0.6215 - 11.37 * WindSpeedVariable + 0.3965 * WindSpeedVariable;
              }
              feelTemp = Math.round(feelTmp * 1.8 + 32);
            }

            //get weather description
            var situation = responseData.weather;
            var weath = "";
            $.each(situation, function(key,val) {
            weath += "<small class='sub header' style='font-size:40px;'>" + val.description + ", feels like <span id='feelsTemp'>" + feelTemp + "\u00b0" + shortUnit +"</span></small>";
            });
            var weatherInfo = wrappedTemp + weath;
            $("#Major").html(weatherInfo);


            //store today's max and min temp
            var minTemp = Math.round(responseData.main.temp_min);
            var maxTemp = Math.round(responseData.main.temp_max);
            var d = new Date();
            var dayNum = d.getDay();
            var myday = getDayName(dayNum);
            $("#min_max").html("<div class='item'>Next Hour <div id='maxTemp' class='ui circular yellow massive label'>" + maxTemp + "</div> - <div id='minTemp' class='ui circular teal massive label'>" + minTemp + "</div></div>");

            if (temp < 10) {
                $("#illustration").html("<img id='suggestion' class='ui medium image' src='img/illustration/1.png' alt='clothing illustration'>")
            } else {
                $("#illustration").html("<img id='suggestion' class='ui medium image' src='img/illustration/2.png' alt='clothing illustration'>")
            }

            /*
            //store sunrise and sunset time
            var sunsetTime = responseData.sys.sunset;
            var sunriseTime = responseData.sys.sunrise;
            $("#sun_time").html("Sunrise at " + convertTimestamp(sunriseTime)
            + " <span class='glyphicon glyphicon-time'></span> Sunset at " + convertTimestamp(sunsetTime));
            */
            $("#weather").css("display","block");
            $("#spinner").css("display","none");
        }
    });



    $.ajax({
        type: "GET",
        url: forecastURL,
        dataType: "json",
        success:function(responseData,status) {

            var d = new Date();
            var dayNum = d.getDay();
            var forecastInfo = "<div class='ui huge header'><b class='ui huge teal header' id='City'>Weather Forecast</b></div>";
            var dataCluster= responseData.list;

            $.each(dataCluster, function(key, val) {
                var currentDay = getDayName(dayNum);
                forecastInfo += "<div class='six column row'><div class='left floated column'><h1>" + currentDay + "</h1></div><div class='centered column'><img class='ui tini right floated image' src='img/icons/" + val.weather[0].icon + ".png' ></div><div class='right floated column'><div class='ui circular yellow massive label'>" + Math.round(val.temp.max)
                + "</div><div class='ui circular teal massive label'>" + Math.round(val.temp.min) + "</div></div></div>";
                dayNum++;
        });

        $("#forecast").html(forecastInfo);
      }
    });
}

$(function(){
    var oP = document.getElementById("weather");
    unit = 'metric';
    displayTime();
    getLocation();
});
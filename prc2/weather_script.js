const weatherdata = {
    "surat": "40 degrees",
    "mumbai": "35 degrees",
    "delhi": "30 degrees",
    "bangalore": "25 degrees",
    "chennai": "32 degrees",
    "kolkata": "28 degrees",
    "hyderabad": "29 degrees",
    "pune": "33 degrees",
    "ahmedabad": "36 degrees",
    "jaipur": "34 degrees"
};

let city = document.getElementById("feild");
let result = document.getElementById("result");
let button = document.querySelector("button");

button.addEventListener("click", function () {
    let input = city.value.toLowerCase().trim();
    if (weatherdata[input]) {
        result.textContent = "The Weather in " + input + " is " + weatherdata[input];
    } else {
        result.textContent = "Weather data not available for this city.";
    }
});

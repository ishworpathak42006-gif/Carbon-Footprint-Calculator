/* fetch=Funcion used for making HTTP requests to fetch resources.
(JSON style data, images, files)
Simplifies asynchronous data fetching in Javascript
Asynchronous tasks are tasks that take time, and JavaScript allows them to run in the background so the UI doesn't freeze in the meantime.
used for interacting with APIs to retrieve and send
data asynchronously over the web.
fetch(url, {method: "GET"}) By default, even if we just
input url only, the method will be get(i.e. we are 
retreiving sth from the API, there are other
methods such as post(to send some data), delete(to delete some data etc.)*/


let selectedLat = null; //Global Variables for computation of AQI
let selectedLon = null;
let carbonFootPrint=null;
let selectedCityName = "";
let selectedCountry="";
var airQualityIndex="";

const cityInput = document.getElementById("cityInput");
const suggestions = document.getElementById("suggestions");




cityInput.addEventListener("input", () => {
    selectedLat = null;
    selectedLon = null;
    selectedCityName = "";
    fetchData();
 }); //Whenever sth is inputted in the element with id="cityInput", it calls the fetchData function

async function fetchData(){

    const query = cityInput.value; //it stores the value of cityInput in a constant query
    if (query.length < 2) { // wait for at least 2 letters
        suggestions.classList.add("hidden"); //In the class property, i.e. class="sth sth" , it adds hidden inside the "", i.e. now its class="sth sth hidden"
        return;
    }

    try{
        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${query}`); //Whenever you are using a variable, use ``(the button above tab, not single quotes)
        if(!response.ok){//i.e. when the response's status returns 400-500(Client Error Response) instead of 200-300
            throw new Error("Couldn't fetch resource"); //Note: This code is useless here because this partcular API always returns status 200 and not 400-500(Client Error Response), even for nonsense searches
        }

        const data=await response.json();//Fetches the .json file(a readable file from which we can use what we need)
        
          

        suggestions.innerHTML = ""; //This line clears the content of the element with id suggestions(i.e. the <ul>)
        
        
        if (data.results?.length > 0) { 
            /*data.results is an array returned by the API(This API returns a json file that contains array called results),
            If it's length>0. However, use ?. as if you don't, if data.results doesn't exist, it will throw an error, but if you use "?." , it won't 
            throw an error and the expression becomes false, so goes to else condition*/
            data.results.forEach(city => { //This loops through each element of the array, where the current element is defined by city
                const li = document.createElement("li");
                li.textContent = city.name + (city.admin1 ? `, ${city.admin1}` : "") + ", " + city.country;//This is an if else statement. If the city has admin1, it returns ", *name of cty.admin1*", or else it returns "", i.e. empty string
                //Also, +: concatenation operator for string
                li.className = "bg-white w-full p-3 border rounded-lg cursor-pointer hover:bg-indigo-100";
                li.addEventListener("click", () => {
                    cityInput.value = city.name + (city.admin1 ? `, ${city.admin1}` : "");
                    suggestions.classList.add("hidden");

                    // Stores Latitude, Longtitude and name for the calculation of AQI
                    selectedLat = city.latitude;
                    selectedLon = city.longitude;
                    selectedCityName = city.name;                    
                });
                suggestions.appendChild(li);
            });
            suggestions.classList.remove("hidden");
        } 
        
        else {
            const li = document.createElement("li"); //Creates an empty <li> element using js
            li.textContent = "Couldn't find your city";
            li.className = "bg-white w-full p-3 border rounded-lg text-red-600"; //What is written in class=""
            suggestions.appendChild(li); 
            /*suggestions.appendChild(li); means: “Add this element (li) to the end of the suggestions element(ie. ul) as a child
            i.e. Output:
            <ul>
                <li> *Whatever is returned* </li>
            </ul> */
            suggestions.classList.remove("hidden"); //Removes hidden from the class property ie. if it was class="sth sth hidden", it wld only be: "sth sth"
            return;
        }

    }
    catch(error){//This code catches error if there are any
        console.error(error);//Presents error in console
    }
}

document.addEventListener('click', (e) => {//When we click/tap on other areas in the screen, the suggestions disappear
  if (!cityInput.contains(e.target) && !suggestions.contains(e.target)) {
    suggestions.classList.add('hidden');
  }
});



// Form Validation
const travel_mode = document.getElementById("travel_mode");
const travel_distance = document.getElementById("travel_distance");
const electricity = document.getElementById("electricity");
const diet = document.getElementById("diet");

// FUNCTIONS -------------------------------------------------------
const setError = (element, message) => {
    const parent = element.parentElement; //Selects the primary element(in this case, the div underwhich the ekements are located)
    const errorDisplay = parent.querySelector(".error"); //Select elements with class "error" of the parent Element

    errorDisplay.innerText = message;
    parent.classList.add("error");

    // Tailwind red border
    element.classList.add("border-red-500");
    element.classList.remove("border-green-500");
};

const setSuccess = element => {
    const parent = element.parentElement;
    const errorDisplay = parent.querySelector(".error"); //Select elements with class "error" of the parent Element

    errorDisplay.innerText = "";
    parent.classList.remove("error");

    // Tailwind green border
    element.classList.add("border-green-500");
    element.classList.remove("border-red-500");
};

const validateInputs = async () => {
      /* 
        This function is declared as async because we are calling 
        getAirQuality(), which is an asynchronous function.

        Since getAirQuality() takes time (it fetches API data), 
        we must use 'await' to pause execution until its result arrives.

        Using 'await' requires the parent function (validateInputs) 
        to be marked as 'async'.
        */
    let isValid = true;

    // --- Your existing validation code ---
    if (selectedLat === null || selectedLon === null) { 
        setError(cityInput, "City is required"); //Calls setError function
        isValid = false;
    } else {
        setSuccess(cityInput); //Calls setSeccess function
    }

    if (travel_mode.value === "Main mode of transport" || travel_mode.value === "") {
        setError(travel_mode, "Please select travel mode");
        isValid = false;
    } else { setSuccess(travel_mode); }

    if (travel_distance.value.trim() === "" || travel_distance.value <= 0) {
        setError(travel_distance, travel_distance.value.trim() === "" ? "Distance is required" : "Enter a valid distance");
        isValid = false;
    } else { setSuccess(travel_distance); }

    if (electricity.value.trim() === "" || electricity.value <= 0) {
        setError(electricity, electricity.value.trim() === "" ? "Electricity usage required" : "Enter a valid number");
        isValid = false;
    } else { setSuccess(electricity); }

    if (diet.value === "Select your diet" || diet.value === "") {
        setError(diet, "Please select your diet");
        isValid = false;
    } else { setSuccess(diet); }

    // --- Only calculate if valid ---
    if (isValid) {
        const travelFactors = { "Car": 0.21, "Bike": 0.05, "Bus": 0.10, "Train": 0.04, "EV": 0.03, "Walking": 0.0 };
        const dietFactors = { "Vegan": 1.5, "Vegetarian": 2.0, "Eggetarian": 2.5, "Non-veg (1–2 days/week)": 3.0, "Non-veg (3–5 days/week)": 4.0, "Non-veg (daily)": 5.0 };
        const electricityFactor = getElectricityFactor(selectedCountry);

        const travelEmission = (travelFactors[travel_mode.value] || 0) * Number(travel_distance.value) * 30;
        const electricityEmission = Number(electricity.value) * electricityFactor;
        const dietEmission = dietFactors[diet.value] || 0;

        carbonFootprint = travelEmission + electricityEmission + dietEmission;

        // Wait for AQI before showing results
        await getAirQuality(selectedLat, selectedLon);

        showResult();
    }

    return null;
};


//Contact_Us_Form_Validation

const contact_us_form = document.getElementById("contact_us_form");
const contact_us_name = document.getElementById("contact_us_name");
const contact_us_email = document.getElementById("contact_us_email");
const contact_us_message=document.getElementById("contact_us_message");

contact_us_form.addEventListener('submit', e=>{ 
    /* 
       This is an arrow function with 'e' as its parameter.
       'e' is the event object automatically passed by the browser
       when the form triggers the 'submit' event.
    */

   //Run validation
    const isValid = contactUsFormValidateInputs();

    // If form is invalid → stop submission
    if (!isValid) {
        e.preventDefault();
    }
})

const isValidEmail = email => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
} //Function to test if the email is valid or not

const contactUsFormValidateInputs = () => {
    let valid = true;

    // Name
    if (contact_us_name.value.trim() === "") {
        setError(contact_us_name, "Name is required");//setError function is already defined near the carbon footprint calculator form validation function
        valid = false;
    } else {
        setSuccess(contact_us_name); //setSuccess function is already defined near the carbon footprint calculator form validation function
    }

    // Email
    if (contact_us_email.value.trim() === "") {
        setError(contact_us_email, "Email is required");
        valid = false;
    }
    else if (!isValidEmail(contact_us_email.value.trim())) {
        setError(contact_us_email, "Provide a valid email");
        valid = false;
    }
    else {
        setSuccess(contact_us_email);
    }

    // Message
    if (contact_us_message.value.trim() === "") {
        setError(contact_us_message, "Message is required");
        valid = false;
    } else {
        setSuccess(contact_us_message);
    }

    return valid;
};

//Function to getAirQuality

async function getAirQuality(lat, lon) {
    const apiKey = "e1e64332-4bfe-4b46-82f3-8a3fff45defa"; //Got API by logging in the website
    const url = `https://api.airvisual.com/v2/nearest_city?lat=${lat}&lon=${lon}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok){
            throw new Error("Failed to fetch AQI");

        } 

        const data = await response.json();
        airQualityIndex=data.data.current.pollution.aqius;

    } catch (error) {
        console.error("AIRVISUAL ERROR:", error);
        return null;//Returns a null value in case of an error, so the function containing getAirQuality() doesn't crash
    }
}

//To return the required electricity factor
//Get the electricity factor of respective countries from the local json file
let electricityFactors = [];
const INDIA_FACTOR = 702.4286499 / 1000; // kg CO2/kWh

// Fetch the JSON once on page load
fetch("electricity_factors_2020.json")

// fetch() sends an async request (runs in the background) to load the file,
// and immediately returns a Promise that RESOLVES with a Response object when the file is received.
.then(res => res.json())
// .then() runs AFTER the first Promise resolves.
// 'res' receives the Response object (not JSON yet).
// res.json() ALSO returns a Promise because reading + converting the body to JSON is asynchronous.

.then(data => {
    // This .then runs after the JSON conversion finishes.
    // 'data' receives the actual JSON object.
    // (The name 'data' is just a parameter — you can call it anything.)

    // Store the JSON array in electricityFactors
    electricityFactors = data;
})
.catch(err => console.error(err));  // Catches errors in ANY step



function getElectricityFactor(countryName) {
    const countryData = electricityFactors.find(c => c.country === countryName);//.find() searches the array 
    // c => ... is the Arrow function used by find()
    // country is a parameter of the JSON file containing the country names

    // If country not found or carbon_intensity_elec is empty/null, use India
    if (!countryData || countryData.carbon_intensity_elec === "" || countryData.carbon_intensity_elec === null) {
        return INDIA_FACTOR;
    }

    return countryData.carbon_intensity_elec / 1000; // Convert gCO2/kWh → kgCO2/kWh 
    //carbon_intensity_elec is the parameter of the JSON file containing the electricity factor of corresponding countries in gCO2/kWh
}


//function to show the result
const showResult = () => {
    const carbonDiv = document.getElementById("carbonResult");
    const aqiDiv = document.getElementById("aqiResult");
    const container = document.getElementById("carbonCalculatorDiv");

    // INITIAL ANIMATION: fade-in + slide-up
    container.classList.remove("opacity-0", "translate-y-10");
    container.classList.add("opacity-100", "translate-y-0", "transition-all", "duration-700", "ease-in-out"); //ease-in-out creates a ease-in-out curve

    // Scroll to container
    container.scrollIntoView({ behavior: "smooth", block: "center" });
    //behavior: "smooth"= scrolls behavior is smooth
    // block: "center"=Aligns the element vertically in the center of the viewport when scrolling.


    // Spinner while computing
    const spinnerHTML = `
        <div class="text-center">
            <svg class="mx-auto h-8 w-8 animate-spin text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="mt-4 font-medium text-gray-700">Loading...</p>
        </div>
    `;//This is a spineer element copied from hyperui.dev

    carbonDiv.innerHTML = spinnerHTML;
    // This replaces ALL existing content inside <div id="carbonDiv">...</div>
    // with the HTML stored in spinnerHTML (meaning its previous child elements are removed).

    aqiDiv.innerHTML = spinnerHTML;

    // Show final Carbon Footprint after delay
    setTimeout(() => {
        carbonDiv.innerText = `Carbon Footprint: ${carbonFootprint.toFixed(2)} kg CO₂e`;//.toFixed(2) fixes 2 places after decimal
        // carbonDiv.innerText completely clears all existing HTML inside <div id="carbonDiv">
        // (i.e. the spinner) and replaces it with plain text only.

        // Remove any previous color classes
        carbonDiv.classList.remove("text-[#14B8A6]", "text-[#b86e14]", "text-[#b81414]");

        // Apply color based on value
        if (carbonFootprint <= 50) carbonDiv.classList.add("text-[#14B8A6]"); // green
        else if (carbonFootprint <= 150) carbonDiv.classList.add("text-[#b86e14]"); // yellow
        else carbonDiv.classList.add("text-[#b81414]"); // red

        // Add fade-in + slide-up effect for text
        carbonDiv.classList.add("opacity-0", "translate-y-6");//translate-y-6 shifts the element downwards, so when translate-y-0 is applied, there is a slide-up effect
        setTimeout(() => {
            carbonDiv.classList.remove("opacity-0", "translate-y-6");
            carbonDiv.classList.add("opacity-100", "translate-y-0", "transition-all", "duration-700", "ease-in-out");
        }, 50); // small delay for transition to trigger
    }, 1500);//Delay of 1500 ms, that is the spinner element stays for 1500 ms 

    // Show final AQI after delay
    setTimeout(() => {
        aqiDiv.innerText = `The AQI in ${selectedCityName}: ${airQualityIndex}`;

        // Remove any previous color classes
        aqiDiv.classList.remove("text-[#14B8A6]", "text-[#b86e14]", "text-[#b81414]");

        // Apply color based on AQI
        if (airQualityIndex <= 50) aqiDiv.classList.add("text-[#14B8A6]"); // green
        else if (airQualityIndex <= 100) aqiDiv.classList.add("text-[#b86e14]"); // yellow
        else aqiDiv.classList.add("text-[#b81414]"); // red

        // Add fade-in + slide-up effect for text
        aqiDiv.classList.add("opacity-0", "translate-y-6");
        setTimeout(() => {
            aqiDiv.classList.remove("opacity-0", "translate-y-6");
            aqiDiv.classList.add("opacity-100", "translate-y-0", "transition-all", "duration-700", "ease-out");
        }, 50);
    }, 2000);
};

//Slide up+fade-in effect of Carbon Footprint Calculator Form
function showForm() {
  const form = document.getElementById("fadeForm");
  form.classList.remove("opacity-0", "-translate-y-10");//(-translate-y-10) shifts the element upwards, so when translate-y-0 is applied, there is a slide-down effect
  form.classList.add("opacity-100", "translate-y-0");
}



        
        
    

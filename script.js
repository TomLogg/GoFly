let progressSegments =
  JSON.parse(localStorage.getItem("progressSegments")) || [];
let commentsArray = JSON.parse(localStorage.getItem("comments")) || [];

// Define colors for each certification
const certificationColors = {
  private: "#00bfa6", // Teal
  instrument: "#ff6f61", // Coral
  "multi-engine": "#ffd700", // Gold
  commercial: "#6495ed", // Cornflower blue
  "flight-instructor": "#ffa07a", // Light salmon
  "building-hours": "#9370db", // Medium purple
};

// Toggle the visibility of the form when clicking "Track Hours"
document
  .getElementById("track-hours-button")
  .addEventListener("click", function () {
    const form = document.getElementById("track-hours-form");
    form.classList.toggle("hidden");

    if (!form.classList.contains("hidden")) {
      form.scrollIntoView({ behavior: "smooth" });
    }
  });

document
  .getElementById("hours-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const hoursInput = parseFloat(document.getElementById("hours-input").value);
    const certification = document.getElementById("certification-select").value;
    const comment = document.getElementById("comments").value;

    if (hoursInput > 0) {
      // Add the new progress segment with color based on certification
      progressSegments.push({
        value: hoursInput,
        certification: certification,
      });
      localStorage.setItem(
        "progressSegments",
        JSON.stringify(progressSegments)
      );
      updateProgressBar();

      if (comment) {
        const timestamp = new Date().toLocaleString();
        commentsArray.unshift({
          text: comment,
          timestamp: timestamp,
          certification: certification,
        });
        localStorage.setItem("comments", JSON.stringify(commentsArray));
        updateCommentsList();
      }

      document.getElementById("hours-form").reset();

      // Hide the form after submission
      document.getElementById("track-hours-form").classList.add("hidden");
    }
  });

function updateProgressBar() {
  const progressContainer = document.getElementById("progress-bar-wrapper");
  progressContainer.innerHTML = progressSegments
    .map((segment, index) => {
      const segmentWidth = (segment.value / 1500) * 100;
      const segmentColor =
        certificationColors[segment.certification] || "#00bfa6"; // Default to teal if color is undefined

      // Apply rounded corners only to the first and last segments
      const borderRadiusStyle =
        index === 0
          ? "border-radius: 5px 0 0 5px;"
          : index === progressSegments.length - 1
          ? "border-radius: 0 5px 5px 0;"
          : "";

      return `<div class="progress-segment" style="width: ${segmentWidth}%; background-color: ${segmentColor}; ${borderRadiusStyle}"></div>`;
    })
    .join("");

  const totalHours = progressSegments.reduce(
    (sum, segment) => sum + segment.value,
    0
  );
  document.getElementById(
    "progress-text"
  ).textContent = `${totalHours} / 1500 Hours`;
}

function updateCommentsList() {
  const commentsList = document.getElementById("comments-list");
  commentsList.innerHTML = commentsArray
    .slice(0, 5)
    .map(
      (comment) => `
        <li><strong>${comment.certification}:</strong> ${comment.text}
        <br><em>Submitted on ${comment.timestamp}</em></li>
    `
    )
    .join("");
}

// Reset Data Button functionality
document.getElementById("reset-button").addEventListener("click", function () {
  // Clear specific items from local storage
  localStorage.removeItem("progressSegments");
  localStorage.removeItem("comments");

  // Reset the in-memory arrays as well
  progressSegments = [];
  commentsArray = [];

  // Update the UI
  updateProgressBar();
  updateCommentsList();

  // Optional: Alert to confirm reset
  alert("All data has been reset.");
});

const weatherInfo = document.getElementById("weather-info");
const locationForm = document.getElementById("location-form");
const locationInput = document.getElementById("location-input");

const openWeatherMapApiKey = "9b1b9f7d5ac36eb67915875b1e592419"; // Replace with OpenWeatherMap API key
const checkwxApiKey = "09d6eec8bc1b417cb27f567294"; // Replace with CheckWX API key

// Dictionary of cities to nearby airport codes (for cloud ceiling data)
const cityToAirportCode = {
  Atlanta: "KATL", // Hartsfield-Jackson Atlanta International Airport
  Augusta: "KAGS", // Augusta Regional Airport
  Columbus: "KCSG", // Columbus Metropolitan Airport
  Macon: "KMCN", // Middle Georgia Regional Airport
  Savannah: "KSAV", // Savannah/Hilton Head International Airport
  Athens: "KAHN", // Athens-Ben Epps Airport
  Albany: "KABY", // Southwest Georgia Regional Airport
  Brunswick: "KBQK", // Brunswick Golden Isles Airport
  Valdosta: "KVLD", // Valdosta Regional Airport
  Gainesville: "KGNV", // Gainesville Regional Airport
  "Peachtree City": "KFFC", // Atlanta Regional Airport - Falcon Field
  Rome: "KRMG", // Richard B. Russell Airport
  Dublin: "KDBN", // W. H. 'Bud' Barron Airport
  Cartersville: "KVPC", // Cartersville Airport
  "St. Simons": "KSSI", // Malcolm McKinnon Airport (St. Simons Island)
  Douglas: "KDQH", // Douglas Municipal Airport
  LaGrange: "KLGC", // LaGrange Callaway Airport
  Thomasville: "KTVI", // Thomasville Regional Airport
  Tifton: "KTMA", // Henry Tift Myers Airport
  Waycross: "KAYS", // Waycross-Ware County Airport
  Jesup: "KJES", // Jesup-Wayne County Airport
  Vidalia: "KVDI", // Vidalia Regional Airport
  Moultrie: "KMGR", // Moultrie Municipal Airport
  Bainbridge: "KBGE", //Decatur County Industrial Airpark
};

// Fetch general weather data from OpenWeatherMap
async function fetchWeather(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=9b1b9f7d5ac36eb67915875b1e592419`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather data not available");

    const data = await response.json();
    const temperature = data.main.temp;
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;

    // Display the general weather information
    weatherInfo.innerHTML = `
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}" />
            <strong>${temperature}°F</strong> - ${
      description.charAt(0).toUpperCase() + description.slice(1)
    }
        `;

    // Fetch cloud ceiling data if the city has an associated airport code
    const airportCode = cityToAirportCode[city];
    if (airportCode) {
      fetchCloudCeiling(airportCode);
    } else {
      weatherInfo.innerHTML += `<p>Cloud Ceiling: No data available for this location.</p>`;
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    weatherInfo.textContent = "Weather data not available.";
  }
}

// Fetch cloud ceiling data from CheckWX
async function fetchCloudCeiling(airportCode) {
  const url = `https://api.checkwx.com/metar/${airportCode}/decoded`;

  // Set up headers as shown in CheckWX example
  const myHeaders = new Headers();
  myHeaders.append("X-API-Key", checkwxApiKey); // Make sure checkwxApiKey is defined

  const requestOptions = {
    method: "GET",
    headers: myHeaders,
    redirect: "follow",
  };

  try {
    const response = await fetch(url, requestOptions);
    if (!response.ok) throw new Error("METAR data not available");

    const data = await response.json();

    if (data && data.data && data.data[0] && data.data[0].clouds) {
      const clouds = data.data[0].clouds;

      // Initialize a message to display cloud layers
      let cloudInfo = "";

      // Loop through each cloud layer and display available data
      clouds.forEach((layer, index) => {
        const height = layer.feet || "Unknown height";
        const type = layer.code || "Unknown type";
        cloudInfo += `<p>Cloud Layer ${
          index + 1
        }: ${height} ft AGL (${type})</p>`;
      });

      // If there is cloud info, display it; otherwise, show fallback message
      if (cloudInfo) {
        weatherInfo.innerHTML += cloudInfo;
      } else {
        weatherInfo.innerHTML += `<p>Cloud Ceiling: Cloud data unavailable or incomplete</p>`;
      }
    } else {
      console.log("No clouds data available in response.");
      weatherInfo.innerHTML += `<p>Cloud Ceiling: No data available</p>`;
    }
  } catch (error) {
    console.error("Error fetching cloud ceiling data:", error);
    weatherInfo.innerHTML += `<p>Cloud Ceiling: Not available</p>`;
  }
}

// Event listener for the location form submission
locationForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent the form from refreshing the page
  const city = locationInput.value.trim();
  if (city) {
    fetchWeather(city); // Fetch and display weather data for the entered city
  }
});

// Call the function on page load
fetchWeather();

// Initial load
updateProgressBar();
updateCommentsList();

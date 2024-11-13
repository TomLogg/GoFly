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

const weatherSection = document.getElementById("weather-section");
const weatherInfo = document.getElementById("weather-info");

// Fetch weather data from OpenWeatherMap API
async function fetchWeather() {
  try {
    // Set location
    const lat = "34.2979"; // Latitude for GAinesville, GA
    const lon = "-83.8241"; // Longitude for Gainesville, GA
    const apiKey = "9b1b9f7d5ac36eb67915875b1e592419";

    // OpenWeatherMap API URL
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=34.2979&lon=-83.8241&units=imperial&appid=9b1b9f7d5ac36eb67915875b1e592419`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather data not available");

    const data = await response.json();

    // Extract necessary weather data
    const temperature = data.main.temp;
    const description = data.weather[0].description;
    const icon = data.weather[0].icon;

    // Display the weather information
    weatherInfo.innerHTML = `
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}" />
            <strong>${temperature}°F</strong> - ${
      description.charAt(0).toUpperCase() + description.slice(1)
    }
        `;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    weatherInfo.textContent = "Weather data not available.";
  }
}

// Call the function on page load
fetchWeather();

// Initial load
updateProgressBar();
updateCommentsList();

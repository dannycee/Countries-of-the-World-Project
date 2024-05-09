const radioButtons = document.querySelectorAll(
  'input[type="radio"][name="radio"]'
);
const countryContainer = document.querySelector(".country");
const btnLeft = document.querySelector(".btn-left");
const btnRight = document.querySelector(".btn-right");
const neighboursContainer = document.querySelector(".neighbours-container");

let regionCountryNames = [];
let currentCountryIndex = 0;
let intervalId; // Interval identifier

// Event listener for the left button
btnLeft.addEventListener("click", function () {
  clearInterval(intervalId); // Stop automatic scrolling
  scrollLeft();
});

// Event listener for the right button
btnRight.addEventListener("click", function () {
  clearInterval(intervalId); // Stop automatic scrolling
  scrollRight();
});

// Function to scroll to the right
const scrollRight = function () {
  currentCountryIndex = (currentCountryIndex + 1) % regionCountryNames.length;
  renderCountry(regionCountryNames[currentCountryIndex]);
};

// Function to scroll to the left
const scrollLeft = function () {
  currentCountryIndex =
    (currentCountryIndex - 1 + regionCountryNames.length) %
    regionCountryNames.length;
  renderCountry(regionCountryNames[currentCountryIndex]);
};

// Function to render country information
const renderCountry = function (countryName) {
  neighboursContainer.innerHTML = ""; // Clear neighbours container

  fetch(`https://restcountries.com/v3.1/name/${countryName}`)
    .then((response) => {
      if (!response.ok)
        throw new Error(`Country not found (${response.status})`);
      return response.json();
    })
    .then((data) => {
      const countryData = data[0];
      console.log(countryData);
      const population = countryData.population;
      let populationDisplay = population;
      if (population >= 1000000) {
        populationDisplay = (population / 1000000).toFixed(1) + " M";
      }

      const html = `
        <div class="flag">
          <img src=${countryData.flags?.png} alt="" class="country-flag" />
        </div>
        <div class="country-info">
          <h1 class="country-name">${countryData.name?.common}</h1>
          <h3 class="country-name-official">${countryData.name?.official}</h3>
          <div class="country-details">
            <p class="country_row"><span>Capital</span>${
              countryData.capital
            }</p>
            <p class="country_row"><span>Region</span>${
              countryData.subregion
            }</p>
             <p class="country_row"><span>Population</span>${populationDisplay} people</p>
            <p class="country_row"><span>Area</span>${countryData.area} km²</p>
            <p class="country_row"><span>Languages</span>${Object.values(
              countryData.languages
            ).join(", ")}</p>
            <p class="country_row"><span>Currency</span>${
              Object.values(countryData.currencies)[0].name
            }</p>
          </div>
        </div>
      `;
      countryContainer.innerHTML = html; // Insert main country information
      return countryData;
    })
    .then((countryData) => {
      if (!countryData?.borders?.length) {
        // If the country has no neighbours, display a message
        const neighboursTitle = `<div class="neighbours">
             <h4 class="neighbour-name">Country has no neighbours</h4>
          </div>`;
        neighboursContainer.insertAdjacentHTML("afterbegin", neighboursTitle);
        return;
      }

      countryData.borders.forEach((border) => {
        fetch(`https://restcountries.com/v3.1/alpha/${border}`)
          .then((response) => {
            if (!response.ok)
              throw new Error(
                `Neighbour country not found (${response.status})`
              );
            return response.json();
          })
          .then((neighbourData) => {
            const neighbourHtml = `
              <div class="neighbours">
                <img src=${neighbourData[0].flags?.png} alt="" class="neighbour-flag" />
                <h4 class="neighbour-name">${neighbourData[0].name?.common}</h4>
              </div>
            `;
            neighboursContainer.insertAdjacentHTML("beforeend", neighbourHtml); // Insert neighbours
          })
          .catch((err) => {
            console.error(`${err}💥💥💥`);
          });
      });
    })
    .catch((err) => {
      console.error(`${err}💥💥💥`);
    });
};

// Function to get data for a specific region
const getRegionData = function (region) {
  fetch(`https://restcountries.com/v3.1/region/${region}`)
    .then((response) => {
      if (!response.ok)
        throw new Error(`Region not found (${response.status})`);
      return response.json();
    })
    .then((data) => {
      regionCountryNames = data.map((country) => country.name?.common);
      currentCountryIndex = 0;
      renderCountry(regionCountryNames[currentCountryIndex]);

      // Start automatic scrolling every x seconds
      intervalId = setInterval(() => {
        scrollRight();
      }, 4000);
    })
    .catch((err) => {
      console.error(`${err}💥💥💥`);
    });
};

// Initially select the Europe region
getRegionData("europe");

// Handle region change
radioButtons.forEach((radioButton) => {
  radioButton.addEventListener("change", () => {
    if (radioButton.checked) {
      clearInterval(intervalId); // Stop previous interval if it exists
      const region = radioButton.value;
      getRegionData(region);
    }
  });
});

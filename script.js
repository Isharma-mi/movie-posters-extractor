// Gets ref to submit button
let submitBtn = document.getElementById("submitBtn");
// Gets ref to csv file selected by user
let fileName = document.getElementById("fileName");
// Gets ref to results section
let results = document.getElementById("results");

/**
 * Reads the .csv file
 */
function readCSV() {
    // Gets the file
    const file = fileName.files[0];

    // Ensures file was selected
    if (file) {
        // Handles file reading asynchronously
        const reader = new FileReader();

        // Process file contents once reading is completed
        // Put first to ensure that handler in place once file is read
        reader.onload = function(event) {
            // event.target is the reader instance 
            // result is the file's content as a String
            const csvText = event.target.result;
            // Deals with the files content as a String
            parseCSV(csvText);
        }
        
        // Reads the file as a text string -> Calls onload
        reader.readAsText(file);
    } else {
        console.log("No file selected!");
    }
}

/**
 * Modifies data for easier reading 
 * @param {String} csvText - Text from the csv file
 */
function parseCSV(csvText) {
    /* Array consiting of each separeted row with line endings for windows/mac removed
        - Delimiters (/.../): Define regex pattern
        - \r\n: carriage return and new line
        - \g: global search -> Looks across entirety of string
    */
    const movies = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split(/[,\n]/);
    // Tracker is used as prefix for file name
    let tracker = 1;

    // Loops thru each movie
    for (const movie of movies) {
        // Gets the poster
         getMoviePoster(movie, tracker);
        // Increments tracker
        tracker++;
    }
}

/**
 * Gets the poster for a specific movie. 
 * Async to update results in order of movies.
 * @param {String} movie - Name of the movie
 * @param {String} filePrefix - Prefix for poster file name
 */
async function getMoviePoster(movie, filePrefix) {
    let url = `http://www.omdbapi.com/?t=${movie}&apikey=${key}`;
    
    // Gets the data related to the movie
    fetch(url)
        .then(resp => resp.json())
        .then(data => {
            // Gets the data in binary format and to deal with cross-origin requests
                // Poster url domain is different from OMDb API
             fetch(data.Poster)
                .then(resp => resp.blob())
                .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    // Creates element used to download image
                    const posterLink = document.createElement('a');
                    // Sets element's link equal to the url
                    posterLink.href = url;
                    // Sets the name of the file downloaded
                    posterLink.download = `${filePrefix}_${movie}_Poster`;
                    // Adds posterLink element to html
                    document.body.appendChild(posterLink);
                    // Clicks element to download image
                    posterLink.click();
                    // Removes posterLink element from HTMl
                    document.body.removeChild(posterLink);
                    // Updates html to show poster downloaded
                    results.innerHTML += `Downloaded poster for ${data.Title}<br>`;
                }).catch(() => {
                    // Filters out any errors server side
                    if (!movie === "undefined") {
                        results.innerHTML += `ERROR: Unable to download poster for ${movie}<br>`;    
                    }
                });
        }).catch (() => {
            console.log(`ERROR: Unable to fetch ${movie}`);
        });
}

submitBtn.addEventListener("click", readCSV);
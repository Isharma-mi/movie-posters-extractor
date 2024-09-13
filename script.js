// TODO: Prevent nothing from being submited
import { apiKey } from "./module.js";

// Gets ref to submit button
let submitBtn = document.getElementById("submitBtn");
// Gets ref to csv file selected by user
let fileName = document.getElementById("fileName");
// Gets ref to results section
let results = document.getElementById("results");
// Creates JSZip instance
const zip = new JSZip();

async function main() {
    // Array that will store movies from csv file
    let movies = [];
    let wasFileRead = false;

    // Tries to read the given csv file
    try {
        movies = await readFile();
        wasFileRead = true;
        results.innerHTML = "";
    } catch (error) {
        results.innerHTML = "ERROR: Unable to read file";
        console.log("ERROR: Unable to read file", error);
    }

    if (wasFileRead) {
        // Gets the poster urls
        await getPosterURLs(movies);
    
        // Generates the zip file
        await generateZipFile();
    }
}

/**
 * Reads the csv file.
 * @returns Promise ensures file is read  before continuing on
 */
async function readFile() {
    const file = fileName.files[0];

    if (!file) {
        throw Error;
    }

    return new Promise((resolve, reject) => {
        const reader= new FileReader();
        // When file is read successfully -> Resolves promise
            // Returns content of file w/o line endings of windows/mac
        reader.onload = () => resolve(reader.result.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split(/[,\n]/));
        // When file is NOT read -> Rejects promise
            // Returns error
        reader.onerror = () => reject(reader.error);

        reader.readAsText(file);
    })
}

/**
 * Gets the poster urls from the list of movies.
 * @param {array} movies list of movies
 * @returns Promise ensures urls are recieved before continuing on
 */
async function getPosterURLs(movies) {
    return new Promise(async (resolve) => {
        // Used for naming posters
        let tracker = 1;
        
        // Loops thru each movie from array
        for (const movie of movies) {
            // Creates the URL for the movie
            let url = `http://www.omdbapi.com/?t=${movie}&apikey=${apiKey}`;
            
            // Makes http request returning Promise that resolves to Response obj
            await fetch(url)
                // Returns Promise resolving to JSON data from Response obj
                .then(resp => resp.json())
                // Deals with the JSON data
                .then(data => {
                    // Adds the poster to the zipped folder
                    addImageToZip(data.Poster, `${tracker++}_${movie}_poster.jpg`);
                    
                    // Updates html to show poster was downloaded for specific movie
                    if (movie !== "") {
                        results.innerHTML += `Downloaded poster for ${movie}<br>`;
                    }
                })
            }
        resolve();
        });
}

/**
 * Generates the zip file.
 */
async function generateZipFile() {
    // Gens zip file as a blob (Binary file that browser understands)
    const zipBlob = await zip.generateAsync({type: "blob"});
    
    // Creates hyperlink element
    const link = document.createElement("a");
    // Assigns href to url refering to zipBlob
    link.href= URL.createObjectURL(zipBlob);
    // Adds link to body (Req'd by some browsers)
    document.body.appendChild(link);
    // Sets title of file that is downloaded
    link.download = "posters.zip";
    // Auto'ly clicks link for user
    link.click();
    // Removes link from body (Req'd by some browsers)
    document.body.removeChild(link);

    // Removes link from memory
    URL.revokeObjectURL(link.href);
}

/**
 * Adds an image to the zip folder
 * @param {String} url URL of the movie poster
 * @param {String} fileName Name of the image file that will be zipped
 */
async function addImageToZip(url, fileName) {
    const response = await fetch(url);
    const blob = await response.blob();
    zip.file(fileName, blob);
}

submitBtn.addEventListener("click", main);
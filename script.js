// TODO: Get movies from csv file
let movies = ["Dark Knight", "Primer", "Arrival"];

// Gets ref to submit button
let submitBtn = document.getElementById("submitBtn");

/**
 * Gets the movie poster
 */
let getMoviePoster = () => {
    console.log("TESTING: Getting movies");
    let tracker = 0;

    // Loop thru each movie
    for (const movie of movies) {
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
                        posterLink.download = `${movie}_Poster`;
                        // Adds posterLink element to html
                        document.body.appendChild(posterLink);
                        // Clicks element to download image
                        posterLink.click();
                        // Removes posterLink element from HTMl
                        document.body.removeChild(posterLink);
                    }).catch(() => {
                        console.log(`ERROR: Unable to fetch poster for movie: ${data.Title}`);
                    });

                console.log(data.Poster);
                
              

            }).catch (() => {
                console.log(`ERROR: Unable to fetch ${movie}`);
            });
        tracker++;
    }
}

submitBtn.addEventListener("click", getMoviePoster);
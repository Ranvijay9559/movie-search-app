const movieNameInput = document.getElementById("moviename-input");
const searchBtn = document.getElementById("search-btn");
const resultContainer = document.getElementById("result-container");
const suggestionContainer = document.getElementById("suggestion-container");

const api = MOVIE_SEARCH_API;

movieNameInput.addEventListener("input", handleSuggestion);
searchBtn.addEventListener("click", handleSearch);

function handleSuggestion() {
  suggestionContainer.innerHTML = "";

  const movieName = movieNameInput.value.trim();

  const url = `https://www.omdbapi.com/?apikey=${api}&s=${movieName}`;

  fetch(url)
  .then(response => response.json())
  .then(data => {
    if (data.Response === "True") {
      data.Search.slice(0,5).forEach(movie => {
        const movieSuggestion = document.createElement("div");
        movieSuggestion.classList.add("movie-suggestion");
        movieSuggestion.addEventListener("click", () => {
          movieNameInput.value = movie.Title;
          handleSearch();
        });

        const img = fetchImage(movie);

        const title = document.createElement("p");
        title.textContent = movie.Title;

        movieSuggestion.appendChild(img);
        movieSuggestion.appendChild(title);
        suggestionContainer.appendChild(movieSuggestion);
      });
    }
  })
}

movieNameInput.addEventListener("keydown", (e) => {
  if(e.key === "Enter") {
    e.preventDefault();
    handleSearch();
  }
});

function handleSearch() {
  resultContainer.innerHTML = "";
  suggestionContainer.innerHTML = "";

  const movieName = movieNameInput.value.trim();

  if(!movieName){
    resultContainer.innerHTML = "<p>Please Enter a Movie Name.</p>";
    return;
  }

  const url = `https://www.omdbapi.com/?apikey=${api}&s=${movieName}`;

  fetch(url)
  .then(
    response => response.json()
  )
  .then(data => {
    if(data.Response === "True"){
      data.Search.forEach(movie => {
        const img = fetchImage(movie);

        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");
        
        const title = document.createElement("p");
        title.textContent = movie.Title;

        movieCard.appendChild(img);
        movieCard.appendChild(title);
        resultContainer.appendChild(movieCard);
      })
    } else {
      resultContainer.innerHTML = "<p>No Result Found.</p>"
    }
  })
  .catch(error => {
    resultContainer.innerHTML = `<p>Error fetching data: ${error.message}</p>`;
  });
}

function fetchImage(movie) {
  const img = document.createElement("img");

  img.src = movie.Poster !== "N/A" ? movie.Poster : "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";

  img.onerror = () => {
    img.src = "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";
  }

  return img;
}
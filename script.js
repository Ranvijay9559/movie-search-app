const movieNameInput = document.getElementById("moviename-input");
const searchBtn = document.getElementById("search-btn");
const resultContainer = document.getElementById("result-container");

const api = MOVIE_SEARCH_API;

searchBtn.addEventListener("click", handleSearch);

movieNameInput.addEventListener("keydown", (e) => {
  if(e.key === "Enter") {
    e.preventDefault();
    handleSearch();
  }
});

function handleSearch() {
  resultContainer.innerHTML = "";

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
        const poster = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x445?text=No+Image";

        const title = movie.Title;

        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");

        movieCard.innerHTML = 
        `
          <img src= ${poster}>
          <p>${title}</p>
        `

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
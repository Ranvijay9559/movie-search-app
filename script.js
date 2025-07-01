const movieNameInput = document.getElementById("moviename-input");
const searchBtn = document.getElementById("search-btn");
const resultContainer = document.getElementById("result-container");
const suggestionContainer = document.getElementById("suggestion-container");
const loading = document.getElementById("loading");
const resultHeader = document.getElementById("result-header");
const pageContainer = document.getElementById("page-container");

const api = MOVIE_SEARCH_API;
let currentPage = 1;
let currentSearchTerm = "";

loadTrending();

movieNameInput.addEventListener("input", debounce(handleSuggestion, 400));

searchBtn.addEventListener("click", handleSearch);

function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}


function handleSuggestion() {
  suggestionContainer.innerHTML = "";

  const movieName = movieNameInput.value.trim();

  const url = `https://www.omdbapi.com/?apikey=${api}&s=${movieName}`;

  loading.style.display = "block";
  if(movieName === ""){
    loading.style.display = "none";
    return;
  }

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

        img.onload = () => {
          movieSuggestion.appendChild(img);
          movieSuggestion.appendChild(title);
          suggestionContainer.appendChild(movieSuggestion);
          loading.style.display = "none";
        };
      });
    } else {
      loading.style.display = "none";
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
  loading.style.display = "block";

  currentPage = 1;
  currentSearchTerm = movieNameInput.value.trim();

  if (!currentSearchTerm) {
    resultContainer.innerHTML = "<p>Please Enter a Movie Name.</p>";
    loading.style.display = "none";
    return;
  }

  suggestionContainer.style.display = "none";

  resultHeader.innerHTML = `
    <h2 style="text-align: center; margin-bottom: 20px;">You Searched: ${currentSearchTerm}</h2>
  `;

  fetchMovies(currentSearchTerm, currentPage)
    .then(data => {
      if (data.Response === "True") {
        data.Search.forEach(movie => {
          const img = fetchImage(movie);

          const movieCard = document.createElement("div");
          movieCard.classList.add("movie-card");

          const title = document.createElement("p");
          title.textContent = movie.Title;

          movieCard.appendChild(img);
          movieCard.appendChild(title);
          resultContainer.appendChild(movieCard);
        });

        // Only show "Load More" if there are more than 10 results
        if (parseInt(data.totalResults) > 10) {
          const loadButton = document.createElement("button");
          loadButton.textContent = "Load More";
          loadButton.classList.add("load-more-btn");
          loadButton.addEventListener("click", handleLoadMore);
          pageContainer.appendChild(loadButton);
        }

        loading.style.display = "none";
      } else {
        resultContainer.innerHTML = "<p>No Result Found.</p>";
        loading.style.display = "none";
      }
    })
    .catch(error => {
      resultContainer.innerHTML = `<p>Error fetching data: ${error.message}</p>`;
      loading.style.display = "none";
    });
}

function fetchMovies(term, page) {
  const url = `https://www.omdbapi.com/?apikey=${api}&s=${term}&page=${page}`;
  return fetch(url).then(res => res.json());
}

function fetchImage(movie) {
  const img = document.createElement("img");

  img.src = movie.Poster !== "N/A" ? movie.Poster : "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";

  img.onerror = () => {
    img.src = "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";
  }

  return img;
}

function handleLoadMore() {
  currentPage++;
  loading.style.display = "block";

  fetchMovies(currentSearchTerm, currentPage)
    .then(data => {
      if (data.Response === "True") {
        const loadMoreBtn = document.querySelector(".load-more-btn");
        if (loadMoreBtn) loadMoreBtn.remove();

        data.Search.forEach(movie => {
          const img = fetchImage(movie);

          const movieCard = document.createElement("div");
          movieCard.classList.add("movie-card");

          const title = document.createElement("p");
          title.textContent = movie.Title;

          movieCard.appendChild(img);
          movieCard.appendChild(title);
          resultContainer.appendChild(movieCard);
        });

        // Check if more pages exist
        const maxPages = Math.ceil(parseInt(data.totalResults) / 10);
        if (currentPage < maxPages) {
          const loadButton = document.createElement("button");
          loadButton.textContent = "Load More";
          loadButton.classList.add("load-more-btn");
          loadButton.addEventListener("click", handleLoadMore);
          pageContainer.appendChild(loadButton);
        }

        loading.style.display = "none";
      } else {
        loading.style.display = "none";
      }
    })
    .catch(error => {
      resultContainer.innerHTML += `<p>Error loading more: ${error.message}</p>`;
      loading.style.display = "none";
    });
}


function loadTrending() {
  resultContainer.innerHTML = "";
  suggestionContainer.innerHTML = "";
  resultHeader.innerHTML = "";
  loading.style.display = "block";

  resultHeader.innerHTML = `
    <h2 style="text-align: center; margin-bottom: 20px;">Trending Movies 🔥</h2>
  `;

  const trendingMovies = ["Avengers", "Inception", "Titanic", "Batman", "Interstellar"];

  const fetchPromises = trendingMovies.map(movieName => {
    const url = `https://www.omdbapi.com/?apikey=${api}&s=${movieName}`;
    return fetch(url).then(res => res.json());
  });

  Promise.all(fetchPromises)
    .then(allData => {
      allData.forEach(data => {
        if (data.Response === "True") {
          data.Search.slice(0, 3).forEach(movie => {
            const img = fetchImage(movie);

            const movieCard = document.createElement("div");
            movieCard.classList.add("movie-card");

            const title = document.createElement("p");
            title.textContent = movie.Title;

            movieCard.appendChild(img);
            movieCard.appendChild(title);
            resultContainer.appendChild(movieCard);
          });
        }
      });

      loading.style.display = "none";
    })
    .catch(error => {
      resultContainer.innerHTML = `<p>Error fetching data: ${error.message}</p>`;
      loading.style.display = "none";
    });
}

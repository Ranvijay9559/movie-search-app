const movieNameInput = document.getElementById("moviename-input");
const searchBtn = document.getElementById("search-btn");
const resultContainer = document.getElementById("result-container");
const suggestionContainer = document.getElementById("suggestion-container");
const loading = document.getElementById("loading");
const resultHeader = document.getElementById("result-header");
const pageContainer = document.getElementById("page-container");
const featuredSection = document.getElementById("featured-section");
const featuredContainer = document.getElementById("featured-container");
const homeBtn = document.getElementById("home-btn");

const api = MOVIE_SEARCH_API;
let currentPage = 1;
let currentSearchTerm = "";

loadFeaturedMovies();
loadTrending();

movieNameInput.addEventListener("input", debounce(handleSuggestion, 400));
movieNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleSearch();
  }
});
searchBtn.addEventListener("click", handleSearch);
homeBtn.addEventListener("click", goToHome);

function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function fetchImage(movie) {
  const img = document.createElement("img");
  img.src = movie.Poster !== "N/A"
    ? movie.Poster
    : "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";
  img.onerror = () => {
    img.src = "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg";
  };
  return img;
}

function fetchMovies(term, page) {
  const url = `https://www.omdbapi.com/?apikey=${api}&s=${term}&page=${page}`;
  return fetch(url).then(res => res.json());
}

function handleSuggestion() {
  suggestionContainer.innerHTML = "";
  const movieName = movieNameInput.value.trim();
  const url = `https://www.omdbapi.com/?apikey=${api}&s=${movieName}`;

  if (movieName === "") {
    loading.style.display = "none";
    return;
  }

  loading.style.display = "block";

  fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.Response === "True") {
        data.Search.slice(0, 5).forEach(movie => {
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
    });
}

function handleSearch() {
  currentPage = 1;
  currentSearchTerm = movieNameInput.value.trim();

  if (!currentSearchTerm) {
    resultContainer.innerHTML = "<p>Please Enter a Movie Name.</p>";
    loading.style.display = "none";
    return;
  }

  featuredSection.style.display = "none";
  pageContainer.innerHTML = "";
  resultContainer.innerHTML = "";
  resultHeader.innerHTML = `<h2 style="text-align: center; margin-bottom: 20px;">You Searched: ${currentSearchTerm}</h2>`;
  suggestionContainer.style.display = "none";
  loading.style.display = "block";
  homeBtn.style.display = "block";

  fetchMovies(currentSearchTerm, currentPage)
    .then(data => {
      loading.style.display = "none";
      if (data.Response === "True") {
        data.Search.forEach(movie => {
          const movieCard = document.createElement("div");
          movieCard.classList.add("movie-card");

          const img = fetchImage(movie);
          const title = document.createElement("p");
          title.textContent = movie.Title;

          movieCard.appendChild(img);
          movieCard.appendChild(title);
          resultContainer.appendChild(movieCard);
        });

        if (parseInt(data.totalResults) > 10) {
          const loadButton = document.createElement("button");
          loadButton.textContent = "Load More";
          loadButton.classList.add("load-more-btn");
          loadButton.addEventListener("click", handleLoadMore);
          pageContainer.appendChild(loadButton);
        }
      } else {
        resultContainer.innerHTML = "<p>No Result Found.</p>";
      }
    })
    .catch(error => {
      loading.style.display = "none";
      resultContainer.innerHTML = `<p>Error fetching data: ${error.message}</p>`;
    });
}

function handleLoadMore() {
  currentPage++;
  loading.style.display = "block";

  fetchMovies(currentSearchTerm, currentPage)
    .then(data => {
      loading.style.display = "none";
      const loadMoreBtn = document.querySelector(".load-more-btn");
      if (loadMoreBtn) loadMoreBtn.remove();

      if (data.Response === "True") {
        data.Search.forEach(movie => {
          const movieCard = document.createElement("div");
          movieCard.classList.add("movie-card");

          const img = fetchImage(movie);
          const title = document.createElement("p");
          title.textContent = movie.Title;

          movieCard.appendChild(img);
          movieCard.appendChild(title);
          resultContainer.appendChild(movieCard);
        });

        const maxPages = Math.ceil(parseInt(data.totalResults) / 10);
        if (currentPage < maxPages) {
          const loadButton = document.createElement("button");
          loadButton.textContent = "Load More";
          loadButton.classList.add("load-more-btn");
          loadButton.addEventListener("click", handleLoadMore);
          pageContainer.appendChild(loadButton);
        }
      }
    })
    .catch(error => {
      loading.style.display = "none";
      resultContainer.innerHTML += `<p>Error loading more: ${error.message}</p>`;
    });
}

function goToHome() {
  movieNameInput.value = "";
  currentSearchTerm = "";
  currentPage = 1;

  resultContainer.innerHTML = "";
  resultHeader.innerHTML = "";
  pageContainer.innerHTML = "";
  suggestionContainer.innerHTML = "";
  featuredContainer.innerHTML = "";
  featuredSection.style.display = "block";
  homeBtn.style.display = "none";

  loadFeaturedMovies();
  loadTrending();
}

function loadFeaturedMovies() {
  const featuredMovies = ["Avengers", "Interstellar", "Inception", "Titanic", "The Dark Knight"];
  const fetches = featuredMovies.map(title => {
    const url = `https://www.omdbapi.com/?apikey=${api}&s=${title}`;
    return fetch(url).then(res => res.json());
  });

  Promise.all(fetches).then(allData => {
    featuredContainer.innerHTML = "";
    allData.forEach(data => {
      if (data.Response === "True") {
        const movie = data.Search[0];
        const card = document.createElement("div");
        card.classList.add("featured-card");

        const img = fetchImage(movie);
        const title = document.createElement("p");
        title.textContent = movie.Title;

        card.appendChild(img);
        card.appendChild(title);
        featuredContainer.appendChild(card);
      }
    });
  }).catch(error => {
    featuredContainer.innerHTML = `<p>Error loading featured movies: ${error.message}</p>`;
  });
}

function loadTrending() {
  resultContainer.innerHTML = "";
  resultHeader.innerHTML = `<h2 style="text-align: center; margin-bottom: 20px;">Trending Movies 🔥</h2>`;
  loading.style.display = "block";

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
            const movieCard = document.createElement("div");
            movieCard.classList.add("movie-card");

            const img = fetchImage(movie);
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

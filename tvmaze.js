"use strict";

// form
const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $showCard = $(".card");

// modal
const showModal = document.getElementById('showModal');
const $modalBody = $(".modal-body");

const defaultImg = "https://tinyurl.com/missing-tv";

// Fetch shows
async function getShowsByTerm(term) {
  const response = await axios.get('https://api.tvmaze.com/search/shows', {params: {q: term}});
  
  return response.data;
}

// Given list of shows, create markup for each and to DOM 
function populateShows(shows) {
  $showsList.empty();

  for (let [i, show] of shows.entries()) {
    const $show = $(
      `<div class="card text-bg-dark" data-show-id="${show.show.id}" data-bs-toggle="modal" data-bs-target="#showModal" role="button">
        <img src="${show.show.image.original ? show.show.image.original : defaultImg}" class="card-img h-100" alt="...">
        <div class="card-img-overlay d-flex flex-column justify-content-between">
          <p class="card-text text-end"><span class="badge p-2 text-bg-dark">${show.show.rating.average ? show.show.rating.average : 0}</span></p>
          <h5 class="card-title mb-0">${show.show.name}</h5>
        </div>
        <input class="show-info d-none" data-genre="${show.show.genres}" data-premiered="${show.show.premiered}" data-rating=${show.show.rating.average ? show.show.rating.average : 0} hidden=true>
        <div class="d-none show-h-summary">${show.show.summary}</div>      
        </div>`
    );

    $showsList.append($show);

    $($show).css({'opacity': 0, 'top': '200px'});
    $($show).delay(200 * i).animate({
      opacity: 1.0,
      top: '0px'
    }, 450);
    
  }
}

// Handle search form submission: get shows from API and display.
async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $("#searchForm-term").val('');

  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();

  await searchForShowAndDisplay();
});

// Create markup for modal
function populateModal(title, img, genres, date, rating, summary){
  const $currShow = $(`
    <div class="show-container">
      <div class="current-show-info">
        <h1>${title}</h1>
        <p class="subtitle"><span>${date}</span><span>${rating}</span><span>${genres}</span></p>
        <div class="show-summary">${summary}</div>
      </div>
      <div class="show-img-wrapper">
        <img src="${img}">
        <div class="img-overlay"></div>
      </div>
    </div>
  `);

  $modalBody.append($currShow);
}

// Given show id, create markup for episodes
function populateEpisodes(episodes){
  // add episodes section
  const $episodeContainer = $('<div class="episodes-container"><h2>Episodes</h2></div>');
  
  $modalBody.append($episodeContainer);

  for (let episode of episodes) {
    const $episode = $(
        `<div>
           ${episode.name}
           (season ${episode.season}, episode ${episode.number})
         </div>`
    );

    $episodeContainer.append($episode);
  }
}

// Fetch episodes
async function getShowEpisodes(id) {
  const response = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  
  return response.data.map(e => ({
    id: e.id,
    name: e.name,
    season: e.season,
    number: e.number,
  }));
}

// populate modal
showModal.addEventListener('show.bs.modal', async function (event) {
  // Button that triggered the modal
  const button = event.relatedTarget

  // Extract info from data attributes
  const showId = button.getAttribute('data-show-id');
  const showTitle = $(button).find(".card-title").text();
  const showImg = $(button).find(".card-img").attr('src');
  const showGenres = $(button).find(".show-info").data('genre');
  const showPremiered = $(button).find(".show-info").data('premiered');
  const showRating = $(button).find(".show-info").data('rating');
  const showSummary = $(button).find(".show-h-summary").text();

   // Update the modal's content.
  populateModal(showTitle, showImg, showGenres, showPremiered, showRating, showSummary);
  
  // Get show episodes and update dom
  const episodes = await getShowEpisodes(showId);

  populateEpisodes(episodes);
});

// clear modal
showModal.addEventListener('hidden.bs.modal', function (event) {

  $modalBody.empty();
})

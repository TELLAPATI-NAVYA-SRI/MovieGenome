import React, { useEffect, useState } from "react";
import "./Browse.css";
import MovieCard from "./movieCard";
import { fetchPopularMovies, fetchGenreMap , fetchMoviesByMood} from "../services/tmdbApi";
import { Link } from "react-router-dom";

  // Import TMDb API call
import { fetchSimilarMoviesForFavorites } from "../services/tmdbApi";

  
  
  const moods = [
    { name: "Exciting", emoji: "🎢", image: "https://dummyimage.com/100x100/000/fff.png&text=Exciting" },
    { name: "Relaxing", emoji: "🧘", image: "https://dummyimage.com/100x100/000/fff.png&text=Relaxing" },
    { name: "Adventurous", emoji: "🗺️", image: "https://dummyimage.com/100x100/000/fff.png&text=Adventurous" },
    { name: "Dramatic", emoji: "🎭", image: "https://dummyimage.com/100x100/000/fff.png&text=Dramatic" },
    { name: "Fun", emoji: "😂", image: "https://dummyimage.com/100x100/000/fff.png&text=Fun" },
];




// Dummy "Movies You May Like" (same placeholders for now)
const recommendedMovies = [
  { title: "Recommended One", image: "https://via.placeholder.com/300x450?text=Movie+1", type: "Drama", release: "2024" },
  { title: "Recommended Two", image: "https://via.placeholder.com/300x450?text=Movie+2", type: "Sci-Fi", release: "2023" },
  { title: "Recommended Three", image: "https://via.placeholder.com/300x450?text=Movie+3", type: "Action", release: "2022" },
  { title: "Recommended Four", image: "https://via.placeholder.com/300x450?text=Movie+4", type: "Comedy", release: "2021" },
];

function Browse() {
  const [movies, setMovies] = useState([]); // Movies from the API
  const [maxCards, setMaxCards] = useState(0);
  const [genreMap, setGenreMap] = useState({});
  const [moodMovies, setMoodMovies] = useState([]);
  const [selectedMood, setSelectedMood] = useState("");
  const [recommendedMovies, setRecommendedMovies] = useState([]);

  useEffect(() => {
    const loadData = async () => {
        const genres = await fetchGenreMap();
        setGenreMap(genres);

        const moviesData = await fetchPopularMovies();
        const formattedMovies = moviesData.map(movie => ({
            id: movie.id,
            title: movie.title,
            image: movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
                : "https://via.placeholder.com/300x450?text=No+Image",
            genres: movie.genre_ids.map(id => genres[id] || "Unknown").join(", "),
            release: movie.release_date ? movie.release_date.split("-")[0] : "Unknown"
        }));
        setMovies(formattedMovies);
    };

    const loadRecommendations = async () => {
      const user = JSON.parse(localStorage.getItem("cineGenomeUser"));
      if (!user) return;

      const res = await fetch(`http://3.142.171.217:5000/api/get-favorites?userId=${user.userId}`);
      const data = await res.json();
      console.log(data)
      const favoriteIds = data.favorites.map(fav => fav.id);

      if (favoriteIds.length > 0) {
          const recommended = await fetchSimilarMoviesForFavorites(favoriteIds);
          console.log(favoriteIds)
          const genres = await fetchGenreMap();
          setGenreMap(genres);
          const formattedMovies = recommended.map(movie => ({
            id: movie.id,
            title: movie.title,
            image: movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
                : "https://via.placeholder.com/300x450?text=No+Image",
            genres: movie.genre_ids.map(id => genres[id] || "Unknown").join(", "),
            release: movie.release_date ? movie.release_date.split("-")[0] : "Unknown"
          }));
          
          setRecommendedMovies(formattedMovies);
      }
  };

    loadData();
    loadRecommendations();
  }, []);
  const calculateMaxCards = () => {
    const cardWidth = 220; // Must match CSS width + margin/padding
    const screenWidth = window.innerWidth - 100; // leave some padding
    return Math.floor(screenWidth / cardWidth);
  };

  useEffect(() => {
    const updateCards = () => setMaxCards(calculateMaxCards());
    updateCards();

    window.addEventListener("resize", updateCards);
    return () => window.removeEventListener("resize", updateCards);
  }, []);      

  const handleMoodClick = async (mood) => {
    setSelectedMood(mood);

    const movies = await fetchMoviesByMood(mood);  // directly get the movie results array!

    const formatted = movies.map(movie => ({
      id: movie.id,
      title: movie.title,
      image: movie.poster_path 
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
        : "https://via.placeholder.com/300x450?text=No+Image",
      genres: movie.genre_ids ? movie.genre_ids.map(id => genreMap[id] || "Unknown").join(", ") : "Unknown",
      release: movie.release_date ? movie.release_date.split("-")[0] : "Unknown"
    }));

    setMoodMovies(formatted);
};


  return (
    <div className="browse-container">
      <nav className="navbar">
          <h2 className="logo"> CineGenome</h2>
          <div className="nav-links">
            <a href="/myCollection">My Collection</a>
            <a href="/browse" className="active">Browse</a>
            <a href="#" onClick={() => {
                localStorage.removeItem("cineGenomeUser");
                window.location.href = "/";  // Redirect to login or home page
            }}>Logout</a>
          </div>
      </nav>


      {/* Movies List Section */}
      <div className="moviesList">
        <div className="movies-header">
          <h2 className="section-title">🎬 Movies List</h2>
          <a href="/allMovies" className="view-all">View All</a>
        </div>

        <div className="movies-container">
        {movies.length > 0 ? (
          movies
            .slice(0, maxCards - 1)
            .map((movie) => (
              <Link to={`/movie/${movie.id}`} key={movie.id} className="movie-card-link">
                <div className="movie-card">
                  <img src={movie.image} alt={movie.title} />
                  <h3>{movie.title}</h3>
                  <p>{movie.genres} - {movie.release}</p>
                </div>
              </Link>
            ))
        ) : (
          <p>Loading movies...</p>
        )}
        </div>

      </div>

      {/* Moods Section */}
      <h2 className="section-title">🎭 Moods</h2>
      <div className="moods-container">
          {moods.map((mood, index) => (
              <div key={index} className="mood-card" onClick={() => handleMoodClick(mood.name)}>
                  <div className="mood-circle">
                      <span className="emoji">{mood.emoji}</span>
                  </div>
                  <p>{mood.name}</p>
              </div>
          ))}
      </div>


      {selectedMood && (
        <div className="mood-modal-overlay" onClick={() => setSelectedMood("")}>
          
          <button className="close-button" onClick={() =>{  setSelectedMood("")}}>✖</button>
          
          <div className="mood-modal-content" onClick={e => e.stopPropagation()}>
          
            
            <h2>Movies for mood: {selectedMood}</h2>
            <div className="movies-container">
            {moodMovies.length > 0 ? (
              moodMovies.map(movie => (
                <Link to={`/movie/${movie.id}`} key={movie.id} className="movie-card-link">
                  <div className="movie-card">
                    <img src={movie.image} alt={movie.title} />
                    <h3>{movie.title}</h3>
                    <p>{movie.genres} - {movie.release}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p>No movies found for this mood.</p>
            )}

            </div>
          </div>
        </div>
      )}


      {/* Movies You May Like Section */}
      <div className="moviesList1">
          <div className="movies-header">
              <h2 className="section-title">🎬 Movies You May Like ❤️...</h2>
          </div>

          <div className="movies-container-horizontal">
              {recommendedMovies.length > 0 ? (
                  recommendedMovies.map(movie => (
                      <Link to={`/movie/${movie.id}`} key={movie.id} className="movie-card-link">
                          <div className="movie-card">
                              <img src={movie.image} alt={movie.title} />
                              <h3>{movie.title}</h3>
                              <p>{movie.genres} - {movie.release}</p>
                          </div>
                      </Link>
                  ))
              ) : (
                  <p>No recommendations found.</p>
              )}
          </div>
      </div>
    </div>
  );
}

export default Browse;

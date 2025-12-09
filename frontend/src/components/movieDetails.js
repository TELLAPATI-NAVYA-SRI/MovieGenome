import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import "./movieDetails.css";
import { fetchMovieDetails, fetchMovieTrailer, fetchSimilarMovies, fetchGenreMap, fetchPopularMovies, findGenomeSimilarMovies } from "../services/tmdbApi";

function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [genreMap, setGenreMap] = useState({});
  const [showTrailer, setShowTrailer] = useState(false);
  const [liked, setLiked] = useState(false);
  const [meh, setMeh] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);


  
  useEffect(() => {
    const loadMovieDetails = async () => {
      const genres = await fetchGenreMap();
      setGenreMap(genres);

      const movieData = await fetchMovieDetails(id);
      setMovie({
        ...movieData,
        genres: movieData.genres.map(g => g.name).join(", "),
        release: movieData.release_date ? movieData.release_date.split("-")[0] : "",
        director: movieData.credits?.crew.find(c => c.job === "Director")?.name || ""
      });

      const trailerData = await fetchMovieTrailer(id);
      setTrailer(trailerData);

      const similar = await fetchSimilarMovies(id);

// 1️⃣ If TMDb gives results, use only them
      if (similar.length > 0) {
          const tmdbSimilar = similar.map(m => ({
              ...m,
              source: "tmdb",
              similarityScore: 999
          })).slice(0, 10); // limit to 10
          setSimilarMovies(tmdbSimilar);

      } else {
          // 2️⃣ Otherwise, use genome similarity
          const allPopularMovies = await fetchPopularMovies();
          const genomeSimilar = findGenomeSimilarMovies(movieData, allPopularMovies)
              .map(m => ({
                  ...m,
                  source: "genome",
                  similarityScore: m.similarityScore
              }))
              .slice(0, 10);

          setSimilarMovies(genomeSimilar);
      }


      const user = JSON.parse(localStorage.getItem("cineGenomeUser"));
      if (user) {
        const res = await fetch(`http://3.142.171.217:5000/api/check-favorite?userId=${user.userId}&movieId=${id}`);
        const data = await res.json();
        console.log(data)
        if (data.isFavorite) {
            setLiked(true);  // show button as liked
        }
        else {
          setLiked(false);  // 👈 reset when movie is not favorite!
        }
        
        };
    }

    loadMovieDetails();
  }, [id]);

  const handleLike = async () => {
    const user = JSON.parse(localStorage.getItem("cineGenomeUser"));
    if (!user) {
        alert("Please log in to save favorites.");
        return;
    }

    if (!liked) {
        // ADD to favorites
        const res = await fetch("http://3.142.171.217:5000/api/add-favorite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user.userId,
                movieData: movie
            })
        });

        
        setLiked(true);

    } else {
        // REMOVE from favorites
        const res = await fetch("http://3.142.171.217:5000/api/remove-favorite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: user.userId,
                movieId: movie.id
            })
        });

        
        setLiked(false);
    }
  };



  if (!movie) {
    return (
      <div className="not-found">
        <h2>Loading...</h2>
        <Link to="/browse" className="back-link">Back to Browse</Link>
      </div>
    );
  }

  return (
    <div className="movie-details-container">
      <nav className="navbar">
          <h2 className="logo"> CineGenome</h2>
          <div className="nav-links">
            <a href="/myCollection">My Collection</a>
            <a href="/browse" >Browse</a>
            <a href="#" onClick={() => {
                localStorage.removeItem("cineGenomeUser");
                window.location.href = "/";  // Redirect to login or home page
            }}>Logout</a>
          </div>
      </nav>


      <div
        className="movie-hero"
        style={{
          backgroundImage: movie.backdrop_path
            ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
            : "url('https://dummyimage.com/500x200/b2b2b2/ffffff.png&text=Movie+Poster')"
        }}
      >
        <div className="movie-info">
          <h1>{movie.title}</h1>
          <p>{movie.release} • {movie.director ? <>Directed by {movie.director}</>:<></>}</p>
          <p>{movie.genres}</p>
          <p>Rating: ⭐ {movie.vote_average} / 10</p>
          <button 
              className={`favorite-btn ${liked ? "liked" : ""}`} 
              onClick={handleLike}
          >
              {liked ? "💚 Added to Favorites" : "🤍 Add to Favorites"} 
          </button>

          <button className="details-btn" onClick={() => setShowMoreDetails(!showMoreDetails)}>
            {showMoreDetails ? "Hide Details" : "View Details"}
          </button>
        </div>

        <div className="trailer">
          {trailer ? (
            <img
              src={`https://img.youtube.com/vi/${trailer.key}/0.jpg`}
              alt="Trailer Thumbnail"
              className="trailer-img"
              onClick={() => setShowTrailer(true)}
              style={{ cursor: "pointer" }}
            />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#333',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px'
            }}>
              No Trailer
            </div>
          )}
        </div>
      </div>

      <h2 className="section-title">🎬 More Like This...</h2>
      <div className="movies-grid">
        {similarMovies.map((m) => (
          <Link to={`/movie/${m.id}`} key={m.id} className="movie-card-link">
          <div className="movie-card">
            <img 
              src={m.poster_path 
                ? `https://image.tmdb.org/t/p/w500${m.poster_path}` 
                : "https://via.placeholder.com/300x450?text=No+Image"} 
              alt={m.title} 
            />
            <h3>{m.title}</h3>
            <p>{m.release_date ? m.release_date.split("-")[0] : ""}</p>
            <p>
              {m.genre_ids && m.genre_ids.length > 0
                ? m.genre_ids.map(id => genreMap[id] || "Unknown").join(", ")
                : ""}
            </p>
          </div>
        </Link>
        
        ))}
      </div>
      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <div className="modal-overlay" onClick={() => setShowTrailer(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <iframe
              width="800"
              height="450"
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Trailer"
            ></iframe>
            <button className="close-button" onClick={() => setShowTrailer(false)}>✖</button>
          </div>
        </div>
      )}
      {showMoreDetails && (
        <div className="details-modal-overlay" onClick={() => setShowMoreDetails(false)}>
          <div className="details-modal-content" onClick={e => e.stopPropagation()}>
            <h2>{movie.title} - Details</h2>
            {movie.tagline && <p><strong>Tagline:</strong> {movie.tagline}</p>}
            <p><strong>OverView:</strong> {movie.runtime ? `${movie.overview} minutes` : "Unknown"}</p>
            <p><strong>Runtime:</strong> {movie.runtime ? `${movie.runtime} minutes` : "Unknown"}</p>
            <p><strong>Budget:</strong> {movie.budget ? `$${movie.budget.toLocaleString()}` : "Unknown"}</p>
            <p><strong>Revenue:</strong> {movie.revenue ? `$${movie.revenue.toLocaleString()}` : "Unknown"}</p>
            <p><strong>Languages:</strong> {movie.spoken_languages.map(l => l.english_name).join(", ")}</p>
            <p><strong>Production Companies:</strong> {movie.production_companies.map(c => c.name).join(", ")}</p>
            <button className="close-button" onClick={() => setShowMoreDetails(false)}>✖</button>
          </div>
        </div>
      )}



    </div>
  );
}

export default MovieDetails;

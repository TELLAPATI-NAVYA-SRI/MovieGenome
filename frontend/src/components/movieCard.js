import React from "react";

function MovieCard({ movie }) {
  return (
    <div className="movie-card">
      <img src={movie.image} alt={movie.title} loading="lazy" />
      <h3>{movie.title}</h3>
      <p><strong>{movie.type}</strong> - {movie.release}</p>
    </div>
  );
}

export default MovieCard;

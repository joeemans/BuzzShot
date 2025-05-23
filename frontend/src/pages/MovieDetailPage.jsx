import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Page from "./Page";
import StarRating from "../components/StarRating";

const MovieDetailPage = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [buzzshotRating, setBuzzshotRating] = useState({
    averageRating: 0,
    totalReviews: 0,
  });
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        // Fetch movie details
        const movieResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${id}?language=en-US`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
            },
          },
        );
        const movieData = await movieResponse.json();
        setMovie(movieData);

        // Fetch cast
        const creditsResponse = await fetch(
          `https://api.themoviedb.org/3/movie/${id}/credits?language=en-US`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
            },
          },
        );
        const creditsData = await creditsResponse.json();
        setCast(creditsData.cast ? creditsData.cast.slice(0, 8) : []);
      } catch (err) {
        setError("Failed to load movie details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/reviews/movie/${id}`,
          {
            credentials: "include",
          },
        );
        if (!response.ok) {
          setReviews([]);
          setBuzzshotRating({ averageRating: 0, totalReviews: 0 });
          return;
        }
        const data = await response.json();
        setReviews(data.reviews || []);
        setBuzzshotRating({
          averageRating: data.averageRating || 0,
          totalReviews: data.reviews?.length || 0,
        });
      } catch (err) {
        console.error("Failed to load reviews:", err);
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!userRating || !userReview) return;

    try {
      const response = await fetch("http://localhost:3000/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          mediaId: id,
          mediaType: "movie",
          rating: userRating,
          review: userReview,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setReviews([data, ...reviews]);
        setUserRating(0);
        setUserReview("");
        // Refresh the average rating
        const ratingResponse = await fetch(
          `http://localhost:3000/api/reviews/movie/${id}`,
          {
            credentials: "include",
          },
        );
        if (ratingResponse.ok) {
          const ratingData = await ratingResponse.json();
          setBuzzshotRating({
            averageRating: ratingData.averageRating || 0,
            totalReviews: ratingData.reviews?.length || 0,
          });
        }
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
    }
  };

  if (loading) {
    return (
      <Page>
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-center text-lg text-white">
            Loading movie details...
          </p>
        </div>
      </Page>
    );
  }

  if (error || !movie) {
    return (
      <Page>
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-center text-lg text-red-500">
            {error || "Movie not found"}
          </p>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="container mx-auto px-4 py-8">
        {/* Movie Header */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row">
          <div className="w-full md:w-1/3">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          <div className="w-full md:w-2/3">
            <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
              {movie.title}
            </h1>
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg text-gray-300">TMDB Rating:</span>
                <StarRating rating={movie.vote_average} readonly />
                <span className="text-gray-400">
                  ({movie.vote_average.toFixed(1)})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg text-gray-300">BuzzShot Rating:</span>
                <StarRating rating={buzzshotRating.averageRating} readonly />
                <span className="text-gray-400">
                  ({buzzshotRating.averageRating.toFixed(1)})
                </span>
                <span className="text-sm text-gray-400">
                  ({buzzshotRating.totalReviews} reviews)
                </span>
              </div>
            </div>
            <p className="mb-4 text-gray-300">{movie.overview}</p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 md:grid-cols-4">
              <div>
                <span className="font-semibold">Release Date:</span>{" "}
                {new Date(movie.release_date).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Runtime:</span> {movie.runtime}{" "}
                min
              </div>
              <div>
                <span className="font-semibold">Language:</span>{" "}
                {movie.original_language.toUpperCase()}
              </div>
              <div>
                <span className="font-semibold">Status:</span> {movie.status}
              </div>
            </div>
          </div>
        </div>

        {/* Cast Section */}
        {cast.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-white">Cast</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
              {cast.map((actor) => (
                <div
                  key={actor.cast_id || actor.credit_id}
                  className="text-center"
                  title={actor.character}
                >
                  <img
                    src={
                      actor.profile_path
                        ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                        : "https://via.placeholder.com/185x278?text=No+Image"
                    }
                    alt={actor.name}
                    className="mx-auto mb-1 h-40 w-28 rounded-lg object-cover shadow-md"
                    loading="lazy"
                  />
                  <p className="truncate text-sm font-semibold text-white">
                    {actor.name}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {actor.character}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review Section */}
        <div className="mb-8 rounded-lg bg-gray-800 p-6">
          <h2 className="mb-4 text-2xl font-semibold text-white">
            Write a Review
          </h2>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Your Rating
              </label>
              <div className="flex items-center gap-2">
                <StarRating
                  rating={userRating}
                  setRating={setUserRating}
                  readonly={false}
                />
                <span className="text-gray-400">({userRating.toFixed(1)})</span>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Your Review
              </label>
              <textarea
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
                className="w-full rounded-lg bg-gray-700 p-3 text-white placeholder-gray-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                rows="4"
                placeholder="Write your review here..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={!userRating || !userReview}
              className={`rounded-lg px-6 py-2 font-medium text-white transition ${
                userRating && userReview
                  ? "bg-red-600 hover:bg-red-700"
                  : "cursor-not-allowed bg-gray-600"
              }`}
            >
              Submit Review
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-white">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-400">
              No reviews yet. Be the first to review!
            </p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={
                    review.username +
                    "-" +
                    (review.created_at || "") +
                    "-" +
                    review.rating
                  }
                  className="rounded-lg border border-gray-700 bg-gray-800 p-6"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-white">
                        {review.username}
                      </span>
                      <div className="flex items-center gap-2">
                        <StarRating rating={review.rating} readonly />
                        <span className="text-sm text-gray-400">
                          ({review.rating.toFixed(1)})
                        </span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-gray-200">
                    {review.review}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};

export default MovieDetailPage;

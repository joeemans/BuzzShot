import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Page from "./Page";
import StarRating from "../components/StarRating";

const SeriesDetailPage = () => {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [buzzshotRating, setBuzzshotRating] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchSeriesDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.themoviedb.org/3/tv/${id}?language=en-US`,
          {
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
            },
          },
        );
        const data = await response.json();
        setSeries(data);
        setSeasons(data.seasons || []);
        if (data.seasons && data.seasons.length > 0) {
          setSelectedSeason(data.seasons[0]);
        }
      } catch (err) {
        setError("Failed to load series details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSeriesDetails();
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/reviews/tv/${id}`,
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

  useEffect(() => {
    const fetchSeasonDetails = async () => {
      if (selectedSeason?.season_number) {
        try {
          const response = await fetch(
            `https://api.themoviedb.org/3/tv/${id}/season/${selectedSeason.season_number}?language=en-US`,
            {
              headers: {
                accept: "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_API_TOKEN}`,
              },
            },
          );
          const data = await response.json();
          setSelectedSeason(data);
        } catch (err) {
          console.error("Failed to load season details:", err);
        }
      }
    };

    fetchSeasonDetails();
  }, [id, selectedSeason?.season_number]);

  const handleSeasonChange = (seasonNumber) => {
    const season = seasons.find((s) => s.season_number === seasonNumber);
    setSelectedSeason(season);
  };

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
          mediaType: "tv",
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
          `http://localhost:3000/api/reviews/tv/${id}`,
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
            Loading series details...
          </p>
        </div>
      </Page>
    );
  }

  if (error || !series) {
    return (
      <Page>
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-center text-lg text-red-500">
            {error || "Series not found"}
          </p>
        </div>
      </Page>
    );
  }

  return (
    <Page>
      <div className="container mx-auto px-4 py-8">
        {/* Series Header */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row">
          <div className="w-full md:w-1/3">
            <img
              src={`https://image.tmdb.org/t/p/w500${series.poster_path}`}
              alt={series.name}
              className="w-full rounded-lg shadow-lg"
            />
          </div>
          <div className="w-full md:w-2/3">
            <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
              {series.name}
            </h1>
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-lg text-gray-300">TMDB Rating:</span>
                <StarRating rating={series.vote_average} readonly />
                <span className="text-gray-400">
                  ({series.vote_average.toFixed(1)})
                </span>
              </div>
              {buzzshotRating && (
                <div className="flex items-center gap-2">
                  <span className="text-lg text-gray-300">
                    BuzzShot Rating:
                  </span>
                  <StarRating rating={buzzshotRating.averageRating} readonly />
                  <span className="text-gray-400">
                    ({buzzshotRating.averageRating.toFixed(1)})
                  </span>
                </div>
              )}
            </div>
            <p className="mb-4 text-gray-300">{series.overview}</p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 md:grid-cols-4">
              <div>
                <span className="font-semibold">Status:</span> {series.status}
              </div>
              <div>
                <span className="font-semibold">First Air Date:</span>{" "}
                {new Date(series.first_air_date).toLocaleDateString()}
              </div>
              <div>
                <span className="font-semibold">Seasons:</span>{" "}
                {series.number_of_seasons}
              </div>
              <div>
                <span className="font-semibold">Episodes:</span>{" "}
                {series.number_of_episodes}
              </div>
            </div>
          </div>
        </div>

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
        {reviews.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold text-white">Reviews</h2>
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-lg bg-gray-800 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">
                        {review.username}
                      </span>
                      <div className="flex items-center gap-1">
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
                  <p className="text-gray-300">{review.review}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seasons Selection */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-white">Seasons</h2>
          <div className="flex flex-wrap gap-2">
            {seasons.map((season) => (
              <button
                key={season.season_number}
                onClick={() => handleSeasonChange(season.season_number)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedSeason?.season_number === season.season_number
                    ? "bg-red-600 text-white"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                Season {season.season_number}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Season Details */}
        {selectedSeason && (
          <div className="space-y-8">
            <div className="flex flex-col gap-6 md:flex-row">
              <div className="w-full md:w-1/4">
                <img
                  src={`https://image.tmdb.org/t/p/w300${selectedSeason.poster_path}`}
                  alt={`Season ${selectedSeason.season_number}`}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
              <div className="w-full md:w-3/4">
                <h3 className="mb-2 text-2xl font-semibold text-white">
                  Season {selectedSeason.season_number}
                </h3>
                <p className="mb-4 text-gray-300">{selectedSeason.overview}</p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 md:grid-cols-3">
                  <div>
                    <span className="font-semibold">Air Date:</span>{" "}
                    {new Date(selectedSeason.air_date).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-semibold">Episodes:</span>{" "}
                    {selectedSeason.episodes?.length || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Episodes List */}
            <div>
              <h4 className="mb-4 text-xl font-semibold text-white">
                Episodes
              </h4>
              <div className="space-y-4">
                {selectedSeason.episodes?.map((episode) => (
                  <div
                    key={episode.episode_number}
                    className="flex flex-col gap-4 rounded-lg bg-gray-800 p-4 md:flex-row"
                  >
                    <div className="w-full md:w-1/4">
                      <img
                        src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                        alt={`Episode ${episode.episode_number}`}
                        className="w-full rounded-lg"
                      />
                    </div>
                    <div className="w-full md:w-3/4">
                      <div className="mb-2 flex items-center justify-between">
                        <h5 className="text-lg font-semibold text-white">
                          {episode.episode_number}. {episode.name}
                        </h5>
                        <div className="flex items-center gap-2">
                          <StarRating rating={episode.vote_average} readonly />
                          <span className="text-sm text-gray-400">
                            ({episode.vote_average.toFixed(1)})
                          </span>
                        </div>
                      </div>
                      <p className="mb-2 text-sm text-gray-300">
                        {episode.overview}
                      </p>
                      <div className="text-xs text-gray-400">
                        Air Date:{" "}
                        {new Date(episode.air_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
};

export default SeriesDetailPage;

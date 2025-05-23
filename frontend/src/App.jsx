import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/LoginPage.jsx";
import Signup from "./pages/SignupPage.jsx";
import Cover from "./pages/CoverPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import "./App.css";
import HomePage from "./pages/HomePage.jsx";
import MoviesPage from "./pages/MoviesPage.jsx";
import SeriesPage from "./pages/SeriesPage.jsx";
import MovieDetail from "./pages/MovieDetailPage.jsx";
import SeriesDetailPage from "./pages/SeriesDetailPage.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Cover />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movies"
          element={
            <ProtectedRoute>
              <MoviesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/series"
          element={
            <ProtectedRoute>
              <SeriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/detail/movie/:id"
          element={
            <ProtectedRoute>
              <MovieDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/detail/tv/:id"
          element={
            <ProtectedRoute>
              <SeriesDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
        {/* Redirect to cover page for any unknown routes */}
      </Routes>
    </>
  );
}

export default App;

import { Movie, MovieDetails, Genre, Cast, Video } from "../store/useStore";

// Mock Genres
export const mockGenres: Genre[] = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

// Mock Movies Data
export const mockMovies: Movie[] = [
  {
    id: 1,
    title: "Avatar: The Way of Water",
    overview:
      "Set more than a decade after the events of the first film, learn the story of the Sully family (Jake, Neytiri, and their kids), the trouble that follows them, the lengths they go to keep each other safe, the battles they fight to stay alive, and the tragedies they endure.",
    poster_path: "/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg",
    backdrop_path: "/s16H6tpK2utvwDtzZ8Qy4qm5Emw.jpg",
    release_date: "2022-12-14",
    vote_average: 7.6,
    vote_count: 8500,
    genre_ids: [878, 12, 28],
    adult: false,
    original_language: "en",
    original_title: "Avatar: The Way of Water",
    popularity: 2500.5,
    video: false,
  },
  {
    id: 2,
    title: "Black Panther: Wakanda Forever",
    overview:
      "Queen Ramonda, Shuri, M'Baku, Okoye and the Dora Milaje fight to protect their nation from intervening world powers in the wake of King T'Challa's death.",
    poster_path: "/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
    backdrop_path: "/xDMIl84Qo5Tsu62c9DGWhmPI67A.jpg",
    release_date: "2022-11-09",
    vote_average: 7.3,
    vote_count: 5200,
    genre_ids: [28, 12, 18],
    adult: false,
    original_language: "en",
    original_title: "Black Panther: Wakanda Forever",
    popularity: 2000.3,
    video: false,
  },
  {
    id: 3,
    title: "The Batman",
    overview:
      "In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.",
    poster_path: "/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
    backdrop_path: "/b0PlSFdDwbyK0cf5RxwDpaOJQvQ.jpg",
    release_date: "2022-03-01",
    vote_average: 7.8,
    vote_count: 9100,
    genre_ids: [80, 9648, 53],
    adult: false,
    original_language: "en",
    original_title: "The Batman",
    popularity: 1800.7,
    video: false,
  },
  {
    id: 4,
    title: "Top Gun: Maverick",
    overview:
      "After more than thirty years of service as one of the Navy's top aviators, and dodging the advancement in rank that would ground him, Pete 'Maverick' Mitchell finds himself training a detachment of TOP GUN graduates for a specialized mission the likes of which no living pilot has ever seen.",
    poster_path: "/62HCnUTziyWcpDaBO2i1DX17ljH.jpg",
    backdrop_path: "/odJ4hx6g6vBt4lBWKFD1tI8WS4x.jpg",
    release_date: "2022-05-24",
    vote_average: 8.3,
    vote_count: 6800,
    genre_ids: [28, 18],
    adult: false,
    original_language: "en",
    original_title: "Top Gun: Maverick",
    popularity: 1600.2,
    video: false,
  },
  {
    id: 5,
    title: "Spider-Man: No Way Home",
    overview:
      "Peter Parker is unmasked and no longer able to separate his normal life from the high-stakes of being a super-hero. When he asks for help from Doctor Strange the stakes become even more dangerous, forcing him to discover what it truly means to be Spider-Man.",
    poster_path: "/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
    backdrop_path: "/14QbnygCuTO0vl7CAFmPf1fgZfV.jpg",
    release_date: "2021-12-15",
    vote_average: 8.1,
    vote_count: 18500,
    genre_ids: [28, 12, 878],
    adult: false,
    original_language: "en",
    original_title: "Spider-Man: No Way Home",
    popularity: 2800.9,
    video: false,
  },
  {
    id: 6,
    title: "Dune",
    overview:
      "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.",
    poster_path: "/d5NXSklXo0qyIYkgV94XAgMIckC.jpg",
    backdrop_path: "/iopYFB1b6Bh7FWZh3onQhph1sih.jpg",
    release_date: "2021-09-15",
    vote_average: 7.8,
    vote_count: 11000,
    genre_ids: [878, 12],
    adult: false,
    original_language: "en",
    original_title: "Dune",
    popularity: 1400.6,
    video: false,
  },
  {
    id: 7,
    title: "Encanto",
    overview:
      "The tale of an extraordinary family, the Madrigals, who live hidden in the mountains of Colombia, in a magical house, in a vibrant town, in a wondrous, charmed place called an Encanto.",
    poster_path: "/4j0PNHkMr5ax3IA8tjtxcmPU3QT.jpg",
    backdrop_path: "/3G1Q5xVL6bjKlLOUBY2SvKCl1FI.jpg",
    release_date: "2021-10-13",
    vote_average: 7.6,
    vote_count: 7800,
    genre_ids: [16, 35, 10751, 14, 10402],
    adult: false,
    original_language: "en",
    original_title: "Encanto",
    popularity: 1200.4,
    video: false,
  },
  {
    id: 8,
    title: "The Matrix Resurrections",
    overview:
      "Plagued by strange memories, Neo's life takes an unexpected turn when he finds himself back inside the Matrix.",
    poster_path: "/8c4a8kE7PizaGQQnditMmI1xbRp.jpg",
    backdrop_path: "/hNOM0QrnveW0w42VjQPQhZMkgZz.jpg",
    release_date: "2021-12-16",
    vote_average: 6.7,
    vote_count: 4500,
    genre_ids: [28, 878],
    adult: false,
    original_language: "en",
    original_title: "The Matrix Resurrections",
    popularity: 1100.8,
    video: false,
  },
];

// Mock Cast
export const mockCast: Cast[] = [
  {
    id: 1,
    name: "Sam Worthington",
    character: "Jake Sully",
    profile_path: "/yVTFWhPaRzz6FKLlwBIc6dNXWR.jpg",
    order: 0,
  },
  {
    id: 2,
    name: "Zoe Saldana",
    character: "Neytiri",
    profile_path: "/ofNrWiA2KDdqiNxFTLp51HcXSql.jpg",
    order: 1,
  },
  {
    id: 3,
    name: "Sigourney Weaver",
    character: "Dr. Grace Augustine",
    profile_path: "/flfhep27iBxseZIlxOMHt6zJFX1.jpg",
    order: 2,
  },
];

// Mock Videos
export const mockVideos: Video[] = [
  {
    id: "1",
    key: "a8Gx8wiNbs8",
    name: "Official Trailer",
    site: "YouTube",
    type: "Trailer",
    official: true,
  },
  {
    id: "2",
    key: "7VrYjhOZzX8",
    name: "Behind the Scenes",
    site: "YouTube",
    type: "Behind the Scenes",
    official: true,
  },
];

// Create detailed movie from basic movie
export const createMockMovieDetails = (movie: Movie): MovieDetails => ({
  ...movie,
  runtime: 192,
  budget: 250000000,
  revenue: 2320000000,
  status: "Released",
  tagline: "Return to Pandora.",
  homepage: "https://www.avatar.com",
  production_companies: [
    {
      id: 1,
      name: "20th Century Studios",
      logo_path: "/o86DbpburjxrqAzEDhXZcyE8pDb.png",
      origin_country: "US",
    },
  ],
  spoken_languages: [
    {
      english_name: "English",
      iso_639_1: "en",
      name: "English",
    },
  ],
  cast: mockCast,
  videos: mockVideos,
  genres: mockGenres.filter((genre) => movie.genre_ids.includes(genre.id)),
});

// Function to get genre name by ID
export const getGenreName = (genreId: number): string => {
  const genre = mockGenres.find((g) => g.id === genreId);
  return genre ? genre.name : "Unknown";
};

// Function to format release date
export const formatReleaseDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Function to format runtime
export const formatRuntime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
};

// Function to get poster URL
export const getPosterUrl = (
  posterPath: string | null,
  size: string = "w500"
): string => {
  if (!posterPath) return "/images/no-poster.jpg";
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
};

// Function to get backdrop URL
export const getBackdropUrl = (
  backdropPath: string | null,
  size: string = "w1280"
): string => {
  if (!backdropPath) return "/images/no-backdrop.jpg";
  return `https://image.tmdb.org/t/p/${size}${backdropPath}`;
};

// Function to get profile URL
export const getProfileUrl = (
  profilePath: string | null,
  size: string = "w185"
): string => {
  if (!profilePath) return "/images/no-profile.jpg";
  return `https://image.tmdb.org/t/p/${size}${profilePath}`;
};

// Function to get YouTube embed URL
export const getYouTubeEmbedUrl = (key: string): string => {
  return `https://www.youtube.com/embed/${key}`;
};

// Function to get YouTube thumbnail URL
export const getYouTubeThumbnailUrl = (key: string): string => {
  return `https://img.youtube.com/vi/${key}/maxresdefault.jpg`;
};

// Function to filter movies by search query
export const filterMoviesByQuery = (
  movies: Movie[],
  query: string
): Movie[] => {
  if (!query.trim()) return movies;

  const lowercaseQuery = query.toLowerCase();
  return movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(lowercaseQuery) ||
      movie.overview.toLowerCase().includes(lowercaseQuery) ||
      movie.original_title.toLowerCase().includes(lowercaseQuery)
  );
};

// Function to filter movies by genre
export const filterMoviesByGenre = (
  movies: Movie[],
  genreId: number
): Movie[] => {
  if (genreId === 0) return movies;
  return movies.filter((movie) => movie.genre_ids.includes(genreId));
};

// Function to sort movies
export const sortMovies = (movies: Movie[], sortBy: string): Movie[] => {
  const sortedMovies = [...movies];

  switch (sortBy) {
    case "popularity.desc":
      return sortedMovies.sort((a, b) => b.popularity - a.popularity);
    case "release_date.desc":
      return sortedMovies.sort(
        (a, b) =>
          new Date(b.release_date).getTime() -
          new Date(a.release_date).getTime()
      );
    case "vote_average.desc":
      return sortedMovies.sort((a, b) => b.vote_average - a.vote_average);
    case "title.asc":
      return sortedMovies.sort((a, b) => a.title.localeCompare(b.title));
    default:
      return sortedMovies;
  }
};

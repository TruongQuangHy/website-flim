import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
} from 'react-native';
import { MovieItem } from '../types';
import { MovieAPI } from '../services/api';
import { THEME } from '../constants/theme';
import { HeroBanner } from '../components/HeroBanner';
import { MovieSection } from '../components/MovieSection';

interface HomeScreenProps {
  onSelectMovie: (movie: MovieItem) => void;
  onSeeAll: (slug: string, title: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectMovie,
  onSeeAll,
}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [cinemaMovies, setCinemaMovies] = useState<MovieItem[]>([]);
  const [newMovies, setNewMovies] = useState<MovieItem[]>([]);
  const [seriesMovies, setSeriesMovies] = useState<MovieItem[]>([]);
  const [singleMovies, setSingleMovies] = useState<MovieItem[]>([]);
  const [animeMovies, setAnimeMovies] = useState<MovieItem[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [cinemaRes, newRes, seriesRes, singleRes, animeRes] =
        await Promise.all([
          MovieAPI.getList('phim-chieu-rap', 1),
          MovieAPI.getList('phim-moi-cap-nhat', 1),
          MovieAPI.getList('phim-bo', 1),
          MovieAPI.getList('phim-le', 1),
          MovieAPI.getList('hoat-hinh', 1),
        ]);

      setCinemaMovies(cinemaRes.items || []);
      setNewMovies(newRes.items || []);
      setSeriesMovies(seriesRes.items || []);
      setSingleMovies(singleRes.items || []);
      setAnimeMovies(animeRes.items || []);
    } catch (err) {
      console.error('Failed to load home data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Đang tải phim...</Text>
      </View>
    );
  }

  // Use combination of cinema & new movies for hero banner
  const bannerMovies = cinemaMovies.length > 0 ? cinemaMovies : newMovies;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={THEME.colors.primary}
          colors={[THEME.colors.primary]}
        />
      }
    >
      {/* Hero Banner */}
      <HeroBanner
        movies={bannerMovies}
        onPlayPress={onSelectMovie}
        onDetailPress={onSelectMovie}
      />

      {/* Phim Chiếu Rạp */}
      <MovieSection
        title="Phim Chiếu Rạp"
        movies={cinemaMovies}
        onMoviePress={onSelectMovie}
        onSeeAllPress={() => onSeeAll('phim-chieu-rap', 'Phim Chiếu Rạp')}
      />

      {/* Phim Mới Cập Nhật */}
      <MovieSection
        title="Phim Mới Cập Nhật"
        movies={newMovies}
        onMoviePress={onSelectMovie}
        onSeeAllPress={() =>
          onSeeAll('phim-moi-cap-nhat', 'Phim Mới Cập Nhật')
        }
      />

      {/* Phim Bộ */}
      <MovieSection
        title="Phim Bộ Đặc Sắc"
        movies={seriesMovies}
        onMoviePress={onSelectMovie}
        onSeeAllPress={() => onSeeAll('phim-bo', 'Phim Bộ')}
      />

      {/* Phim Lẻ */}
      <MovieSection
        title="Phim Lẻ Hay"
        movies={singleMovies}
        onMoviePress={onSelectMovie}
        onSeeAllPress={() => onSeeAll('phim-le', 'Phim Lẻ')}
      />

      {/* Hoạt Hình */}
      <MovieSection
        title="Phim Hoạt Hình & Anime"
        movies={animeMovies}
        onMoviePress={onSelectMovie}
        onSeeAllPress={() => onSeeAll('hoat-hinh', 'Phim Hoạt Hình')}
      />

      <View style={styles.footerSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: THEME.colors.textDim,
    fontSize: 13,
  },
  footerSpace: {
    height: 60,
  },
});

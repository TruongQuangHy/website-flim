import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { MovieItem } from '../types';
import { MovieAPI } from '../services/api';
import { THEME } from '../constants/theme';
import { MovieCard } from '../components/MovieCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3;

interface CategoryScreenProps {
  slug: string;
  title: string;
  onSelectMovie: (movie: MovieItem) => void;
}

export const CategoryScreen: React.FC<CategoryScreenProps> = ({
  slug,
  title,
  onSelectMovie,
}) => {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchMovies = useCallback(
    async (pageToLoad: number, isRefresh = false) => {
      try {
        const res = await MovieAPI.getList(slug, pageToLoad);
        const newItems = res.items || [];

        if (isRefresh) {
          setMovies(newItems);
        } else {
          setMovies((prev) => [...prev, ...newItems]);
        }

        if (newItems.length === 0 || pageToLoad >= (res.pagination?.totalPages || 50)) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } catch (err) {
        console.error('Error fetching category movies:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [slug]
  );

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchMovies(1, true);
  }, [fetchMovies]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchMovies(1, true);
  };

  const handleLoadMore = () => {
    if (!hasMore || loadingMore || loading) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(nextPage, false);
  };

  if (loading && movies.length === 0) {
    return (
      <View style={styles.centerBox}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Đang tải {title}...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={movies}
        keyExtractor={(item, index) => `${item._id || item.slug}-${index}`}
        numColumns={3}
        contentContainerStyle={styles.gridContent}
        initialNumToRender={9}
        maxToRenderPerBatch={9}
        windowSize={5}
        removeClippedSubviews={true}
        renderItem={({ item }) => (
          <MovieCard
            movie={item}
            onPress={onSelectMovie}
            width={CARD_WIDTH}
            height={CARD_WIDTH * 1.5}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={THEME.colors.primary}
            colors={[THEME.colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={THEME.colors.primary} />
              <Text style={styles.footerText}>Đang tải thêm...</Text>
            </View>
          ) : !hasMore && movies.length > 0 ? (
            <View style={styles.footerLoader}>
              <Text style={styles.footerText}>Đã tải hết danh sách</Text>
            </View>
          ) : (
            <View style={{ height: 40 }} />
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: THEME.spacing.lg,
  },
  gridContent: {
    paddingTop: THEME.spacing.md,
    paddingBottom: 60,
  },
  centerBox: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: THEME.colors.textDim,
    fontSize: 12,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
  },
});

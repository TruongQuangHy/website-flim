import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MovieItem } from '../types';
import { THEME } from '../constants/theme';
import { MovieCard } from './MovieCard';

const ITEM_WIDTH = 118;
const ITEM_SPACING = 12; // THEME.spacing.md
const TOTAL_ITEM_SIZE = ITEM_WIDTH + ITEM_SPACING;

interface MovieSectionProps {
  title: string;
  movies: MovieItem[];
  onMoviePress: (movie: MovieItem) => void;
  onSeeAllPress?: () => void;
}

const MovieSectionComponent: React.FC<MovieSectionProps> = ({
  title,
  movies,
  onMoviePress,
  onSeeAllPress,
}) => {
  if (!movies || movies.length === 0) return null;

  const renderItem = useCallback(
    ({ item }: { item: MovieItem }) => (
      <MovieCard
        movie={item}
        onPress={onMoviePress}
        width={ITEM_WIDTH}
        height={170}
      />
    ),
    [onMoviePress]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: TOTAL_ITEM_SIZE,
      offset: TOTAL_ITEM_SIZE * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.indicator} />
          <Text style={styles.title}>{title}</Text>
        </View>

        {onSeeAllPress && (
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={onSeeAllPress}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>Xem tất cả</Text>
            <Ionicons
              name="chevron-forward"
              size={14}
              color={THEME.colors.textDim}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Optimized FlatList instead of raw ScrollView */}
      <FlatList
        data={movies}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyExtractor={(item) => item._id || item.slug}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={3}
        removeClippedSubviews={true}
      />
    </View>
  );
};

export const MovieSection = React.memo(MovieSectionComponent);

const styles = StyleSheet.create({
  container: {
    marginVertical: THEME.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    marginBottom: THEME.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    width: 3,
    height: 16,
    borderRadius: 2,
    backgroundColor: THEME.colors.primary,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 12,
    color: THEME.colors.textDim,
    fontWeight: '600',
  },
  scrollContent: {
    paddingLeft: THEME.spacing.lg,
    paddingRight: THEME.spacing.sm,
  },
});

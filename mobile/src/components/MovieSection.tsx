import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MovieItem } from '../types';
import { THEME } from '../constants/theme';
import { MovieCard } from './MovieCard';

interface MovieSectionProps {
  title: string;
  movies: MovieItem[];
  onMoviePress: (movie: MovieItem) => void;
  onSeeAllPress?: () => void;
}

export const MovieSection: React.FC<MovieSectionProps> = ({
  title,
  movies,
  onMoviePress,
  onSeeAllPress,
}) => {
  if (!movies || movies.length === 0) return null;

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

      {/* Horizontal Cards Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {movies.map((movie) => (
          <MovieCard
            key={movie._id || movie.slug}
            movie={movie}
            onPress={onMoviePress}
            width={118}
            height={170}
          />
        ))}
      </ScrollView>
    </View>
  );
};

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

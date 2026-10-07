import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MovieItem } from '../types';
import { THEME } from '../constants/theme';
import { getMovieImageUrl } from '../services/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3; // 3 columns for mobile grid or horizontal row
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface MovieCardProps {
  movie: MovieItem;
  onPress: (movie: MovieItem) => void;
  width?: number;
  height?: number;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onPress,
  width: customWidth,
  height: customHeight,
}) => {
  const cardW = customWidth || CARD_WIDTH;
  const cardH = customHeight || CARD_HEIGHT;
  const rating =
    movie.vote_average || movie.tmdb?.vote_average || (movie as any).rate || null;

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardW }]}
      onPress={() => onPress(movie)}
      activeOpacity={0.8}
    >
      <View style={[styles.posterWrapper, { width: cardW, height: cardH }]}>
        <Image
          source={{ uri: getMovieImageUrl(movie.poster_url || movie.thumb_url) }}
          style={styles.poster}
          resizeMode="cover"
        />

        {/* Quality Badge */}
        <View style={styles.qualityBadge}>
          <Text style={styles.qualityText}>
            {movie.quality ? movie.quality.toUpperCase() : 'HD'}
          </Text>
        </View>

        {/* Rating Badge */}
        {rating ? (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={10} color={THEME.colors.star} />
            <Text style={styles.ratingText}>{Number(rating).toFixed(1)}</Text>
          </View>
        ) : null}

        {/* Episode current badge */}
        {movie.episode_current ? (
          <View style={styles.episodeBadge}>
            <Text style={styles.episodeText} numberOfLines={1}>
              {movie.episode_current}
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {movie.name}
      </Text>
      <Text style={styles.subTitle} numberOfLines={1}>
        {movie.year || movie.origin_name || ''}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  posterWrapper: {
    borderRadius: THEME.borderRadius.md,
    overflow: 'hidden',
    backgroundColor: THEME.colors.surface,
    position: 'relative',
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  qualityBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  qualityText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '800',
  },
  ratingBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  episodeBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
  },
  episodeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '600',
  },
  title: {
    color: THEME.colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
  subTitle: {
    color: THEME.colors.textDim,
    fontSize: 11,
    marginTop: 2,
  },
});

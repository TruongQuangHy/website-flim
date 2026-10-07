import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MovieItem } from '../types';
import { THEME } from '../constants/theme';
import { getMovieImageUrl } from '../services/api';

const { width } = Dimensions.get('window');
const BANNER_HEIGHT = 280;

interface HeroBannerProps {
  movies: MovieItem[];
  onPlayPress: (movie: MovieItem) => void;
  onDetailPress: (movie: MovieItem) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  movies,
  onPlayPress,
  onDetailPress,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  // Auto scroll every 5s
  useEffect(() => {
    if (!movies || movies.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % Math.min(movies.length, 6);
        scrollRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const displayMovies = movies.slice(0, 6);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / width);
    if (index !== activeIndex) {
      setActiveIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.scrollView}
      >
        {displayMovies.map((movie) => {
          const imgUrl = getMovieImageUrl(movie.poster_url || movie.thumb_url);
          const rating =
            movie.vote_average ||
            movie.tmdb?.vote_average ||
            (movie as any).rate ||
            7.5;

          return (
            <View key={movie._id || movie.slug} style={styles.slide}>
              <Image
                source={{ uri: imgUrl }}
                style={styles.bannerImage}
                resizeMode="cover"
              />

              {/* Gradient overlays */}
              <LinearGradient
                colors={['transparent', 'rgba(11, 12, 15, 0.5)', '#0B0C0F']}
                style={styles.gradientBottom}
              />
              <LinearGradient
                colors={['rgba(11, 12, 15, 0.7)', 'transparent']}
                style={styles.gradientTop}
              />

              {/* Content info */}
              <View style={styles.content}>
                <View style={styles.badgeRow}>
                  <View style={styles.hdBadge}>
                    <Text style={styles.hdText}>
                      {movie.quality ? movie.quality.toUpperCase() : 'HD'}
                    </Text>
                  </View>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={11} color={THEME.colors.star} />
                    <Text style={styles.ratingText}>
                      {Number(rating).toFixed(1)} TMDB
                    </Text>
                  </View>
                  {movie.year ? (
                    <Text style={styles.yearText}>{movie.year}</Text>
                  ) : null}
                </View>

                <Text style={styles.title} numberOfLines={1}>
                  {movie.name}
                </Text>
                {movie.origin_name ? (
                  <Text style={styles.originName} numberOfLines={1}>
                    {movie.origin_name}
                  </Text>
                ) : null}

                {/* Action Buttons */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => onPlayPress(movie)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="play" size={18} color="#FFF" />
                    <Text style={styles.playButtonText}>Xem ngay</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.detailButton}
                    onPress={() => onDetailPress(movie)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="information-circle-outline"
                      size={18}
                      color="#FFF"
                    />
                    <Text style={styles.detailButtonText}>Chi tiết</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {displayMovies.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              activeIndex === i ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: BANNER_HEIGHT,
    position: 'relative',
  },
  scrollView: {
    width,
    height: BANNER_HEIGHT,
  },
  slide: {
    width,
    height: BANNER_HEIGHT,
    position: 'relative',
  },
  bannerImage: {
    width,
    height: BANNER_HEIGHT,
  },
  gradientBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
  },
  gradientTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 60,
  },
  content: {
    position: 'absolute',
    left: THEME.spacing.lg,
    right: THEME.spacing.lg,
    bottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  hdBadge: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hdText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  ratingBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  yearText: {
    color: THEME.colors.textDim,
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 2,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  originName: {
    fontSize: 12,
    color: THEME.colors.textDim,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  playButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  detailButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  pagination: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  activeDot: {
    width: 16,
    backgroundColor: THEME.colors.primary,
  },
  inactiveDot: {
    width: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
});

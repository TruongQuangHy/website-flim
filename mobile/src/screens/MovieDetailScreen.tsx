import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MovieItem, EpisodeData, EpisodeServer } from '../types';
import { MovieAPI } from '../services/api';
import { THEME } from '../constants/theme';
import { VideoPlayer } from '../components/VideoPlayer';
import { EpisodePicker } from '../components/EpisodePicker';
import { MovieSection } from '../components/MovieSection';

interface MovieDetailScreenProps {
  movie: MovieItem;
  onSelectMovie: (movie: MovieItem) => void;
  onBack: () => void;
  onFullscreenChange?: (isFs: boolean) => void;
}

export const MovieDetailScreen: React.FC<MovieDetailScreenProps> = ({
  movie: initialMovie,
  onSelectMovie,
  onBack,
  onFullscreenChange,
}) => {
  const [loading, setLoading] = useState(true);
  const [movieDetail, setMovieDetail] = useState<MovieItem>(initialMovie);
  const [servers, setServers] = useState<EpisodeServer[]>([]);
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [currentEpisode, setCurrentEpisode] = useState<EpisodeData | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<MovieItem[]>([]);
  const [showFullContent, setShowFullContent] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadDetails = async () => {
      setLoading(true);
      try {
        const fullDetail = await MovieAPI.getDetail(initialMovie.slug);
        if (isMounted && fullDetail) {
          setMovieDetail(fullDetail);
          const srvList = fullDetail.episodes || [];
          setServers(srvList);

          // Auto-select first episode of first server
          if (srvList.length > 0 && srvList[0].server_data.length > 0) {
            setCurrentEpisode(srvList[0].server_data[0]);
          }
        }

        // Fetch related movies based on type
        const typeSlug =
          fullDetail?.type === 'series'
            ? 'phim-bo'
            : fullDetail?.type === 'single'
            ? 'phim-le'
            : 'phim-moi-cap-nhat';

        const relatedRes = await MovieAPI.getList(typeSlug, 1);
        if (isMounted) {
          setRelatedMovies(
            (relatedRes.items || [])
              .filter((m) => m.slug !== initialMovie.slug)
              .slice(0, 10)
          );
        }
      } catch (err) {
        console.error('Error loading movie details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadDetails();
    return () => {
      isMounted = false;
    };
  }, [initialMovie.slug]);

  const handleServerChange = (idx: number) => {
    setActiveServerIndex(idx);
    const srv = servers[idx];
    if (srv && srv.server_data.length > 0) {
      // Find matching episode or select first
      const match =
        srv.server_data.find((e) => e.slug === currentEpisode?.slug) ||
        srv.server_data[0];
      setCurrentEpisode(match);
    }
  };

  const handleEpisodeSelect = (ep: EpisodeData) => {
    setCurrentEpisode(ep);
  };

  const currentServer = servers[activeServerIndex];
  const episodeList = currentServer ? currentServer.server_data : [];

  const rating =
    movieDetail.vote_average ||
    movieDetail.tmdb?.vote_average ||
    (movieDetail as any).rate ||
    null;

  return (
    <View style={styles.container}>
      {/* Video Player */}
      <VideoPlayer
        currentEpisode={currentEpisode}
        servers={servers}
        activeServerIndex={activeServerIndex}
        onServerChange={handleServerChange}
        onFullscreenChange={onFullscreenChange}
      />

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={THEME.colors.primary} />
            <Text style={styles.loadingText}>Đang tải chi tiết phim...</Text>
          </View>
        ) : (
          <>
            {/* Movie Info Section */}
            <View style={styles.infoSection}>
              <Text style={styles.title}>{movieDetail.name}</Text>
              {movieDetail.origin_name ? (
                <Text style={styles.originName}>{movieDetail.origin_name}</Text>
              ) : null}

              {/* Badges Row */}
              <View style={styles.metaRow}>
                {movieDetail.quality ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {movieDetail.quality.toUpperCase()}
                    </Text>
                  </View>
                ) : null}

                {rating ? (
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={11} color={THEME.colors.star} />
                    <Text style={styles.ratingText}>
                      {Number(rating).toFixed(1)}
                    </Text>
                  </View>
                ) : null}

                {movieDetail.year ? (
                  <Text style={styles.metaText}>{movieDetail.year}</Text>
                ) : null}

                {movieDetail.time ? (
                  <Text style={styles.metaText}>{movieDetail.time}</Text>
                ) : null}

                {movieDetail.episode_current ? (
                  <View style={styles.episodeStatusBadge}>
                    <Text style={styles.episodeStatusText}>
                      {movieDetail.episode_current}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Categories & Countries */}
              {movieDetail.category && movieDetail.category.length > 0 && (
                <View style={styles.chipsRow}>
                  {movieDetail.category.map((cat) => (
                    <View key={cat.slug || cat.name} style={styles.chip}>
                      <Text style={styles.chipText}>{cat.name}</Text>
                    </View>
                  ))}
                  {movieDetail.country &&
                    movieDetail.country.map((c) => (
                      <View key={c.slug || c.name} style={styles.chipAlt}>
                        <Text style={styles.chipAltText}>{c.name}</Text>
                      </View>
                    ))}
                </View>
              )}

              {/* Synopsis / Description */}
              {movieDetail.content ? (
                <View style={styles.contentBox}>
                  <Text
                    style={styles.contentText}
                    numberOfLines={showFullContent ? undefined : 3}
                  >
                    {movieDetail.content.replace(/<[^>]+>/g, '')}
                  </Text>
                  {movieDetail.content.length > 140 && (
                    <TouchableOpacity
                      onPress={() => setShowFullContent(!showFullContent)}
                      style={styles.moreButton}
                    >
                      <Text style={styles.moreText}>
                        {showFullContent ? 'Thu gọn' : 'Xem thêm'}
                      </Text>
                      <Ionicons
                        name={showFullContent ? 'chevron-up' : 'chevron-down'}
                        size={12}
                        color={THEME.colors.primary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ) : null}

              {/* Cast & Director */}
              {movieDetail.actor && movieDetail.actor.length > 0 && (
                <View style={styles.actorRow}>
                  <Text style={styles.actorLabel}>Diễn viên: </Text>
                  <Text style={styles.actorText} numberOfLines={2}>
                    {movieDetail.actor.join(', ')}
                  </Text>
                </View>
              )}
            </View>

            {/* Episode Picker */}
            <EpisodePicker
              episodes={episodeList}
              currentEpisode={currentEpisode}
              onSelectEpisode={handleEpisodeSelect}
            />

            {/* Related Movies */}
            <MovieSection
              title="Phim đề xuất cho bạn"
              movies={relatedMovies}
              onMoviePress={onSelectMovie}
            />

            <View style={{ height: 60 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollBody: {
    flex: 1,
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: THEME.colors.textDim,
    fontSize: 12,
  },
  infoSection: {
    padding: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.divider,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  originName: {
    fontSize: 12,
    color: THEME.colors.textDim,
    fontStyle: 'italic',
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800',
  },
  ratingBadge: {
    backgroundColor: THEME.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  ratingText: {
    color: THEME.colors.star,
    fontSize: 11,
    fontWeight: '700',
  },
  metaText: {
    color: THEME.colors.textDim,
    fontSize: 12,
  },
  episodeStatusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  episodeStatusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  chip: {
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  chipText: {
    color: THEME.colors.textDim,
    fontSize: 11,
  },
  chipAlt: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  chipAltText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
  },
  contentBox: {
    marginTop: 12,
    backgroundColor: THEME.colors.surface,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  contentText: {
    fontSize: 12,
    lineHeight: 18,
    color: THEME.colors.textDim,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  moreText: {
    fontSize: 11,
    color: THEME.colors.primary,
    fontWeight: '600',
  },
  actorRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  actorLabel: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: '700',
  },
  actorText: {
    fontSize: 11,
    color: THEME.colors.textDim,
    flex: 1,
  },
});

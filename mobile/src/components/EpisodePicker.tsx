import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EpisodeData } from '../types';
import { THEME } from '../constants/theme';

interface EpisodePickerProps {
  episodes: EpisodeData[];
  currentEpisode: EpisodeData | null;
  onSelectEpisode: (ep: EpisodeData) => void;
}

const CHUNK_SIZE = 25;

export const EpisodePicker: React.FC<EpisodePickerProps> = ({
  episodes,
  currentEpisode,
  onSelectEpisode,
}) => {
  const [activeChunk, setActiveChunk] = useState(0);
  const [search, setSearch] = useState('');

  if (!episodes || episodes.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Chưa có danh sách tập phim</Text>
      </View>
    );
  }

  // Filter episodes if search text is entered
  const filtered = search.trim()
    ? episodes.filter((ep) =>
        ep.name.toLowerCase().includes(search.toLowerCase().trim())
      )
    : episodes;

  const totalChunks = Math.ceil(filtered.length / CHUNK_SIZE);
  const startIdx = activeChunk * CHUNK_SIZE;
  const currentChunkEpisodes = filtered.slice(startIdx, startIdx + CHUNK_SIZE);

  return (
    <View style={styles.container}>
      {/* Header with Title and Search Input */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Chọn tập</Text>
          <Text style={styles.countBadge}>({episodes.length} tập)</Text>
        </View>

        {episodes.length > 10 && (
          <View style={styles.searchBox}>
            <Ionicons name="search" size={14} color={THEME.colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm tập..."
              placeholderTextColor={THEME.colors.textMuted}
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                setActiveChunk(0);
              }}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Ionicons
                  name="close-circle"
                  size={14}
                  color={THEME.colors.textMuted}
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Chunk Tabs if more than 25 episodes */}
      {totalChunks > 1 && !search && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chunkScroll}
          contentContainerStyle={styles.chunkContainer}
        >
          {Array.from({ length: totalChunks }).map((_, idx) => {
            const start = idx * CHUNK_SIZE + 1;
            const end = Math.min((idx + 1) * CHUNK_SIZE, episodes.length);
            const active = idx === activeChunk;

            return (
              <TouchableOpacity
                key={idx}
                style={[styles.chunkTab, active && styles.chunkTabActive]}
                onPress={() => setActiveChunk(idx)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chunkTabText,
                    active && styles.chunkTabTextActive,
                  ]}
                >
                  {start} - {end}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Grid of Episode Buttons */}
      <View style={styles.episodesGrid}>
        {currentChunkEpisodes.map((ep) => {
          const isCurrent =
            currentEpisode?.slug === ep.slug ||
            currentEpisode?.name === ep.name;

          return (
            <TouchableOpacity
              key={ep.slug || ep.name}
              style={[
                styles.episodeButton,
                isCurrent && styles.episodeButtonActive,
              ]}
              onPress={() => onSelectEpisode(ep)}
              activeOpacity={0.7}
            >
              {isCurrent && (
                <Ionicons
                  name="play"
                  size={12}
                  color="#FFF"
                  style={{ marginRight: 3 }}
                />
              )}
              <Text
                style={[
                  styles.episodeButtonText,
                  isCurrent && styles.episodeButtonTextActive,
                ]}
                numberOfLines={1}
              >
                {ep.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.text,
  },
  countBadge: {
    fontSize: 12,
    color: THEME.colors.textDim,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    width: 120,
    gap: 4,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    color: THEME.colors.text,
    padding: 0,
  },
  chunkScroll: {
    marginBottom: THEME.spacing.sm,
  },
  chunkContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  chunkTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  chunkTabActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  chunkTabText: {
    fontSize: 11,
    color: THEME.colors.textDim,
    fontWeight: '600',
  },
  chunkTabTextActive: {
    color: '#FFF',
  },
  episodesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  episodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  episodeButtonActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  episodeButtonText: {
    fontSize: 12,
    color: THEME.colors.textDim,
    fontWeight: '700',
  },
  episodeButtonTextActive: {
    color: '#FFF',
  },
  emptyContainer: {
    padding: THEME.spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    color: THEME.colors.textMuted,
    fontSize: 13,
  },
});

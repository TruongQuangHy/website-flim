import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MovieItem } from '../types';
import { MovieAPI } from '../services/api';
import { THEME } from '../constants/theme';
import { MovieCard } from '../components/MovieCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3;

interface SearchScreenProps {
  onSelectMovie: (movie: MovieItem) => void;
}

const POPULAR_KEYWORDS = [
  'Người Nhện',
  'Hành động',
  'Chiếu rạp',
  'Anime',
  'Kinh dị',
  'Tình cảm',
  'Hài hước',
  'Hàn Quốc',
];

export const SearchScreen: React.FC<SearchScreenProps> = ({
  onSelectMovie,
}) => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setHasSearched(true);
      try {
        const res = await MovieAPI.search(keyword.trim(), 1);
        setResults(res.items || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [keyword]);

  const handleSelectKeyword = (kw: string) => {
    setKeyword(kw);
  };

  return (
    <View style={styles.container}>
      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={THEME.colors.textDim} />
        <TextInput
          style={styles.input}
          placeholder="Tìm tên phim, diễn viên..."
          placeholderTextColor={THEME.colors.textMuted}
          value={keyword}
          onChangeText={setKeyword}
          autoFocus={false}
          returnKeyType="search"
        />
        {keyword.length > 0 && (
          <TouchableOpacity
            onPress={() => setKeyword('')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={THEME.colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Popular Keyword Suggestions (if no search text yet) */}
      {!hasSearched && (
        <View style={styles.popularSection}>
          <Text style={styles.popularTitle}>Tìm kiếm phổ biến</Text>
          <View style={styles.keywordWrap}>
            {POPULAR_KEYWORDS.map((kw) => (
              <TouchableOpacity
                key={kw}
                style={styles.keywordChip}
                onPress={() => handleSelectKeyword(kw)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="trending-up-outline"
                  size={12}
                  color={THEME.colors.primary}
                />
                <Text style={styles.keywordText}>{kw}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={THEME.colors.primary} />
          <Text style={styles.loadingText}>Đang tìm kiếm phim...</Text>
        </View>
      )}

      {/* Empty State */}
      {!loading && hasSearched && results.length === 0 && (
        <View style={styles.centerBox}>
          <Ionicons name="search-outline" size={48} color={THEME.colors.textMuted} />
          <Text style={styles.emptyTitle}>Không tìm thấy phim phù hợp</Text>
          <Text style={styles.emptySub}>Thử tìm kiếm với từ khóa khác</Text>
        </View>
      )}

      {/* Search Results Grid */}
      {!loading && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id || item.slug}
          numColumns={3}
          contentContainerStyle={styles.gridContent}
          renderItem={({ item }) => (
            <MovieCard
              movie={item}
              onPress={onSelectMovie}
              width={CARD_WIDTH}
              height={CARD_WIDTH * 1.5}
            />
          )}
          ListHeaderComponent={
            <Text style={styles.resultCount}>
              Tìm thấy {results.length} kết quả
            </Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: THEME.spacing.md,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    gap: 8,
  },
  input: {
    flex: 1,
    color: THEME.colors.text,
    fontSize: 14,
    padding: 0,
  },
  popularSection: {
    marginTop: THEME.spacing.xl,
  },
  popularTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.text,
    marginBottom: THEME.spacing.md,
  },
  keywordWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    gap: 6,
  },
  keywordText: {
    color: THEME.colors.textDim,
    fontSize: 12,
    fontWeight: '600',
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: THEME.colors.textDim,
    fontSize: 12,
  },
  emptyTitle: {
    color: THEME.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  emptySub: {
    color: THEME.colors.textMuted,
    fontSize: 12,
  },
  gridContent: {
    paddingTop: THEME.spacing.md,
    paddingBottom: 60,
  },
  resultCount: {
    color: THEME.colors.textDim,
    fontSize: 12,
    marginBottom: THEME.spacing.sm,
    fontWeight: '600',
  },
});

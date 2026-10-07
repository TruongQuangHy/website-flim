import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MovieItem } from './src/types';
import { THEME } from './src/constants/theme';
import { Header } from './src/components/Header';
import { HomeScreen } from './src/screens/HomeScreen';
import { MovieDetailScreen } from './src/screens/MovieDetailScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { CategoryScreen } from './src/screens/CategoryScreen';

type TabType = 'home' | 'series' | 'movies' | 'search';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [selectedMovie, setSelectedMovie] = useState<MovieItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<{
    slug: string;
    title: string;
  } | null>(null);

  // Handle Android Hardware Back Button
  useEffect(() => {
    const backAction = () => {
      if (selectedMovie) {
        setSelectedMovie(null);
        return true;
      }
      if (activeCategory) {
        setActiveCategory(null);
        return true;
      }
      if (activeTab !== 'home') {
        setActiveTab('home');
        return true;
      }
      return false; // Let OS exit app
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [selectedMovie, activeCategory, activeTab]);

  const handleSelectMovie = (movie: MovieItem) => {
    setSelectedMovie(movie);
  };

  const handleSeeAll = (slug: string, title: string) => {
    setActiveCategory({ slug, title });
  };

  const handleBack = () => {
    if (selectedMovie) {
      setSelectedMovie(null);
      return;
    }
    if (activeCategory) {
      setActiveCategory(null);
      return;
    }
  };

  // Determine current screen content
  const renderContent = () => {
    if (selectedMovie) {
      return (
        <MovieDetailScreen
          movie={selectedMovie}
          onSelectMovie={handleSelectMovie}
          onBack={handleBack}
        />
      );
    }

    if (activeCategory) {
      return (
        <CategoryScreen
          slug={activeCategory.slug}
          title={activeCategory.title}
          onSelectMovie={handleSelectMovie}
        />
      );
    }

    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen
            onSelectMovie={handleSelectMovie}
            onSeeAll={handleSeeAll}
          />
        );
      case 'series':
        return (
          <CategoryScreen
            slug="phim-bo"
            title="Phim Bộ"
            onSelectMovie={handleSelectMovie}
          />
        );
      case 'movies':
        return (
          <CategoryScreen
            slug="phim-le"
            title="Phim Lẻ"
            onSelectMovie={handleSelectMovie}
          />
        );
      case 'search':
        return <SearchScreen onSelectMovie={handleSelectMovie} />;
      default:
        return (
          <HomeScreen
            onSelectMovie={handleSelectMovie}
            onSeeAll={handleSeeAll}
          />
        );
    }
  };

  // Determine header properties
  const getHeaderProps = () => {
    if (selectedMovie) {
      return {
        title: selectedMovie.name,
        onBack: handleBack,
        showSearch: false,
      };
    }
    if (activeCategory) {
      return {
        title: activeCategory.title,
        onBack: handleBack,
        showSearch: true,
        onSearchPress: () => setActiveTab('search'),
      };
    }
    if (activeTab === 'series') {
      return {
        title: 'Phim Bộ',
        showSearch: true,
        onSearchPress: () => setActiveTab('search'),
      };
    }
    if (activeTab === 'movies') {
      return {
        title: 'Phim Lẻ',
        showSearch: true,
        onSearchPress: () => setActiveTab('search'),
      };
    }
    if (activeTab === 'search') {
      return {
        title: 'Tìm Kiếm Phim',
        showSearch: false,
      };
    }
    return {
      showSearch: true,
      onSearchPress: () => setActiveTab('search'),
    };
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />

        {/* Global App Header */}
        <Header {...getHeaderProps()} />

        {/* Main Content Area */}
        <View style={styles.contentArea}>{renderContent()}</View>

        {/* Bottom Tab Navigation Bar (hidden when watching movie) */}
        {!selectedMovie && (
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => {
                setActiveCategory(null);
                setActiveTab('home');
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={activeTab === 'home' ? 'home' : 'home-outline'}
                size={22}
                color={
                  activeTab === 'home'
                    ? THEME.colors.primary
                    : THEME.colors.textMuted
                }
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'home' && styles.tabLabelActive,
                ]}
              >
                Trang chủ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => {
                setActiveCategory(null);
                setActiveTab('series');
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={activeTab === 'series' ? 'tv' : 'tv-outline'}
                size={22}
                color={
                  activeTab === 'series'
                    ? THEME.colors.primary
                    : THEME.colors.textMuted
                }
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'series' && styles.tabLabelActive,
                ]}
              >
                Phim bộ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => {
                setActiveCategory(null);
                setActiveTab('movies');
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={activeTab === 'movies' ? 'film' : 'film-outline'}
                size={22}
                color={
                  activeTab === 'movies'
                    ? THEME.colors.primary
                    : THEME.colors.textMuted
                }
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'movies' && styles.tabLabelActive,
                ]}
              >
                Phim lẻ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => {
                setActiveCategory(null);
                setActiveTab('search');
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={activeTab === 'search' ? 'search' : 'search-outline'}
                size={22}
                color={
                  activeTab === 'search'
                    ? THEME.colors.primary
                    : THEME.colors.textMuted
                }
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === 'search' && styles.tabLabelActive,
                ]}
              >
                Tìm kiếm
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  contentArea: {
    flex: 1,
  },
  tabBar: {
    height: 56,
    flexDirection: 'row',
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.divider,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  tabLabelActive: {
    color: THEME.colors.primary,
    fontWeight: '700',
  },
});

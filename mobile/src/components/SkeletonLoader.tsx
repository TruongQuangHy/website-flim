import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { THEME } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NORMAL_PLAYER_HEIGHT = (SCREEN_WIDTH * 9) / 16;
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 3;
const CARD_HEIGHT = CARD_WIDTH * 1.5;

interface SkeletonBoxProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 6,
  style,
}) => {
  const opacityAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.75,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.35,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => {
      pulse.stop();
    };
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.skeletonBox,
        {
          width: width as any,
          height: height as any,
          borderRadius,
          opacity: opacityAnim,
        },
        style,
      ]}
    />
  );
};

// Skeleton Movie Card (portrait ratio)
export const MovieCardSkeleton: React.FC<{ width?: number; height?: number }> = ({
  width = CARD_WIDTH,
  height = CARD_HEIGHT,
}) => {
  return (
    <View style={[styles.cardSkeletonContainer, { width }]}>
      <SkeletonBox width={width} height={height} borderRadius={10} />
      <SkeletonBox
        width={width * 0.85}
        height={13}
        borderRadius={4}
        style={{ marginTop: 8 }}
      />
      <SkeletonBox
        width={width * 0.55}
        height={11}
        borderRadius={4}
        style={{ marginTop: 5 }}
      />
    </View>
  );
};

// Skeleton Home Screen
export const HomeSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Hero Banner Skeleton */}
      <View style={styles.bannerSkeleton}>
        <SkeletonBox width="100%" height={320} borderRadius={0} />
        <View style={styles.bannerContentSkeleton}>
          <SkeletonBox width="70%" height={26} borderRadius={6} />
          <SkeletonBox
            width="45%"
            height={14}
            borderRadius={4}
            style={{ marginTop: 8 }}
          />
          <View style={styles.badgeRowSkeleton}>
            <SkeletonBox width={45} height={20} borderRadius={4} />
            <SkeletonBox width={45} height={20} borderRadius={4} />
            <SkeletonBox width={55} height={20} borderRadius={4} />
          </View>
          <View style={styles.buttonRowSkeleton}>
            <SkeletonBox width={120} height={40} borderRadius={20} />
            <SkeletonBox width={110} height={40} borderRadius={20} />
          </View>
        </View>
      </View>

      {/* Horizontal Section 1 */}
      <View style={styles.sectionSkeleton}>
        <View style={styles.sectionHeaderSkeleton}>
          <SkeletonBox width={140} height={20} borderRadius={4} />
          <SkeletonBox width={65} height={16} borderRadius={4} />
        </View>
        <View style={styles.horizontalRowSkeleton}>
          <MovieCardSkeleton width={110} height={165} />
          <MovieCardSkeleton width={110} height={165} />
          <MovieCardSkeleton width={110} height={165} />
        </View>
      </View>

      {/* Horizontal Section 2 */}
      <View style={styles.sectionSkeleton}>
        <View style={styles.sectionHeaderSkeleton}>
          <SkeletonBox width={160} height={20} borderRadius={4} />
          <SkeletonBox width={65} height={16} borderRadius={4} />
        </View>
        <View style={styles.horizontalRowSkeleton}>
          <MovieCardSkeleton width={110} height={165} />
          <MovieCardSkeleton width={110} height={165} />
          <MovieCardSkeleton width={110} height={165} />
        </View>
      </View>
    </View>
  );
};

// Skeleton Movie Detail Screen
export const MovieDetailSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Video Player Placeholder */}
      <View style={styles.playerPlaceholder}>
        <SkeletonBox
          width="100%"
          height={NORMAL_PLAYER_HEIGHT}
          borderRadius={0}
        />
      </View>

      {/* Action Row Placeholder */}
      <View style={styles.detailActionRow}>
        <SkeletonBox width={100} height={32} borderRadius={8} />
        <SkeletonBox width={70} height={32} borderRadius={8} />
        <SkeletonBox width={100} height={32} borderRadius={8} />
      </View>

      {/* Movie Info Section */}
      <View style={styles.detailInfoSection}>
        <SkeletonBox width="80%" height={24} borderRadius={6} />
        <SkeletonBox
          width="50%"
          height={14}
          borderRadius={4}
          style={{ marginTop: 8 }}
        />

        {/* Badges */}
        <View style={styles.detailBadgesRow}>
          <SkeletonBox width={42} height={22} borderRadius={4} />
          <SkeletonBox width={46} height={22} borderRadius={4} />
          <SkeletonBox width={45} height={18} borderRadius={4} />
          <SkeletonBox width={60} height={18} borderRadius={4} />
          <SkeletonBox width={50} height={20} borderRadius={4} />
        </View>

        {/* Categories Chips */}
        <View style={styles.chipsRowSkeleton}>
          <SkeletonBox width={70} height={26} borderRadius={13} />
          <SkeletonBox width={85} height={26} borderRadius={13} />
          <SkeletonBox width={75} height={26} borderRadius={13} />
        </View>

        {/* Synopsis text lines */}
        <View style={styles.synopsisSkeleton}>
          <SkeletonBox width="100%" height={13} borderRadius={3} />
          <SkeletonBox
            width="95%"
            height={13}
            borderRadius={3}
            style={{ marginTop: 6 }}
          />
          <SkeletonBox
            width="75%"
            height={13}
            borderRadius={3}
            style={{ marginTop: 6 }}
          />
        </View>

        {/* Episode Picker Header */}
        <View style={{ marginTop: 24, marginBottom: 12 }}>
          <SkeletonBox width={120} height={20} borderRadius={4} />
        </View>
        <View style={styles.episodeChipsSkeleton}>
          <SkeletonBox width={65} height={38} borderRadius={8} />
          <SkeletonBox width={65} height={38} borderRadius={8} />
          <SkeletonBox width={65} height={38} borderRadius={8} />
          <SkeletonBox width={65} height={38} borderRadius={8} />
        </View>
      </View>
    </View>
  );
};

// Skeleton Grid for CategoryScreen and SearchScreen
export const MovieGridSkeleton: React.FC<{ count?: number }> = ({
  count = 9,
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <View style={styles.gridContainer}>
      {items.map((key) => (
        <View key={key} style={styles.gridItem}>
          <MovieCardSkeleton width={CARD_WIDTH} height={CARD_HEIGHT} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  skeletonBox: {
    backgroundColor: '#262833',
  },
  cardSkeletonContainer: {
    marginRight: 10,
    marginBottom: 8,
  },
  bannerSkeleton: {
    position: 'relative',
    height: 320,
    backgroundColor: '#181922',
  },
  bannerContentSkeleton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  badgeRowSkeleton: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  buttonRowSkeleton: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  sectionSkeleton: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeaderSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  horizontalRowSkeleton: {
    flexDirection: 'row',
    gap: 12,
  },
  playerPlaceholder: {
    width: '100%',
    height: NORMAL_PLAYER_HEIGHT,
    backgroundColor: '#000',
  },
  detailActionRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.divider,
  },
  detailInfoSection: {
    padding: 16,
  },
  detailBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  chipsRowSkeleton: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  synopsisSkeleton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#171922',
  },
  episodeChipsSkeleton: {
    flexDirection: 'row',
    gap: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 12,
    justifyContent: 'space-between',
  },
  gridItem: {
    marginBottom: 16,
  },
});

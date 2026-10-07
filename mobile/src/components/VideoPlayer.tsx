import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { EpisodeServer, EpisodeData } from '../types';
import { THEME } from '../constants/theme';
import { cleanServerName } from '../services/api';

const { width } = Dimensions.get('window');
const PLAYER_HEIGHT = (width * 9) / 16; // 16:9 ratio

interface VideoPlayerProps {
  currentEpisode: EpisodeData | null;
  servers: EpisodeServer[];
  activeServerIndex: number;
  onServerChange: (index: number) => void;
  onReload?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  currentEpisode,
  servers,
  activeServerIndex,
  onServerChange,
}) => {
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(0);

  const videoUri = currentEpisode?.link_embed || currentEpisode?.link_m3u8;

  const handleReload = () => {
    setLoading(true);
    setKey((prev) => prev + 1);
  };

  return (
    <View style={styles.container}>
      {/* Player Frame */}
      <View style={styles.playerWrapper}>
        {videoUri ? (
          <WebView
            key={key}
            source={{ uri: videoUri }}
            style={styles.webview}
            allowsFullscreenVideo={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            originWhitelist={['*']}
            userAgent="Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="film-outline" size={40} color={THEME.colors.textMuted} />
            <Text style={styles.emptyText}>Chọn tập để phát video</Text>
          </View>
        )}

        {loading && videoUri && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={THEME.colors.primary} />
            <Text style={styles.loadingText}>Đang tải video...</Text>
          </View>
        )}
      </View>

      {/* Control bar */}
      <View style={styles.controlBar}>
        <View style={styles.episodeInfo}>
          <Text style={styles.nowPlayingLabel}>Đang phát:</Text>
          <Text style={styles.nowPlayingEpisode}>
            {currentEpisode ? currentEpisode.name : 'Chưa chọn tập'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.reloadButton}
          onPress={handleReload}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={16} color={THEME.colors.textDim} />
          <Text style={styles.reloadText}>Tải lại</Text>
        </TouchableOpacity>
      </View>

      {/* Server Selection */}
      {servers && servers.length > 1 && (
        <View style={styles.serverRow}>
          <Text style={styles.serverLabel}>Máy chủ:</Text>
          <View style={styles.serverButtons}>
            {servers.map((srv, idx) => {
              const active = idx === activeServerIndex;
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.serverChip, active && styles.serverChipActive]}
                  onPress={() => onServerChange(idx)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="server-outline"
                    size={12}
                    color={active ? '#FFF' : THEME.colors.textDim}
                  />
                  <Text
                    style={[
                      styles.serverChipText,
                      active && styles.serverChipTextActive,
                    ]}
                  >
                    {cleanServerName(srv.server_name)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
  },
  playerWrapper: {
    width: '100%',
    height: PLAYER_HEIGHT,
    backgroundColor: '#000',
    position: 'relative',
  },
  webview: {
    width: '100%',
    height: PLAYER_HEIGHT,
    backgroundColor: '#000',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyText: {
    color: THEME.colors.textMuted,
    fontSize: 13,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#FFF',
    fontSize: 12,
  },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: 10,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
  },
  episodeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nowPlayingLabel: {
    color: THEME.colors.textDim,
    fontSize: 12,
  },
  nowPlayingEpisode: {
    color: THEME.colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  reloadText: {
    color: THEME.colors.textDim,
    fontSize: 11,
    fontWeight: '600',
  },
  serverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: 8,
    backgroundColor: THEME.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.divider,
    gap: 8,
  },
  serverLabel: {
    color: THEME.colors.textDim,
    fontSize: 12,
    fontWeight: '600',
  },
  serverButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  serverChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
  },
  serverChipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  serverChipText: {
    color: THEME.colors.textDim,
    fontSize: 11,
    fontWeight: '600',
  },
  serverChipTextActive: {
    color: '#FFF',
  },
});

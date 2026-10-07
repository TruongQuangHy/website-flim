import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  BackHandler,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as ScreenOrientation from 'expo-screen-orientation';
import { EpisodeServer, EpisodeData } from '../types';
import { THEME } from '../constants/theme';
import { cleanServerName } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NORMAL_PLAYER_HEIGHT = (SCREEN_WIDTH * 9) / 16; // 16:9 ratio

interface VideoPlayerProps {
  currentEpisode: EpisodeData | null;
  servers: EpisodeServer[];
  activeServerIndex: number;
  onServerChange: (index: number) => void;
  onReload?: () => void;
  onFullscreenChange?: (isFs: boolean) => void;
}

// Injected JavaScript inside the video embed page:
// 1. Makes the "Bỏ qua giới thiệu" button 100% touch-responsive on mobile
// 2. Hooks fullscreen changes and notifies React Native to rotate to landscape
// 3. Removes conflicting ad popups or blocking overlays
const INJECTED_JAVASCRIPT = `
(function() {
  // 1. Force skip-intro button to receive touches and clicks cleanly
  var style = document.createElement('style');
  style.innerHTML = \`
    .skip-buttons, .bc-skip-intro, .sb-button, .skip-10-prev, .skip-10-next {
      pointer-events: auto !important;
      z-index: 2147483647 !important;
      cursor: pointer !important;
      touch-action: manipulation !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      -webkit-tap-highlight-color: transparent !important;
    }
  \`;
  document.head.appendChild(style);

  function executeSkipIntro() {
    try {
      var introSec = 85;
      if (typeof window.bcGetIntroSkipSec === 'function') {
        var s = window.bcGetIntroSkipSec();
        if (s > 0) introSec = s;
      }
      var p = (window.jwplayer && window.jwplayer('player')) || window.playerInstance;
      if (p && typeof p.seek === 'function') {
        p.seek(introSec);
        if (typeof p.play === 'function') p.play(true);
      }
    } catch (err) {}
    var wraps = document.querySelectorAll('.skip-buttons, .bc-skip-intro');
    wraps.forEach(function(el) {
      el.style.display = 'none';
      el.setAttribute('aria-hidden', 'true');
    });
    window.introSkipped = true;
  }

  // Handle both touch and click for maximum reliability on mobile
  document.addEventListener('touchend', function(e) {
    var target = e.target;
    if (target && (target.closest('.bc-skip-intro') || target.closest('.skip-buttons'))) {
      e.preventDefault();
      e.stopPropagation();
      executeSkipIntro();
    }
  }, { capture: true, passive: false });

  document.addEventListener('click', function(e) {
    var target = e.target;
    if (target && (target.closest('.bc-skip-intro') || target.closest('.skip-buttons'))) {
      e.preventDefault();
      e.stopPropagation();
      executeSkipIntro();
    }
  }, { capture: true, passive: false });

  // 2. Notify React Native when player enters or exits fullscreen
  function notifyFullscreen(isFs) {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'fullscreen',
        isFullscreen: !!isFs
      }));
    }
  }

  document.addEventListener('fullscreenchange', function() {
    notifyFullscreen(!!document.fullscreenElement);
  });
  document.addEventListener('webkitfullscreenchange', function() {
    notifyFullscreen(!!document.webkitFullscreenElement);
  });

  // Check and hook JWPlayer
  var pollCount = 0;
  var jwPoller = setInterval(function() {
    if (window.jwplayer) {
      try {
        var player = window.jwplayer('player');
        if (player && typeof player.on === 'function') {
          clearInterval(jwPoller);
          player.on('fullscreen', function(e) {
            notifyFullscreen(e.fullscreen);
          });
        }
      } catch(e) {}
    }
    if (++pollCount > 60) clearInterval(jwPoller);
  }, 500);

  true;
})();
`;

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  currentEpisode,
  servers,
  activeServerIndex,
  onServerChange,
  onFullscreenChange,
}) => {
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const videoUri = currentEpisode?.link_embed || currentEpisode?.link_m3u8;

  // Toggle fullscreen and automatically lock orientation to landscape or portrait
  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        // Rotate to Landscape
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
        setIsFullscreen(true);
        onFullscreenChange?.(true);
        // Instruct video player in webview
        webViewRef.current?.injectJavaScript(
          `(function(){ try { var p = window.jwplayer && window.jwplayer('player'); if (p) p.setFullscreen(true); } catch(e){} })(); true;`
        );
      } else {
        // Rotate back to Portrait
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
        setIsFullscreen(false);
        onFullscreenChange?.(false);
        // Instruct video player in webview
        webViewRef.current?.injectJavaScript(
          `(function(){ try { var p = window.jwplayer && window.jwplayer('player'); if (p) p.setFullscreen(false); } catch(e){} })(); true;`
        );
      }
    } catch (err) {
      console.error('Error changing screen orientation:', err);
    }
  };

  // Skip Intro via native button action
  const handleNativeSkipIntro = () => {
    webViewRef.current?.injectJavaScript(`
      (function() {
        try {
          var p = (window.jwplayer && window.jwplayer('player')) || window.playerInstance;
          if (p) {
            var cur = p.getPosition() || 0;
            p.seek(cur + 85);
            p.play(true);
          }
          var wraps = document.querySelectorAll('.skip-buttons, .bc-skip-intro');
          wraps.forEach(function(el) {
            el.style.display = 'none';
          });
        } catch(e) {}
      })();
      true;
    `);
  };

  // Handle messages from WebView (e.g. fullscreen changes inside web player)
  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data && data.type === 'fullscreen') {
        if (data.isFullscreen && !isFullscreen) {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.LANDSCAPE
          );
          setIsFullscreen(true);
          onFullscreenChange?.(true);
        } else if (!data.isFullscreen && isFullscreen) {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.PORTRAIT_UP
          );
          setIsFullscreen(false);
          onFullscreenChange?.(false);
        }
      }
    } catch (e) {
      // Non-JSON message, ignore
    }
  };

  // Hardware back button: If in fullscreen, exit fullscreen first instead of exiting movie detail
  useEffect(() => {
    const onBackPress = () => {
      if (isFullscreen) {
        toggleFullscreen();
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );
    return () => {
      sub.remove();
      // Ensure orientation is reset to portrait when leaving screen
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };
  }, [isFullscreen]);

  const handleReload = () => {
    setLoading(true);
    setKey((prev) => prev + 1);
  };

  return (
    <View style={isFullscreen ? styles.fullscreenContainer : styles.container}>
      {/* Player Frame */}
      <View
        style={
          isFullscreen ? styles.fullscreenPlayerWrapper : styles.playerWrapper
        }
      >
        {videoUri ? (
          <WebView
            ref={webViewRef}
            key={key}
            source={{ uri: videoUri }}
            style={isFullscreen ? styles.fullscreenWebview : styles.webview}
            allowsFullscreenVideo={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            injectedJavaScript={INJECTED_JAVASCRIPT}
            onMessage={handleMessage}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            originWhitelist={['*']}
            setSupportMultipleWindows={false}
            nestedScrollEnabled={false}
            userAgent="Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="film-outline" size={40} color={THEME.colors.textMuted} />
            <Text style={styles.emptyText}>Chọn tập để phát video</Text>
          </View>
        )}

        {/* Small non-blocking loading spinner in corner */}
        {loading && videoUri && (
          <View style={styles.subtleLoadingBadge} pointerEvents="none">
            <ActivityIndicator size="small" color={THEME.colors.primary} />
            <Text style={styles.subtleLoadingText}>Đang tải...</Text>
          </View>
        )}

        {/* Fullscreen Overlay Controls (when in fullscreen landscape) */}
        {isFullscreen && (
          <View style={styles.fullscreenTopBar} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.fullscreenExitBtn}
              onPress={toggleFullscreen}
              activeOpacity={0.7}
            >
              <Ionicons name="contract" size={20} color="#FFF" />
              <Text style={styles.fullscreenBtnText}>Thu nhỏ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.fullscreenSkipBtn}
              onPress={handleNativeSkipIntro}
              activeOpacity={0.7}
            >
              <Ionicons name="play-forward" size={16} color="#FFF" />
              <Text style={styles.fullscreenBtnText}>Bỏ qua intro</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Control bar (only visible when in portrait mode) */}
      {!isFullscreen && (
        <>
          <View style={styles.controlBar}>
            <View style={styles.episodeInfo}>
              <Text style={styles.nowPlayingLabel}>Đang phát:</Text>
              <Text style={styles.nowPlayingEpisode}>
                {currentEpisode ? currentEpisode.name : 'Chưa chọn tập'}
              </Text>
            </View>

            <View style={styles.controlActions}>
              {/* Native Skip Intro button */}
              <TouchableOpacity
                style={styles.skipIntroButton}
                onPress={handleNativeSkipIntro}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="play-forward-outline"
                  size={15}
                  color="#FFF"
                />
                <Text style={styles.skipIntroText}>Bỏ qua intro</Text>
              </TouchableOpacity>

              {/* Reload Button */}
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleReload}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="refresh"
                  size={15}
                  color={THEME.colors.textDim}
                />
                <Text style={styles.actionBtnText}>Tải lại</Text>
              </TouchableOpacity>

              {/* Fullscreen / Auto Rotate Button */}
              <TouchableOpacity
                style={styles.fullscreenToggleBtn}
                onPress={toggleFullscreen}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="expand"
                  size={16}
                  color="#FFF"
                />
                <Text style={styles.fullscreenToggleText}>Xoay ngang</Text>
              </TouchableOpacity>
            </View>
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
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
  },
  fullscreenContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000',
    zIndex: 999999,
  },
  playerWrapper: {
    width: '100%',
    height: NORMAL_PLAYER_HEIGHT,
    backgroundColor: '#000',
    position: 'relative',
  },
  fullscreenPlayerWrapper: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    position: 'relative',
  },
  webview: {
    width: '100%',
    height: NORMAL_PLAYER_HEIGHT,
    backgroundColor: '#000',
  },
  fullscreenWebview: {
    width: '100%',
    height: '100%',
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
  subtleLoadingBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  subtleLoadingText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  fullscreenTopBar: {
    position: 'absolute',
    top: 16,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 99999,
  },
  fullscreenExitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  fullscreenSkipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(229, 9, 20, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  fullscreenBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  controlBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: 9,
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
    flexWrap: 'wrap',
    gap: 8,
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
  controlActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  skipIntroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  skipIntroText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  actionBtnText: {
    color: THEME.colors.textDim,
    fontSize: 11,
    fontWeight: '600',
  },
  fullscreenToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  fullscreenToggleText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
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

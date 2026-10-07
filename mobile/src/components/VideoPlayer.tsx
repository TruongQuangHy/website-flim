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
// 1. Removes unwanted filename overlays / gradient top bar (#player_top) that covered half the video
// 2. Makes the "Bỏ qua giới thiệu" button 100% touch-responsive on mobile
// 3. Captures fullscreen clicks/touches on all web player controls (.item-max, .jw-icon-fullscreen, etc.)
//    and instructs React Native to rotate to landscape smoothly without bounce loops.
const INJECTED_JAVASCRIPT = `
(function() {
  // 1. Force remove #player_top, #video_mask, title overlays that covered half of video
  var style = document.createElement('style');
  style.innerHTML = \`
    #player_top,
    .bc-chrome-enter,
    #video_mask,
    .art-vtitle-bar,
    .art-mask:not(.art-mask-show),
    .video-info,
    .p_t-left,
    .p_t-right {
      display: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
      height: 0 !important;
      min-height: 0 !important;
      max-height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      pointer-events: none !important;
    }

    html, body, #rp-player, .main-player, #player {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      overflow: hidden !important;
    }

    html.rn-fullscreen,
    html.rn-fullscreen body,
    html.rn-fullscreen #rp-player,
    html.rn-fullscreen .main-player,
    html.rn-fullscreen #player,
    html.rn-fullscreen .jwplayer {
      width: 100vw !important;
      height: 100vh !important;
      max-width: 100vw !important;
      max-height: 100vh !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      right: 0 !important;
      bottom: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      z-index: 999999 !important;
    }

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

  function purgeBadOverlays() {
    var badEls = document.querySelectorAll('#player_top, .bc-chrome-enter, #video_mask, .art-vtitle-bar');
    badEls.forEach(function(el) {
      el.style.display = 'none';
      el.style.opacity = '0';
      el.style.height = '0';
      el.style.pointerEvents = 'none';
    });
  }
  setInterval(purgeBadOverlays, 800);
  purgeBadOverlays();

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

  // 2. Safely notify React Native when user clicks fullscreen button in web player
  function sendToNative(msg) {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }
  }

  function getFullscreenAction(target) {
    if (!target) return null;
    var enter = target.closest(
      '.item-max, .jw-icon-fullscreen, .art-control-fullscreen, .v_fs, [data-action="fullscreen"], [title*="Toàn màn hình"], [title*="toàn màn hình"], [aria-label*="Toàn màn hình"], .jw-svg-icon-fullscreen-on, .vjs-fullscreen-control'
    );
    if (enter) return 'enter';

    var exit = target.closest(
      '.item-min, .jw-icon-fullscreen-off, [data-action="exit-fullscreen"], [title*="Thu nhỏ"], [title*="thu nhỏ"], [aria-label*="Thu nhỏ"], .jw-svg-icon-fullscreen-off'
    );
    if (exit) return 'exit';

    return null;
  }

  function onFullscreenTouch(e) {
    var action = getFullscreenAction(e.target);
    if (action === 'enter') {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      sendToNative({ type: 'enterFullscreen' });
    } else if (action === 'exit') {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      sendToNative({ type: 'exitFullscreen' });
    }
  }

  // Intercept in capture phase before page scripts run
  window.addEventListener('touchend', onFullscreenTouch, { capture: true, passive: false });
  window.addEventListener('click', onFullscreenTouch, { capture: true, passive: false });

  document.addEventListener('fullscreenchange', function() {
    if (document.fullscreenElement) {
      sendToNative({ type: 'enterFullscreen' });
    } else {
      sendToNative({ type: 'exitFullscreen' });
    }
  });

  document.addEventListener('webkitfullscreenchange', function() {
    if (document.webkitFullscreenElement) {
      sendToNative({ type: 'enterFullscreen' });
    } else {
      sendToNative({ type: 'exitFullscreen' });
    }
  });

  window.__rnSetFullscreen = function(isFs) {
    var root = document.documentElement;
    var maxBtns = document.querySelectorAll('.item-max, .jw-icon-fullscreen');
    var minBtns = document.querySelectorAll('.item-min, .jw-icon-fullscreen-off');
    if (isFs) {
      root.classList.add('rn-fullscreen');
      maxBtns.forEach(function(b) { b.classList.add('d-none'); b.style.display = 'none'; });
      minBtns.forEach(function(b) { b.classList.remove('d-none'); b.style.display = ''; });
    } else {
      root.classList.remove('rn-fullscreen');
      maxBtns.forEach(function(b) { b.classList.remove('d-none'); b.style.display = ''; });
      minBtns.forEach(function(b) { b.classList.add('d-none'); b.style.display = 'none'; });
    }
  };

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
  const isFullscreenRef = useRef(false);
  const transitionLockRef = useRef(0);
  const webViewRef = useRef<WebView>(null);

  const videoUri = currentEpisode?.link_embed || currentEpisode?.link_m3u8;

  // Enter Fullscreen: lock to landscape orientation
  const enterFullscreen = async () => {
    const now = Date.now();
    if (isFullscreenRef.current || (now - transitionLockRef.current < 600)) {
      return;
    }
    transitionLockRef.current = now;
    isFullscreenRef.current = true;
    setIsFullscreen(true);
    onFullscreenChange?.(true);

    try {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE
      );
    } catch (err) {
      console.warn('Orientation lock landscape failed:', err);
    }

    webViewRef.current?.injectJavaScript(`
      if (typeof window.__rnSetFullscreen === 'function') {
        window.__rnSetFullscreen(true);
      }
      true;
    `);
  };

  // Exit Fullscreen: restore portrait orientation
  const exitFullscreen = async () => {
    const now = Date.now();
    if (!isFullscreenRef.current || (now - transitionLockRef.current < 600)) {
      return;
    }
    transitionLockRef.current = now;
    isFullscreenRef.current = false;
    setIsFullscreen(false);
    onFullscreenChange?.(false);

    try {
      await ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP
      );
    } catch (err) {
      console.warn('Orientation lock portrait failed:', err);
    }

    webViewRef.current?.injectJavaScript(`
      if (typeof window.__rnSetFullscreen === 'function') {
        window.__rnSetFullscreen(false);
      }
      true;
    `);
  };

  // Toggle fullscreen (used by native buttons)
  const toggleFullscreen = () => {
    if (isFullscreenRef.current) {
      exitFullscreen();
    } else {
      enterFullscreen();
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

  // Handle messages from WebView (e.g. user tapped fullscreen icon on video)
  const handleMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data) {
        if (data.type === 'enterFullscreen') {
          enterFullscreen();
        } else if (data.type === 'exitFullscreen') {
          exitFullscreen();
        } else if (data.type === 'toggleFullscreen') {
          toggleFullscreen();
        }
      }
    } catch (e) {
      // Non-JSON message, ignore
    }
  };

  // Hardware back button: If in fullscreen, exit fullscreen first instead of exiting movie detail
  useEffect(() => {
    const onBackPress = () => {
      if (isFullscreenRef.current) {
        exitFullscreen();
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
  }, []);

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
    elevation: 999,
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

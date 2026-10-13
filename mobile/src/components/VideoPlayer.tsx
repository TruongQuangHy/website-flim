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
  initialSeekTime?: number;
  onServerChange: (index: number) => void;
  onReload?: () => void;
  onFullscreenChange?: (isFs: boolean) => void;
  onTimeUpdate?: (position: number, duration: number) => void;
}

// Injected JavaScript inside the video embed page:
// 1. Removes unwanted filename overlays / gradient top bar (#player_top), and completely hides/destroys "Bỏ qua giới thiệu" / Skip Intro buttons
// 2. Captures fullscreen clicks/touches on all web player controls (.item-max, .jw-icon-fullscreen, etc.)
//    and instructs React Native to rotate to landscape smoothly without bounce loops.
// 3. Tracks timeline / control bar visibility to synchronize the native "Thu nhỏ" button in fullscreen mode.
const INJECTED_JAVASCRIPT = `
(function() {
  // 1. Force remove #player_top, #video_mask, title overlays, and all Skip Intro elements
  var style = document.createElement('style');
  style.innerHTML = \`
    #player_top,
    .bc-chrome-enter,
    #video_mask,
    .art-vtitle-bar,
    .art-mask:not(.art-mask-show),
    .video-info,
    .p_t-left,
    .p_t-right,
    .skip-buttons,
    .bc-skip-intro,
    .sb-button,
    .art-skip-intro,
    .skip-intro,
    .skip-intro-btn,
    .skip_intro,
    .skip-button,
    .skip-10-prev,
    .skip-10-next,
    [class*="skip-intro"],
    [class*="skip_intro"],
    [class*="skip-button"],
    [id*="skip-intro"],
    [id*="skip_intro"],
    [id*="skip-button"] {
      display: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
      height: 0 !important;
      width: 0 !important;
      min-height: 0 !important;
      max-height: 0 !important;
      padding: 0 !important;
      margin: 0 !important;
      pointer-events: none !important;
      overflow: hidden !important;
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
  \`;
  document.head.appendChild(style);

  function purgeBadOverlays() {
    var badEls = document.querySelectorAll(
      '#player_top, .bc-chrome-enter, #video_mask, .art-vtitle-bar, .skip-buttons, .bc-skip-intro, .sb-button, .art-skip-intro, .skip-intro, [class*="skip-intro"], [id*="skip-intro"], [class*="skip_intro"], [id*="skip_intro"], [class*="skip-button"]'
    );
    badEls.forEach(function(el) {
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('opacity', '0', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
      el.style.setProperty('pointer-events', 'none', 'important');
      if (el.parentNode && (
        el.classList.contains('skip-buttons') ||
        el.classList.contains('bc-skip-intro') ||
        el.classList.contains('sb-button') ||
        el.classList.contains('art-skip-intro')
      )) {
        try { el.parentNode.removeChild(el); } catch(e) {}
      }
    });

    // Also remove any button or element whose visible text is "Bỏ qua giới thiệu" / "Bỏ qua intro"
    var allEls = document.querySelectorAll('button, div, span, a');
    allEls.forEach(function(el) {
      if (el.children && el.children.length > 2) return;
      var txt = (el.textContent || '').trim().toLowerCase();
      if (
        txt === 'bỏ qua giới thiệu' ||
        txt === 'bỏ qua intro' ||
        txt === 'skip intro' ||
        txt.indexOf('bỏ qua giới thiệu') !== -1 ||
        txt.indexOf('bỏ qua intro') !== -1
      ) {
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
        if (el.parentNode) {
          try { el.parentNode.removeChild(el); } catch(e) {}
        }
      }
    });
  }
  setInterval(purgeBadOverlays, 400);
  purgeBadOverlays();

  // Safely notify React Native when user clicks fullscreen button in web player
  function sendToNative(msg) {
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }
  }

  // 2. Track timeline / controls visibility in fullscreen mode
  var lastControlsVisible = true;
  var lastTouchTime = Date.now();

  function checkTimelineVisibility() {
    var isVisible = false;

    // Check JWPlayer
    var jw = document.querySelector('.jwplayer');
    if (jw) {
      var isInactive = jw.classList.contains('jw-flag-user-inactive') || 
                       jw.classList.contains('jw-flag-controls-hidden');
      var cb = jw.querySelector('.jw-controlbar');
      if (cb) {
        var cStyle = window.getComputedStyle(cb);
        var op = parseFloat(cStyle.opacity || '1');
        isVisible = !isInactive && cStyle.display !== 'none' && cStyle.visibility !== 'hidden' && op > 0.05;
      } else {
        isVisible = !isInactive;
      }
    } else {
      // Check Artplayer
      var art = document.querySelector('.art-video-player');
      if (art) {
        var artBottom = art.querySelector('.art-bottom');
        if (artBottom) {
          var bs = window.getComputedStyle(artBottom);
          isVisible = bs.display !== 'none' && bs.visibility !== 'hidden' && parseFloat(bs.opacity || '1') > 0.05;
        } else {
          isVisible = art.classList.contains('art-control-show');
        }
      } else {
        // Generic player control bars
        var bars = document.querySelectorAll(
          '.jw-controlbar, .art-bottom, .art-controls, .dplayer-controller, .vjs-control-bar, [class*="controlbar"], [class*="control-bar"], [class*="bottom-control"], [class*="progress-bar"]'
        );
        if (bars.length > 0) {
          for (var i = 0; i < bars.length; i++) {
            var s = window.getComputedStyle(bars[i]);
            if (s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity || '1') > 0.05) {
              isVisible = true;
              break;
            }
          }
        } else {
          // Fallback based on touch activity timeout (3.5s auto-hide)
          isVisible = (Date.now() - lastTouchTime) < 3500;
        }
      }
    }

    if (isVisible !== lastControlsVisible) {
      lastControlsVisible = isVisible;
      sendToNative({
        type: 'controlsVisibility',
        visible: isVisible
      });
    }
  }

  function handleUserTouch() {
    lastTouchTime = Date.now();
    if (!lastControlsVisible) {
      lastControlsVisible = true;
      sendToNative({
        type: 'controlsVisibility',
        visible: true
      });
    }
  }

  window.addEventListener('touchstart', handleUserTouch, { capture: true, passive: true });
  window.addEventListener('touchend', handleUserTouch, { capture: true, passive: true });
  window.addEventListener('click', handleUserTouch, { capture: true, passive: true });
  window.addEventListener('pointerdown', handleUserTouch, { capture: true, passive: true });

  setInterval(checkTimelineVisibility, 300);

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

  // 3. Auto-seek and periodic time reporting
  var hasSeeked = false;
  function checkJWPlayer() {
    try {
      var p = (window.jwplayer && window.jwplayer('player')) || window.playerInstance;
      if (p && typeof p.getPosition === 'function') {
        var pos = p.getPosition() || 0;
        var dur = p.getDuration() || 0;

        if (!hasSeeked && window.__targetSeekTime && window.__targetSeekTime > 5 && dur > 10) {
          p.seek(window.__targetSeekTime);
          hasSeeked = true;
        }

        if (pos > 0 && dur > 0) {
          sendToNative({
            type: 'timeUpdate',
            position: Math.floor(pos),
            duration: Math.floor(dur)
          });
        }
      }
    } catch(err) {}
  }
  setInterval(checkJWPlayer, 4000);

  true;
})();
`;

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  currentEpisode,
  servers,
  activeServerIndex,
  initialSeekTime,
  onServerChange,
  onReload,
  onFullscreenChange,
  onTimeUpdate,
}) => {
  const [loading, setLoading] = useState(true);
  const [key, setKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
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
    setIsControlsVisible(true);
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
    setIsControlsVisible(true);
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
        } else if (data.type === 'controlsVisibility') {
          setIsControlsVisible(Boolean(data.visible));
        } else if (data.type === 'timeUpdate') {
          onTimeUpdate?.(data.position, data.duration);
        }
      }
    } catch (e) {
      // Non-JSON message, ignore
    }
  };

  useEffect(() => {
    if (initialSeekTime && initialSeekTime > 0) {
      webViewRef.current?.injectJavaScript(`
        window.__targetSeekTime = ${initialSeekTime};
        try {
          var p = (window.jwplayer && window.jwplayer('player')) || window.playerInstance;
          if (p && typeof p.seek === 'function') {
            p.seek(${initialSeekTime});
          }
        } catch(e) {}
        true;
      `);
    }
  }, [initialSeekTime, key]);

  const handleLoadEnd = () => {
    setLoading(false);
    if (initialSeekTime && initialSeekTime > 0) {
      webViewRef.current?.injectJavaScript(`
        window.__targetSeekTime = ${initialSeekTime};
        try {
          var p = (window.jwplayer && window.jwplayer('player')) || window.playerInstance;
          if (p && typeof p.seek === 'function') {
            p.seek(${initialSeekTime});
          }
        } catch(e) {}
        true;
      `);
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
            onLoadEnd={handleLoadEnd}
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
        {isFullscreen && isControlsVisible && (
          <View style={styles.fullscreenTopBar} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.fullscreenExitBtn}
              onPress={toggleFullscreen}
              activeOpacity={0.7}
            >
              <Ionicons name="contract" size={20} color="#FFF" />
              <Text style={styles.fullscreenBtnText}>Thu nhỏ</Text>
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
    justifyContent: 'flex-end',
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

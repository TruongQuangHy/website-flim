import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../constants/theme';
import { UserSession, WatchProgressItem } from '../types';
import { historyStorage } from '../services/historyStorage';

interface HistoryScreenProps {
  onSelectMovie: (movieSlug: string, initialEpisodeSlug?: string, initialSeekTime?: number) => void;
}

const { width } = Dimensions.get('window');

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onSelectMovie }) => {
  const [session, setSession] = useState<UserSession | null>(null);
  const [history, setHistory] = useState<Record<string, WatchProgressItem>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'watching' | 'completed'>('watching');

  // Form states
  const [username, setUsername] = useState('haiyen');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const currentSession = await historyStorage.getUserSession();
      setSession(currentSession);
      if (currentSession?.isLoggedIn) {
        const hist = await historyStorage.getWatchHistory();
        setHistory(hist);
      }
    } catch (e) {
      console.error('Failed to load history data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLogin = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    const res = await historyStorage.login(username, password);
    setSubmitting(false);

    if (res.success) {
      setPassword('');
      await loadData();
    } else {
      setErrorMsg(res.message || 'Tên đăng nhập hoặc mật khẩu không đúng!');
    }
  };

  const handleQuickFill = () => {
    setUsername('haiyen');
    setPassword('12345678');
    setErrorMsg(null);
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất tài khoản Hải Yến?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await historyStorage.logout();
          setSession(null);
        },
      },
    ]);
  };

  const handleDeleteItem = (movieSlug: string, movieName: string) => {
    Alert.alert('Xóa lịch sử', `Xóa phim "${movieName}" khỏi danh sách?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          await historyStorage.deleteHistoryItem(movieSlug);
          await loadData();
        },
      },
    ]);
  };

  const handleToggleComplete = async (movieSlug: string, currentStatus: boolean) => {
    await historyStorage.markCompleted(movieSlug, !currentStatus);
    await loadData();
  };

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  // Not logged in -> Show Login Card
  if (!session?.isLoggedIn) {
    return (
      <View style={styles.loginContainer}>
        <View style={styles.loginCard}>
          <View style={styles.avatarLarge}>
            <Ionicons name="heart" size={32} color={THEME.colors.primary} />
          </View>

          <Text style={styles.loginTitle}>Tài Khoản Hải Yến</Text>
          <Text style={styles.loginSubtitle}>
            Đăng nhập để xem lịch sử, danh sách phim đang xem và tự động tiếp tục xem đúng tập dở.
          </Text>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tài khoản</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color={THEME.colors.textMuted} />
              <TextInput
                style={styles.textInput}
                value={username}
                onChangeText={setUsername}
                placeholder="Nhập tài khoản"
                placeholderTextColor={THEME.colors.textMuted}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mật khẩu</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color={THEME.colors.textMuted} />
              <TextInput
                style={styles.textInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu"
                placeholderTextColor={THEME.colors.textMuted}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity style={styles.quickFillBtn} onPress={handleQuickFill}>
            <Ionicons name="flash-outline" size={14} color={THEME.colors.primary} />
            <Text style={styles.quickFillText}>Điền nhanh tài khoản Hải Yến</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.loginBtnText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Filter items
  const historyList = Object.values(history).sort((a, b) => b.updatedAt - a.updatedAt);
  const watchingList = historyList.filter((i) => !i.isCompleted);
  const completedList = historyList.filter((i) => i.isCompleted);
  const currentList = activeTab === 'watching' ? watchingList : completedList;

  return (
    <View style={styles.container}>
      {/* Header Profile Section */}
      <View style={styles.header}>
        <View style={styles.profileRow}>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarText}>HY</Text>
          </View>
          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>Hải Yến</Text>
              <View style={styles.vipBadge}>
                <Text style={styles.vipText}>VIP</Text>
              </View>
            </View>
            <Text style={styles.profileSub}>
              {watchingList.length} đang xem • {completedList.length} đã xong
            </Text>
          </View>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="log-out-outline" size={20} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Segmented Tab Controls */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'watching' && styles.tabButtonActive]}
            onPress={() => setActiveTab('watching')}
          >
            <Ionicons
              name="time"
              size={15}
              color={activeTab === 'watching' ? '#FFF' : THEME.colors.textMuted}
            />
            <Text
              style={[styles.tabText, activeTab === 'watching' && styles.tabTextActive]}
            >
              Đang xem ({watchingList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'completed' && styles.tabButtonActive]}
            onPress={() => setActiveTab('completed')}
          >
            <Ionicons
              name="checkmark-circle"
              size={15}
              color={activeTab === 'completed' ? '#FFF' : THEME.colors.textMuted}
            />
            <Text
              style={[styles.tabText, activeTab === 'completed' && styles.tabTextActive]}
            >
              Đã xem ({completedList.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Movies List */}
      <FlatList
        data={currentList}
        keyExtractor={(item) => item.movieSlug}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={THEME.colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name={activeTab === 'watching' ? 'film-outline' : 'checkmark-done-circle-outline'}
              size={48}
              color={THEME.colors.textMuted}
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'watching'
                ? 'Chưa có phim nào đang xem dở'
                : 'Chưa có phim nào đã xem xong'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'watching'
                ? 'Khi bạn xem phim, hệ thống sẽ tự động ghi nhớ tập và thời gian xem dở tại đây.'
                : 'Các bộ phim bạn đã xem xong sẽ được lưu trữ ở đây.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          return (
            <View style={styles.movieCard}>
              <TouchableOpacity
                style={styles.cardHeader}
                activeOpacity={0.8}
                onPress={() =>
                  onSelectMovie(
                    item.movieSlug,
                    item.lastEpisodeSlug,
                    item.lastPositionSeconds
                  )
                }
              >
                {/* Poster image with progress overlay */}
                <View style={styles.posterContainer}>
                  {item.posterUrl ? (
                    <Image
                      source={{ uri: item.posterUrl }}
                      style={styles.posterImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.posterFallback}>
                      <Ionicons name="film" size={24} color={THEME.colors.textMuted} />
                    </View>
                  )}
                  <View style={styles.playIconOverlay}>
                    <Ionicons name="play" size={16} color="#FFF" />
                  </View>
                </View>

                {/* Details */}
                <View style={styles.cardDetails}>
                  <Text style={styles.movieName} numberOfLines={1}>
                    {item.movieName}
                  </Text>
                  {item.originName ? (
                    <Text style={styles.originName} numberOfLines={1}>
                      {item.originName}
                    </Text>
                  ) : null}

                  {/* Episode and time info */}
                  <View style={styles.episodeTag}>
                    <Ionicons name="videocam-outline" size={12} color={THEME.colors.primary} />
                    <Text style={styles.episodeText}>
                      {item.lastEpisodeName}
                      {item.totalEpisodes ? ` / ${item.totalEpisodes} tập` : ''}
                    </Text>
                  </View>

                  <Text style={styles.timeText}>
                    Đã xem: {formatSeconds(item.lastPositionSeconds)} /{' '}
                    {formatSeconds(item.durationSeconds)} ({item.progressPercent}%)
                  </Text>

                  {/* Progress bar */}
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(100, Math.max(0, item.progressPercent))}%`,
                          backgroundColor: item.isCompleted ? '#10B981' : THEME.colors.primary,
                        },
                      ]}
                    />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Action Buttons Row */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() =>
                    onSelectMovie(
                      item.movieSlug,
                      item.lastEpisodeSlug,
                      item.lastPositionSeconds
                    )
                  }
                >
                  <Ionicons name="play" size={13} color="#FFF" />
                  <Text style={styles.primaryActionText}>
                    {item.isCompleted ? 'Xem lại' : 'Tiếp tục xem'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconActionBtn}
                  onPress={() => handleToggleComplete(item.movieSlug, item.isCompleted)}
                >
                  <Ionicons
                    name={item.isCompleted ? 'arrow-undo' : 'checkmark-done'}
                    size={16}
                    color={item.isCompleted ? THEME.colors.primary : '#10B981'}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconActionBtn}
                  onPress={() => handleDeleteItem(item.movieSlug, item.movieName)}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  loginContainer: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: THEME.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    padding: 24,
    alignItems: 'center',
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginBottom: 6,
  },
  loginSubtitle: {
    fontSize: 12,
    color: THEME.colors.textDim,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    width: '100%',
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#F87171',
    flex: 1,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textDim,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E1015',
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  textInput: {
    flex: 1,
    color: THEME.colors.text,
    fontSize: 14,
  },
  quickFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 20,
    marginTop: 2,
  },
  quickFillText: {
    color: THEME.colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  loginBtn: {
    width: '100%',
    height: 46,
    backgroundColor: THEME.colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  // Logged in Header
  header: {
    backgroundColor: THEME.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.surfaceBorder,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.colors.text,
  },
  vipBadge: {
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.4)',
  },
  vipText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: THEME.colors.primary,
  },
  profileSub: {
    fontSize: 11,
    color: THEME.colors.textDim,
    marginTop: 2,
  },
  logoutBtn: {
    padding: 8,
  },

  // Tab switcher
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#0D0F14',
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: THEME.colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.colors.textMuted,
  },
  tabTextActive: {
    color: '#FFF',
  },

  // Movie Card
  listContent: {
    padding: 16,
    gap: 12,
  },
  movieCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.surfaceBorder,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  posterContainer: {
    width: 80,
    height: 110,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#000',
    position: 'relative',
  },
  posterImage: {
    width: '100%',
    height: '100%',
  },
  posterFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  movieName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: THEME.colors.text,
  },
  originName: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  episodeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  episodeText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.primary,
  },
  timeText: {
    fontSize: 10,
    color: THEME.colors.textDim,
    marginTop: 2,
  },
  progressBarTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: THEME.colors.surfaceBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.3)',
    borderRadius: 8,
    paddingVertical: 6,
    gap: 4,
  },
  primaryActionText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: THEME.colors.primary,
  },
  iconActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty state
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: THEME.colors.text,
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});

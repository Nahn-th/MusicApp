import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { debounce } from 'lodash';
import { useApp } from '../context/AppContext';
import SearchBar from '../components/SearchBar';
import SettingsIcon from '../components/SettingsIcon';
import MiniPlayer from '../components/MiniPlayer';

// FREE, khong can API key
const DEEZER_API = 'https://api.deezer.com';

const OnlineMusicScreen = () => {
  const { colors, playOnlineSong } = useApp();
  const [songs, setSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHotSongs();
  }, []);

  // Load 20 bai hat hot nhat
  const loadHotSongs = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Top tracks
      const response = await fetch(`${DEEZER_API}/chart/0/tracks?limit=20`);
      const data = await response.json();
      
      if (data && data.data) {
        setSongs(data.data);
        console.log(`✅ Loaded ${data.data.length} hot songs`);
      }
    } catch (err) {
      console.error('Error loading hot songs:', err);
      setError('Failed to load songs. Check internet connection.');
    } finally {
      setLoading(false);
    }
  };

  // Search songs + debounce (2s)
  const searchSongs = async (query) => {
    if (!query.trim()) {
      loadHotSongs();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${DEEZER_API}/search?q=${encodeURIComponent(query)}&limit=20`
      );
      const data = await response.json();

      if (data && data.data) {
        setSongs(data.data);
        console.log(`Found ${data.data.length} songs for "${query}"`);
      }
    } catch (err) {
      console.error('Error searching songs:', err);
      setError('Failed to search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search - cho 2s sau khi ngung go
  const debouncedSearch = useCallback(
    debounce((query) => searchSongs(query), 2000),
    []
  );

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const handleSongPress = (song) => {
    // song.preview = URL 30s preview
    if (song.preview) {
      // Call AppContext để play online song
      if (playOnlineSong) {
        playOnlineSong(song);
      } else {
        Alert.alert('Info', '30s preview will play');
        // Hoặc dùng react-native-sound để play preview
      }
    } else {
      Alert.alert('No Preview', 'This song has no preview available');
    }
  };

  const renderSongItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.songItem, { borderBottomColor: colors.border }]}
      onPress={() => handleSongPress(item)}
      activeOpacity={0.7}
    >
      {/* Album Cover */}
      <Image
        source={{ uri: item.album?.cover_medium || item.album?.cover }}
        style={styles.cover}
      />

      {/* Song Info */}
      <View style={styles.songInfo}>
        <Text
          style={[styles.title, { color: colors.textPrimary }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text
          style={[styles.artist, { color: colors.textSecondary }]}
          numberOfLines={1}
        >
          {item.artist?.name}
        </Text>
      </View>

      {/* Duration */}
      <Text style={[styles.duration, { color: colors.textSecondary }]}>
        {formatDuration(item.duration)}
      </Text>

      {/* Play Icon */}
      <Icon name="play-circle" size={24} color={colors.primary} />
    </TouchableOpacity>
  );

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderHeader = () => (
    <View>
      <SearchBar
        placeholder="Search online songs..."
        value={searchQuery}
        onChangeText={handleSearchChange}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            {searchQuery ? 'Searching...' : 'Loading...'}
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={24} color="#dc3545" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => searchQuery ? searchSongs(searchQuery) : loadHotSongs()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <View style={styles.infoBar}>
          <Icon name="musical-notes" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            {searchQuery ? `Search results for "${searchQuery}"` : 'Top 20 Hot Songs'}
          </Text>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="cloud-offline-outline" size={80} color={colors.iconInactive} />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No songs found
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        Try a different search query
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Icon name="globe-outline" size={24} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Online Music
          </Text>
        </View>
        <SettingsIcon />
      </View>

      {/* Song List */}
      <FlatList
        data={songs}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderSongItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading && songs.length === 0 ? renderEmptyState : null}
        contentContainerStyle={styles.listContent}
      />

      <MiniPlayer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 32,
    gap: 12,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 140,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 6,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  artist: {
    fontSize: 14,
  },
  duration: {
    fontSize: 14,
    marginRight: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default OnlineMusicScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import SongItem from '../components/SongItem';
import MiniPlayer from '../components/MiniPlayer';
import SelectionModal from '../components/SelectionModal';
import {
  getSongsByArtist,
  getAllSongs,
  linkSongArtist,
  unlinkSongArtist,
  updateSong,
  getArtistsBySong,
} from '../database/db';

const ArtistDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { artist } = route.params;
  const { colors, layout, playSong, playShuffled } = useApp();

  const [songs, setSongs] = useState([]);
  const [showAddSongsModal, setShowAddSongsModal] = useState(false);
  const [availableSongs, setAvailableSongs] = useState([]);

  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = () => {
    const artistSongs = getSongsByArtist(artist.id);
    setSongs(artistSongs);
  };

  const loadAvailableSongs = () => {
    // Lấy tất cả songs
    const allSongs = getAllSongs();
    
    // Lấy songs đã có trong artist này
    const artistSongIds = songs.map(s => s.id);
    
    // Filter ra songs chưa có trong artist
    const available = allSongs
      .filter(s => !artistSongIds.includes(s.id))
      .map(s => ({
        id: s.id,
        name: s.title, // SelectionModal cần field 'name'
      }));
    
    setAvailableSongs(available);
  };

  // ============ ADD SONGS ============
  const handleAddSongs = () => {
    loadAvailableSongs();
    setShowAddSongsModal(true);
  };

  const handleSelectSongs = selectedSong => {
    // Link song với artist
    const success = linkSongArtist(selectedSong.id, artist.id);
    
    if (success) {
      // Update artist_name_string của song
      updateSongArtistString(selectedSong.id);
      
      Alert.alert('Success', `Added "${selectedSong.name}" to ${artist.name}`);
      loadSongs();
    } else {
      Alert.alert('Error', 'Failed to add song');
    }
    
    setShowAddSongsModal(false);
  };

  // ============ UPDATE ARTIST_NAME_STRING ============
  const updateSongArtistString = songId => {
    // Lấy tất cả artists của song này
    const songArtists = getArtistsBySong(songId);
    
    // Join artist names thành string
    const artistNameString = songArtists
      .map(a => a.name)
      .join(' & ');
    
    // Update song
    updateSong(songId, { artist_name_string: artistNameString });
    
    console.log(`Updated song ${songId} artist_name_string: "${artistNameString}"`);
  };

  // ============ REMOVE SONG ============
  const handleRemoveSong = song => {
    Alert.alert(
      'Remove Song',
      `Remove "${song.title}" from ${artist.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const success = unlinkSongArtist(song.id, artist.id);
            
            if (success) {
              // Update artist_name_string của song
              updateSongArtistString(song.id);
              
              Alert.alert('Success', 'Song removed from artist');
              loadSongs();
            } else {
              Alert.alert('Error', 'Failed to remove song');
            }
          },
        },
      ]
    );
  };

  // ============ PLAYBACK ============
  const handleSongPress = song => {
    playSong(song, songs);
  };

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
    }
  };

  const handleShuffle = () => {
    if (songs.length > 0) {
      playShuffled(songs);
    }
  };

  // ============ RENDER ============
  const renderHeader = () => (
    <View>
      {/* Artist Info */}
      <View style={styles.artistHeader}>
        {artist.cover_image_path ? (
          <Image
            source={{ uri: artist.cover_image_path }}
            style={styles.artistImage}
          />
        ) : (
          <View
            style={[
              styles.artistImagePlaceholder,
              { backgroundColor: colors.surface },
            ]}
          >
            <Icon name="person" size={60} color={colors.iconInactive} />
          </View>
        )}
        
        <Text style={[styles.artistName, { color: colors.textPrimary }]}>
          {artist.name}
        </Text>
        
        <Text style={[styles.songCount, { color: colors.textSecondary }]}>
          {songs.length} {songs.length === 1 ? 'song' : 'songs'}
        </Text>
      </View>

      {/* Action Buttons */}
      {songs.length > 0 && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handlePlayAll}
          >
            <Icon name="play" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Play</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={handleShuffle}
          >
            <Icon name="shuffle" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Shuffle</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Add Songs Button */}
      <TouchableOpacity
        style={[styles.addSongsButton, { backgroundColor: colors.surface }]}
        onPress={handleAddSongs}
      >
        <Icon name="add-circle-outline" size={24} color={colors.primary} />
        <Text style={[styles.addSongsText, { color: colors.primary }]}>
          Add Songs
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon
        name="musical-notes-outline"
        size={80}
        color={colors.iconInactive}
      />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No songs in this artist
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: colors.primary }]}
        onPress={handleAddSongs}
      >
        <Icon name="add" size={20} color="#FFFFFF" />
        <Text style={styles.emptyButtonText}>Add Songs</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-back" size={28} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Artist Details
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Songs List */}
      <FlatList
        data={songs}
        keyExtractor={item => String(item.id)}
        renderItem={({ item }) => (
          <SongItem
            song={item}
            layout={layout}
            onPress={() => handleSongPress(item)}
            onLongPress={() => handleRemoveSong(item)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={songs.length === 0 ? renderEmptyState : null}
        contentContainerStyle={styles.listContent}
      />

      <MiniPlayer />

      {/* Add Songs Modal */}
      <SelectionModal
        visible={showAddSongsModal}
        title="Add Songs"
        items={availableSongs}
        onSelect={handleSelectSongs}
        onCancel={() => setShowAddSongsModal(false)}
      />
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 36, // Same width as back button for centering
  },
  artistHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  artistImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 16,
  },
  artistImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artistName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  songCount: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addSongsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    gap: 8,
  },
  addSongsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 140,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ArtistDetailScreen;

/*
===============================================
FEATURES
===============================================

✅ Hiển thị artist info (ảnh, tên, số bài hát)
✅ Danh sách songs của artist
✅ Play/Shuffle songs
✅ Add songs vào artist
✅ Remove songs khỏi artist (long press)
✅ Auto update artist_name_string của song

===============================================
FLOW QUAN TRỌNG
===============================================

1. Add Song vào Artist:
   - linkSongArtist(songId, artistId)
   - Update artist_name_string của song
   - Ví dụ: Song "Stay" add vào "Justin Bieber"
     → artist_name_string = "Justin Bieber"

2. Add Song vào nhiều Artists:
   - Song "Stay" add vào "Justin Bieber"
   - Song "Stay" add vào "The Kid LAROI"
   → artist_name_string = "Justin Bieber & The Kid LAROI"

3. Remove Song khỏi Artist:
   - unlinkSongArtist(songId, artistId)
   - Update lại artist_name_string
   - Ví dụ: Remove "The Kid LAROI" khỏi "Stay"
     → artist_name_string = "Justin Bieber"

===============================================
updateSongArtistString() LOGIC
===============================================

const updateSongArtistString = songId => {
  // 1. Lấy tất cả artists của song
  const artists = getArtistsBySong(songId);
  
  // 2. Join names: ["Ed Sheeran", "Taylor Swift"] → "Ed Sheeran & Taylor Swift"
  const artistString = artists.map(a => a.name).join(' & ');
  
  // 3. Update song
  updateSong(songId, { artist_name_string: artistString });
};

===============================================
DATABASE HELPER FUNCTIONS CẦN CÓ
===============================================

Trong db.js cần thêm:

export const updateArtist = (id, updates) => {
  const { name, cover_image_path } = updates;
  const fields = [];
  const values = [];

  if (name !== undefined) {
    fields.push('name = ?');
    values.push(name);
  }
  if (cover_image_path !== undefined) {
    fields.push('cover_image_path = ?');
    values.push(cover_image_path);
  }

  if (fields.length === 0) return false;

  values.push(id);
  db.execute(`UPDATE Artists SET ${fields.join(', ')} WHERE id = ?`, values);
  return true;
};

export const deleteArtist = (id) => {
  try {
    db.execute('DELETE FROM Artists WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting artist:', error);
    return false;
  }
};
*/

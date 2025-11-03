import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  PermissionsAndroid,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import RNFS from 'react-native-fs';
import { useApp } from '../context/AppContext';
import SearchBar from '../components/SearchBar';
import SettingsIcon from '../components/SettingsIcon';
import SongItem from '../components/SongItem';
import MiniPlayer from '../components/MiniPlayer';
import SelectionModal from '../components/SelectionModal';
import EditSongModal from '../components/EditSongModal';
import {
  getAllSongs,
  searchSongs,
  insertSong,
  deleteSong,
  updateSong,
  getAllPlaylists,
  addSongToPlaylist,
  getAllGenres,
  linkSongGenre,
} from '../database/db';
import {
  createArtist,
  linkSongArtist,
  getAllArtists,
} from '../database/autoCreateArtists';

const SongsScreen = () => {
  const { colors, layout, playSong, playShuffled } = useApp();
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  // Modal states
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showGenreModal, setShowGenreModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);

  useEffect(() => {
    loadSongs();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredSongs(songs);
    } else {
      const results = searchSongs(searchQuery);
      setFilteredSongs(results);
    }
  }, [searchQuery, songs]);

  const loadSongs = () => {
    const allSongs = getAllSongs();
    setSongs(allSongs);
    setFilteredSongs(allSongs);
  };

  const requestStoragePermission = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.error('Permission error:', err);
      return false;
    }
  };

  const scanMusic = async () => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Storage permission is required to scan music files.',
      );
      return;
    }

    setIsScanning(true);

    try {
      const musicPaths = [
        `${RNFS.ExternalStorageDirectoryPath}/Download/Music`,
      ];

      let foundFiles = [];

      const scanDirectory = async (dirPath, depth = 0) => {
        if (depth > 3) return;

        try {
          const exists = await RNFS.exists(dirPath);
          if (!exists) return;

          const items = await RNFS.readDir(dirPath);

          for (const item of items) {
            if (item.isFile()) {
              const fileName = item.name.toLowerCase();
              if (
                fileName.endsWith('.mp3') ||
                fileName.endsWith('.m4a') ||
                fileName.endsWith('.wav') ||
                fileName.endsWith('.flac') ||
                fileName.endsWith('.aac')
              ) {
                foundFiles.push(item);
              }
            } else if (item.isDirectory() && depth < 3) {
              const skipDirs = ['Android', '.', 'DCIM', 'Pictures', 'Movies'];
              const shouldSkip = skipDirs.some(skip =>
                item.name.includes(skip),
              );
              if (!shouldSkip) {
                await scanDirectory(item.path, depth + 1);
              }
            }
          }
        } catch (error) {
          console.log(`Error scanning ${dirPath}:`, error);
        }
      };

      for (const path of musicPaths) {
        await scanDirectory(path);
      }

      if (foundFiles.length === 0) {
        Alert.alert(
          'No Music Found',
          'No music files found. Please ensure you have MP3, M4A, WAV, FLAC, or AAC files on your device.',
        );
        setIsScanning(false);
        return;
      }

      console.log(`Found ${foundFiles.length} music files`);

      let insertedCount = 0;
      for (const file of foundFiles) {
        try {
          const title = file.name.replace(/\.(mp3|m4a|wav|flac|aac)$/i, '');
          const song = {
            title,
            path: file.path,
            duration: 0,
            artist_name_string: 'Unknown Artist',
            genre_string: '',
          };
          const id = insertSong(song);
          if (id) insertedCount++;
        } catch (error) {
          console.log(`Error inserting ${file.name}:`, error);
        }
      }

      loadSongs();
      Alert.alert(
        'Scan Complete',
        `Found ${foundFiles.length} files.\nSuccessfully added ${insertedCount} songs.`,
      );
    } catch (error) {
      console.error('Scan error:', error);
      Alert.alert('Scan Error', `An error occurred: ${error.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSongPress = song => {
    playSong(song, filteredSongs);
  };

  const handlePlayAll = () => {
    if (filteredSongs.length > 0) {
      playSong(filteredSongs[0], filteredSongs);
    }
  };

  const handleShuffle = () => {
    if (filteredSongs.length > 0) {
      playShuffled(filteredSongs);
    }
  };

  const handleLongPress = song => {
    const options = [
      { text: 'Add to Playlist', onPress: () => handleAddToPlaylist(song) },
      { text: 'Add to Genre', onPress: () => handleAddToGenre(song) },
      { text: 'Edit Song Info', onPress: () => handleEditSongInfo(song) },
      {
        text: 'Delete',
        onPress: () => handleDeleteSong(song),
        style: 'destructive',
      },
      { text: 'Cancel', style: 'cancel' },
    ];

    if (Platform.OS === 'ios') {
      // Dùng ActionSheet đẹp hơn trên iOS
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: song.title,
          options: options.map(o => o.text),
          destructiveButtonIndex: 3,
          cancelButtonIndex: 4,
        },
        buttonIndex => {
          const selected = options[buttonIndex];
          if (selected?.onPress) selected.onPress();
        },
      );
    } else {
      // Dùng Alert trên Android nhưng chia nhỏ chức năng
      Alert.alert(
        song.title,
        'Choose an action',
        options.slice(0, 3).concat([
          {
            text: 'More...',
            onPress: () => {
              Alert.alert(song.title, 'More options', [
                {
                  text: 'Delete',
                  onPress: () => handleDeleteSong(song),
                  style: 'destructive',
                },
                { text: 'Cancel', style: 'cancel' },
              ]);
            },
          },
        ]),
      );
    }
  };
  // ============ NEW HANDLERS WITH MODALS ============

  // Mở SelectionModal cho Playlist
  const handleAddToPlaylist = song => {
    const playlists = getAllPlaylists();

    if (playlists.length === 0) {
      Alert.alert('No Playlists', 'Please create a playlist first.');
      return;
    }

    setSelectedSong(song);
    setShowPlaylistModal(true);
  };

  // Mở SelectionModal cho Genre
  const handleAddToGenre = song => {
    const genres = getAllGenres();

    if (genres.length === 0) {
      Alert.alert('No Genres', 'Please create a genre first.');
      return;
    }

    setSelectedSong(song);
    setShowGenreModal(true);
  };

  // Mở EditSongModal để edit thông tin bài hát
  const handleEditSongInfo = song => {
    setSelectedSong(song);
    setShowEditModal(true);
  };

  // Xử lý khi chọn playlist từ SelectionModal
  const handlePlaylistSelect = playlist => {
    if (!selectedSong) return;

    const success = addSongToPlaylist(selectedSong.id, playlist.id);
    if (success) {
      Alert.alert(
        'Success',
        `Added "${selectedSong.title}" to "${playlist.name}"`,
      );
    } else {
      Alert.alert('Info', 'Song may already be in this playlist.');
    }

    setShowPlaylistModal(false);
    setSelectedSong(null);
  };

  // Xử lý khi chọn genre từ SelectionModal
  const handleGenreSelect = genre => {
    if (!selectedSong) return;

    const success = linkSongGenre(selectedSong.id, genre.id);
    if (success) {
      Alert.alert(
        'Success',
        `Added "${selectedSong.title}" to genre "${genre.name}"`,
      );
    } else {
      Alert.alert('Info', 'Song may already be in this genre.');
    }

    setShowGenreModal(false);
    setSelectedSong(null);
  };

  // Xử lý khi save từ EditSongModal
  const handleSaveSongInfo = updatedSong => {
    const success = updateSong(selectedSong.id, {
      title: updatedSong.title,
      artist_name_string: updatedSong.artist,
      cover_image_path: updatedSong.cover_image_path,
    });

    if (success) {
      Alert.alert('Success', 'Song info updated!');
      loadSongs();
    } else {
      Alert.alert('Error', 'Failed to update song.');
    }

    setShowEditModal(false);
    setSelectedSong(null);
  };

  // Xử lý delete song
  const handleDeleteSong = song => {
    Alert.alert(
      'Delete Song',
      `Are you sure you want to delete "${song.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteSong(song.id);
            loadSongs();
            Alert.alert('Success', 'Song deleted!');
          },
        },
      ],
    );
  };

  // ============ RENDER FUNCTIONS ============

  const renderHeader = () => (
    <View>
      <SearchBar
        placeholder="Find in songs"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

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
        No songs found
      </Text>
      <TouchableOpacity
        style={[styles.scanButton, { backgroundColor: colors.primary }]}
        onPress={scanMusic}
        disabled={isScanning}
      >
        <Icon name="scan" size={20} color="#FFFFFF" />
        <Text style={styles.scanButtonText}>
          {isScanning ? 'Scanning...' : 'Scan Music'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Songs
        </Text>
        <SettingsIcon />
      </View>

      {songs.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredSongs}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => (
            <SongItem
              song={item}
              layout={layout}
              onPress={() => handleSongPress(item)}
              onLongPress={() => handleLongPress(item)}
            />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={[
            styles.listContent,
            layout === 'grid' && styles.gridContent,
          ]}
          numColumns={layout === 'grid' ? 2 : 1}
          key={layout}
        />
      )}

      <MiniPlayer />

      {/* ============ MODALS ============ */}

      {/* SelectionModal cho Playlists */}
      <SelectionModal
        visible={showPlaylistModal}
        title="Add to Playlist"
        items={getAllPlaylists()}
        onSelect={handlePlaylistSelect}
        onCancel={() => {
          setShowPlaylistModal(false);
          setSelectedSong(null);
        }}
      />

      {/* SelectionModal cho Genres */}
      <SelectionModal
        visible={showGenreModal}
        title="Add to Genre"
        items={getAllGenres()}
        onSelect={handleGenreSelect}
        onCancel={() => {
          setShowGenreModal(false);
          setSelectedSong(null);
        }}
      />

      {/* EditSongModal sua thong tin bai hat*/}
      <EditSongModal
        visible={showEditModal}
        song={selectedSong}
        onSave={handleSaveSongInfo}
        onCancel={() => {
          setShowEditModal(false);
          setSelectedSong(null);
        }}
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
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
  listContent: {
    paddingBottom: 140,
  },
  gridContent: {
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 24,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SongsScreen;

// export const createArtistsFromString = artistNameString => {
//     if (!artistNameString || artistNameString.trim() === '') {
//         return [];
//     }
//
//     // Split artists by common separators
//     const separators = /[&,]|feat\.?|ft\.?|featuring/i;
//     const artistNames = artistNameString
//         .split(separators)
//         .map(name => name.trim())
//         .filter(name => name && name.toLowerCase() !== 'unknown artist');
//
//     const artistIds = [];
//
//     for (const artistName of artistNames) {
//         if (artistName) {
//             const artistId = createArtist(artistName, ''); // Empty cover_image_path
//             if (artistId) {
//                 artistIds.push(artistId);
//             }
//         }
//     }
//
//     return artistIds;
// };
//
// export const linkSongWithArtists = (songId, artistNameString) => {
//     const artistIds = createArtistsFromString(artistNameString);
//
//     for (const artistId of artistIds) {
//         linkSongArtist(songId, artistId);
//     }
//
//     return artistIds;
// };
//
// export const syncAllSongsWithArtists = () => {
//     const songs = getAllSongs();
//     let createdArtistsCount = 0;
//     let linkedCount = 0;
//
//     for (const song of songs) {
//         if (song.artist_name_string && song.artist_name_string.trim() !== '') {
//             const artistIds = linkSongWithArtists(song.id, song.artist_name_string);
//             if (artistIds.length > 0) {
//                 createdArtistsCount += artistIds.length;
//                 linkedCount++;
//             }
//         }
//     }
//
//     console.log(
//         ` Synced ${linkedCount} songs with ${createdArtistsCount} artists`,
//     );
//
//     return {
//         songsLinked: linkedCount,
//         artistsCreated: createdArtistsCount,
//     };
// };
//
// export const cleanupEmptyArtists = () => { };
//
// export const getPrimaryArtistName = song => {
//     if (!song || !song.artist_name_string) {
//         return 'Unknown Artist';
//     }
//
//     const separators = /[&,]|feat\.?|ft\.?|featuring/i;
//     const artists = song.artist_name_string.split(separators);
//
//     return artists[0]?.trim() || 'Unknown Artist';
// };
//
// export const formatArtistString = artistNameString => {
//     if (!artistNameString || artistNameString.trim() === '') {
//         return 'Unknown Artist';
//     }
//
//     // Replace common separators with consistent format
//     return artistNameString
//         .replace(/feat\.?/gi, 'feat.')
//         .replace(/ft\.?/gi, 'feat.')
//         .replace(/featuring/gi, 'feat.')
//         .replace(/\s+/g, ' ')
//         .trim();
// };

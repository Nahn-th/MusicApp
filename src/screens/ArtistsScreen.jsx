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
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import SearchBar from '../components/SearchBar';
import SettingsIcon from '../components/SettingsIcon';
import MiniPlayer from '../components/MiniPlayer';
import TextInputWithImageModal from '../components/TextInputWithImageModal';
import {
  getAllArtists,
  searchArtists,
  createArtist,
  updateArtist,
  deleteArtist,
} from '../database/db';

const ArtistsScreen = () => {
  const navigation = useNavigation();
  const { colors, layout } = useApp();
  const [artists, setArtists] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);

  useEffect(() => {
    loadArtists();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredArtists(artists);
    } else {
      const results = searchArtists(searchQuery);
      setFilteredArtists(results);
    }
  }, [searchQuery, artists]);

  const loadArtists = () => {
    const allArtists = getAllArtists();
    setArtists(allArtists);
    setFilteredArtists(allArtists);
  };

  const handleArtistPress = artist => {
    navigation.navigate('ArtistDetail', { artist });
  };

  // ============ CREATE ARTIST ============
  const handleCreateArtist = (name, imageUri) => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter artist name');
      return;
    }

    const artistId = createArtist(name.trim(), imageUri);
    
    if (artistId) {
      Alert.alert('Success', `Artist "${name}" created!`);
      loadArtists();
    } else {
      Alert.alert('Error', 'Artist may already exist or failed to create');
    }
    
    setShowCreateModal(false);
  };

  // ============ EDIT ARTIST ============
  const handleEditArtist = (name, imageUri) => {
    if (!name.trim() || !selectedArtist) {
      Alert.alert('Error', 'Please enter artist name');
      return;
    }

    // Update Artists table
    const success = updateArtist(selectedArtist.id, {
      name: name.trim(),
      cover_image_path: imageUri,
    });

    if (success) {
      Alert.alert('Success', 'Artist updated!');
      loadArtists();
    } else {
      Alert.alert('Error', 'Failed to update artist');
    }
    
    setShowEditModal(false);
    setSelectedArtist(null);
  };

  // ============ DELETE ARTIST ============
  const handleDeleteArtist = artist => {
    Alert.alert(
      'Delete Artist',
      `Are you sure you want to delete "${artist.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const success = deleteArtist(artist.id);
            if (success) {
              Alert.alert('Success', 'Artist deleted!');
              loadArtists();
            } else {
              Alert.alert('Error', 'Failed to delete artist');
            }
          },
        },
      ]
    );
  };

  // ============ LONG PRESS MENU ============
  const handleLongPress = artist => {
    Alert.alert(artist.name, 'Choose an action', [
      {
        text: 'Edit',
        onPress: () => {
          setSelectedArtist(artist);
          setShowEditModal(true);
        },
      },
      {
        text: 'Delete',
        onPress: () => handleDeleteArtist(artist),
        style: 'destructive',
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // ============ RENDER FUNCTIONS ============
  const renderArtistItem = ({ item }) => {
    if (layout === 'grid') {
      return (
        <TouchableOpacity
          style={[styles.gridItem, { backgroundColor: colors.surface }]}
          onPress={() => handleArtistPress(item)}
          onLongPress={() => handleLongPress(item)}
        >
          {item.cover_image_path ? (
            <Image
              source={{ uri: item.cover_image_path }}
              style={styles.gridAvatar}
            />
          ) : (
            <View
              style={[
                styles.gridAvatarPlaceholder,
                { backgroundColor: colors.border },
              ]}
            >
              <Icon name="person" size={40} color={colors.iconInactive} />
            </View>
          )}
          <Text
            style={[styles.gridText, { color: colors.textPrimary }]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.listItem, { borderBottomColor: colors.border }]}
        onPress={() => handleArtistPress(item)}
        onLongPress={() => handleLongPress(item)}
      >
        {item.cover_image_path ? (
          <Image
            source={{ uri: item.cover_image_path }}
            style={styles.listAvatar}
          />
        ) : (
          <View
            style={[
              styles.listAvatarPlaceholder,
              { backgroundColor: colors.surface },
            ]}
          >
            <Icon name="person" size={28} color={colors.iconInactive} />
          </View>
        )}
        <Text style={[styles.listText, { color: colors.textPrimary }]}>
          {item.name}
        </Text>
        <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="people-outline" size={80} color={colors.iconInactive} />
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No artists yet
      </Text>
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: colors.primary }]}
        onPress={() => setShowCreateModal(true)}
      >
        <Icon name="add" size={20} color="#FFFFFF" />
        <Text style={styles.createButtonText}>Create Artist</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Artists
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Icon name="add-circle-outline" size={28} color={colors.primary} />
          </TouchableOpacity>
          <SettingsIcon />
        </View>
      </View>

      {/* Search */}
      <SearchBar
        placeholder="Find in artists"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* List */}
      {artists.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredArtists}
          keyExtractor={item => String(item.id)}
          renderItem={renderArtistItem}
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

      {/* Create Artist Modal */}
      <TextInputWithImageModal
        visible={showCreateModal}
        title="Create Artist"
        placeholder="Artist name"
        showImagePicker={true}
        onSubmit={handleCreateArtist}
        onCancel={() => setShowCreateModal(false)}
      />

      {/* Edit Artist Modal */}
      <TextInputWithImageModal
        visible={showEditModal}
        title="Edit Artist"
        placeholder="Artist name"
        defaultValue={selectedArtist?.name}
        defaultImage={selectedArtist?.cover_image_path}
        showImagePicker={true}
        onSubmit={handleEditArtist}
        onCancel={() => {
          setShowEditModal(false);
          setSelectedArtist(null);
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    padding: 4,
  },
  listContent: {
    paddingBottom: 140,
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  // List Layout
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  listAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  listAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },
  // Grid Layout
  gridItem: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: '1%',
    alignItems: 'center',
  },
  gridAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  gridAvatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Empty State
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
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ArtistsScreen;

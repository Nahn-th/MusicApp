import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useApp } from '../context/AppContext';

const QueueScreen = ({ visible, onClose }) => {
  const { colors, currentQueue, currentIndex, playSongFromQueue, clearQueue } = useApp();
  const [queue, setQueue] = useState([]);
  const [playingIndex, setPlayingIndex] = useState(-1);

  useEffect(() => {
    if (visible) {
      // Load queue từ AppContext
      setQueue(currentQueue || []);
      setPlayingIndex(currentIndex || 0);
    }
  }, [visible, currentQueue, currentIndex]);

  const handleSongPress = (index) => {
    // Play song từ queue
    if (playSongFromQueue) {
      playSongFromQueue(index);
    }
    // Đóng modal sau khi chọn bài
    // onClose();
  };

  const handleClearQueue = () => {
    if (clearQueue) {
      clearQueue();
      onClose();
    }
  };

  const renderSongItem = ({ item, index }) => {
    const isPlaying = index === playingIndex;

    return (
      <TouchableOpacity
        style={[
          styles.songItem,
          { borderBottomColor: colors.border },
          isPlaying && { backgroundColor: colors.surface },
        ]}
        onPress={() => handleSongPress(index)}
        activeOpacity={0.7}
      >
        {/* Position Number */}
        <View style={styles.positionContainer}>
          {isPlaying ? (
            <Icon name="musical-notes" size={20} color={colors.primary} />
          ) : (
            <Text style={[styles.position, { color: colors.textSecondary }]}>
              {index + 1}
            </Text>
          )}
        </View>

        {/* Cover Image */}
        {item.cover_image_path ? (
          <Image
            source={{ uri: item.cover_image_path }}
            style={styles.cover}
          />
        ) : (
          <View style={[styles.coverPlaceholder, { backgroundColor: colors.border }]}>
            <Icon name="musical-notes" size={20} color={colors.iconInactive} />
          </View>
        )}

        {/* Song Info */}
        <View style={styles.songInfo}>
          <Text
            style={[
              styles.title,
              { color: isPlaying ? colors.primary : colors.textPrimary },
            ]}
            numberOfLines={1}
          >
            {item.title || 'Unknown Title'}
          </Text>
          <Text
            style={[styles.artist, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {item.artist_name_string || 'Unknown Artist'}
          </Text>
        </View>

        {/* Duration */}
        <Text style={[styles.duration, { color: colors.textSecondary }]}>
          {formatDuration(item.duration)}
        </Text>
      </TouchableOpacity>
    );
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View>
        <Text style={[styles.queueTitle, { color: colors.textPrimary }]}>
          Now Playing Queue
        </Text>
        <Text style={[styles.queueCount, { color: colors.textSecondary }]}>
          {queue.length} {queue.length === 1 ? 'song' : 'songs'}
        </Text>
      </View>

      {queue.length > 0 && (
        <TouchableOpacity
          style={[styles.clearButton, { borderColor: colors.border }]}
          onPress={handleClearQueue}
        >
          <Icon name="trash-outline" size={18} color="#dc3545" />
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
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
        No songs in queue
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
        Play a song to start
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="chevron-down" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Queue
          </Text>
          <View style={styles.headerRight} />
        </View>

        {/* Queue List */}
        <FlatList
          data={queue}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderSongItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            styles.listContent,
            queue.length === 0 && styles.emptyList,
          ]}
        />
      </View>
    </Modal>
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
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 36,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  queueTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  queueCount: {
    fontSize: 14,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  clearButtonText: {
    color: '#dc3545',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyList: {
    flex: 1,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  positionContainer: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  position: {
    fontSize: 14,
    fontWeight: '600',
  },
  cover: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginLeft: 8,
  },
  coverPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginLeft: 12,
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
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default QueueScreen;

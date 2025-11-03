import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useApp } from '../context/AppContext';

const EditSongModal = ({ visible, song, onSave, onCancel }) => {
  const { colors } = useApp();
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [coverImage, setCoverImage] = useState('');

  useEffect(() => {
    if (song) {
      setTitle(song.title || '');
      setArtist(song.artist_name_string || 'Unknown Artist');
      setAlbum(song.album || '');
      setCoverImage(song.cover_image_path || '');
    }
  }, [song]);

  const handleSelectImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
        Alert.alert('Error', 'Failed to pick image');
      } else if (response.assets && response.assets.length > 0) {
        const imageUri = response.assets[0].uri;
        setCoverImage(imageUri);
        console.log('Selected image:', imageUri);
      }
    });
  };

  const handleRemoveImage = () => {
    Alert.alert(
      'Remove Cover',
      'Are you sure you want to remove the cover image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setCoverImage(''),
        },
      ],
    );
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a song title');
      return;
    }

    const updatedSong = {
      ...song,
      title: title.trim(),
      artist_name_string: artist.trim(),
      album: album.trim(),
      cover_image_path: coverImage,
    };

    onSave(updatedSong);
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const resetForm = () => {
    setTitle('');
    setArtist('');
    setAlbum('');
    setCoverImage('');
  };

  if (!song) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.titleText, { color: colors.textPrimary }]}>
              Edit Song Info
            </Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
              <Icon name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Cover Image Section */}
            <View style={styles.coverSection}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Cover Image
              </Text>

              <View style={styles.coverContainer}>
                {coverImage ? (
                  <View style={styles.coverImageWrapper}>
                    <Image
                      source={{ uri: coverImage }}
                      style={styles.coverImage}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={[
                        styles.removeImageButton,
                        { backgroundColor: colors.error || '#dc3545' },
                      ]}
                      onPress={handleRemoveImage}
                    >
                      <Icon name="trash-outline" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.coverPlaceholder,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Icon
                      name="musical-notes-outline"
                      size={48}
                      color={colors.iconInactive}
                    />
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.changeImageButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={handleSelectImage}
                >
                  <Icon name="image-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.changeImageText}>
                    {coverImage ? 'Change Image' : 'Add Image'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Title Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Title *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                    borderColor: colors.border,
                  },
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Song title"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Artist Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Artist
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                    borderColor: colors.border,
                  },
                ]}
                value={artist}
                onChangeText={setArtist}
                placeholder="Artist name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Album Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Album
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.background,
                    color: colors.textPrimary,
                    borderColor: colors.border,
                  },
                ]}
                value={album}
                onChangeText={setAlbum}
                placeholder="Album name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* File Info (Read-only) */}
            <View style={styles.infoSection}>
              <Text style={[styles.infoTitle, { color: colors.textSecondary }]}>
                File Information
              </Text>

              <View style={styles.infoGroup}>
                <Text
                  style={[styles.infoLabel, { color: colors.textSecondary }]}
                >
                  Path
                </Text>
                <Text
                  style={[styles.infoText, { color: colors.textPrimary }]}
                  numberOfLines={2}
                >
                  {song.path || 'N/A'}
                </Text>
              </View>

              {song.duration > 0 && (
                <View style={styles.infoGroup}>
                  <Text
                    style={[styles.infoLabel, { color: colors.textSecondary }]}
                  >
                    Duration
                  </Text>
                  <Text
                    style={[styles.infoText, { color: colors.textPrimary }]}
                  >
                    {Math.floor(song.duration / 60)}:
                    {String(Math.floor(song.duration % 60)).padStart(2, '0')}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                { borderColor: colors.border },
              ]}
              onPress={handleCancel}
            >
              <Text style={[styles.buttonText, { color: colors.textPrimary }]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleSave}
              disabled={!title.trim()}
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
                Save Changes
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    maxHeight: '90%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  coverSection: {
    marginBottom: 24,
  },
  coverContainer: {
    alignItems: 'center',
  },
  coverImageWrapper: {
    position: 'relative',
  },
  coverImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
  },
  coverPlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  changeImageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  infoSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoGroup: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditSongModal;

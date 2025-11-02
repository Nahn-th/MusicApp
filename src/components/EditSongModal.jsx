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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useApp } from '../context/AppContext';

const EditSongModal = ({ visible, song, onSave, onCancel }) => {
    const { colors } = useApp();
    const [title, setTitle] = useState('');
    const [artist, setArtist] = useState('');
    const [album, setAlbum] = useState('');

    useEffect(() => {
        if (song) {
            setTitle(song.title || '');
            setArtist(song.artist_name_string || 'Unknown Artist');
            setAlbum(song.album || '');
        }
    }, [song]);

    const handleSave = () => {
        if (!title.trim()) {
            return; // Có thể thêm Alert ở đây
        }

        const updatedSong = {
            ...song,
            title: title.trim(),
            artist: artist.trim() || 'Unknown Artist',
            album: album.trim(),
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
                        <Text style={[styles.title, { color: colors.textPrimary }]}>
                            Edit Song Info
                        </Text>
                        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                            <Icon name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView style={styles.content}>
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
                        <View style={styles.infoGroup}>
                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                                File Path
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
                                <Text style={[styles.infoText, { color: colors.textPrimary }]}>
                                    {Math.floor(song.duration / 60)}:
                                    {String(Math.floor(song.duration % 60)).padStart(2, '0')}
                                </Text>
                            </View>
                        )}
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
                                Save
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
        maxHeight: '80%',
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
    title: {
        fontSize: 18,
        fontWeight: '600',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        padding: 16,
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
    infoGroup: {
        marginBottom: 16,
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

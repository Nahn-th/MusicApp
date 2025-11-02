import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Image,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useApp } from '../context/AppContext';

const TextInputModal = ({
    visible,
    title,
    placeholder,
    defaultValue = '',
    defaultImage = '',
    showImagePicker = true,
    onSubmit,
    onCancel,
}) => {
    const { colors } = useApp();
    const [text, setText] = useState(defaultValue);
    const [imageUri, setImageUri] = useState(defaultImage);

    useEffect(() => {
        if (visible) {
            setText(defaultValue);
            setImageUri(defaultImage);
        }
    }, [visible, defaultValue, defaultImage]);

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
                const uri = response.assets[0].uri;
                setImageUri(uri);
            }
        });
    };

    const handleRemoveImage = () => {
        Alert.alert('Remove Image', 'Are you sure you want to remove the image?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: () => setImageUri(''),
            },
        ]);
    };

    const handleSubmit = () => {
        if (text.trim()) {
            onSubmit(text.trim(), imageUri);
            resetForm();
        } else {
            Alert.alert('Error', 'Please enter a name');
        }
    };

    const handleCancel = () => {
        resetForm();
        onCancel();
    };

    const resetForm = () => {
        setText('');
        setImageUri('');
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleCancel}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={[styles.container, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.title, { color: colors.textPrimary }]}>
                        {title}
                    </Text>

                    {/* Image Picker Section */}
                    {showImagePicker && (
                        <View style={styles.imageSection}>
                            {imageUri ? (
                                <View style={styles.imageWrapper}>
                                    <Image
                                        source={{ uri: imageUri }}
                                        style={styles.image}
                                        resizeMode="cover"
                                    />
                                    <TouchableOpacity
                                        style={[
                                            styles.removeImageButton,
                                            { backgroundColor: colors.error || '#dc3545' },
                                        ]}
                                        onPress={handleRemoveImage}
                                    >
                                        <Icon name="close" size={14} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View
                                    style={[
                                        styles.imagePlaceholder,
                                        {
                                            backgroundColor: colors.background,
                                            borderColor: colors.border,
                                        },
                                    ]}
                                >
                                    <Icon
                                        name="image-outline"
                                        size={32}
                                        color={colors.iconInactive}
                                    />
                                </View>
                            )}

                            <TouchableOpacity
                                style={[
                                    styles.selectImageButton,
                                    { backgroundColor: colors.primary },
                                ]}
                                onPress={handleSelectImage}
                            >
                                <Icon name="camera-outline" size={18} color="#FFFFFF" />
                                <Text style={styles.selectImageText}>
                                    {imageUri ? 'Change' : 'Add Photo'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Text Input */}
                    <TextInput
                        style={[
                            styles.input,
                            {
                                backgroundColor: colors.background,
                                color: colors.textPrimary,
                                borderColor: colors.border,
                            },
                        ]}
                        placeholder={placeholder}
                        placeholderTextColor={colors.textSecondary}
                        value={text}
                        onChangeText={setText}
                        autoFocus={!showImagePicker}
                        onSubmitEditing={handleSubmit}
                    />

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.border }]}
                            onPress={handleCancel}
                        >
                            <Text style={[styles.buttonText, { color: colors.textPrimary }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.primary }]}
                            onPress={handleSubmit}
                        >
                            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>OK</Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '85%',
        maxWidth: 400,
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    imageSection: {
        alignItems: 'center',
        marginBottom: 16,
    },
    imageWrapper: {
        position: 'relative',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
    },
    imagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
    selectImageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 12,
        gap: 6,
    },
    selectImageText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    button: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default TextInputModal;

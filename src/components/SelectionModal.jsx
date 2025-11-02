import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useApp } from '../context/AppContext';

const SelectionModal = ({
    visible,
    title,
    items = [], // Array of { id, name }
    onSelect,
    onCancel
}) => {
    const { colors } = useApp();

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.item, { borderBottomColor: colors.border }]}
            onPress={() => onSelect(item)}
        >
            <Text style={[styles.itemText, { color: colors.textPrimary }]}>
                {item.name}
            </Text>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Icon name="folder-outline" size={48} color={colors.iconInactive} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No items available
            </Text>
        </View>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.surface }]}>
                    {/* Header */}
                    <View style={[styles.header, { borderBottomColor: colors.border }]}>
                        <Text style={[styles.title, { color: colors.textPrimary }]}>
                            {title}
                        </Text>
                        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
                            <Icon name="close" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    {/* List */}
                    <FlatList
                        data={items}
                        keyExtractor={(item) => String(item.id)}
                        renderItem={renderItem}
                        ListEmptyComponent={renderEmptyState}
                        contentContainerStyle={items.length === 0 && styles.emptyList}
                    />

                    {/* Cancel Button */}
                    <TouchableOpacity
                        style={[styles.cancelButton, { backgroundColor: colors.border }]}
                        onPress={onCancel}
                    >
                        <Text style={[styles.cancelButtonText, { color: colors.textPrimary }]}>
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        maxHeight: '70%',
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
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    itemText: {
        fontSize: 16,
        flex: 1,
    },
    emptyList: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 12,
    },
    cancelButton: {
        margin: 16,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SelectionModal;

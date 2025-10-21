import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(false);
SQLite.enablePromise(true);

const DB_NAME = 'musicapp.db';
let db = null;

export const initDatabase = async () => {
    try {
        db = await SQLite.openDatabase({
            name: DB_NAME,
            location: 'default',
        });
        console.log('✅ Database opened successfully');
        await createTables();
        await initializeDefaultData();
        return db;
    } catch (error) {
        console.error('❌ Error opening database:', error);
        throw error;
    }
};

const createTables = async () => {
    const queries = [
        `CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT,
      genre TEXT,
      duration INTEGER,
      filePath TEXT UNIQUE,
      albumArt TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

        `CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      coverImage TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

        `CREATE TABLE IF NOT EXISTS playlist_songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      playlistId INTEGER NOT NULL,
      songId INTEGER NOT NULL,
      addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(playlistId) REFERENCES playlists(id) ON DELETE CASCADE,
      FOREIGN KEY(songId) REFERENCES songs(id) ON DELETE CASCADE,
      UNIQUE(playlistId, songId)
    )`,

        `CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      theme TEXT DEFAULT 'dark',
      layout TEXT DEFAULT 'list',
      currentSongId INTEGER,
      currentPlaylistId INTEGER,
      lastPlaybackTime INTEGER DEFAULT 0,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

        `CREATE TABLE IF NOT EXISTS genres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      icon TEXT,
      color TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    ];

    try {
        for (const query of queries) {
            await db.executeSql(query);
        }
        console.log('✅ Tables created successfully');
    } catch (error) {
        console.error('❌ Error creating tables:', error);
        throw error;
    }
};

const initializeDefaultData = async () => {
    try {
        // Initialize settings if not exists
        const settingsResult = await db.executeSql(
            'SELECT * FROM settings WHERE id = 1',
        );
        if (settingsResult[0].rows.length === 0) {
            await db.executeSql(
                'INSERT INTO settings (id, theme, layout) VALUES (1, ?, ?)',
                ['dark', 'list'],
            );
            console.log('✅ Default settings initialized');
        }
    } catch (error) {
        console.error('❌ Error initializing default data:', error);
    }
};

export const getDatabase = () => db;

export const executeSql = async (sql, params = []) => {
    try {
        if (!db) {
            throw new Error('Database not initialized');
        }
        const result = await db.executeSql(sql, params);
        return result;
    } catch (error) {
        console.error('❌ SQL Error:', error);
        throw error;
    }
};

// ==================== SONGS ====================
export const insertSong = async song => {
    const { title, artist, genre, duration, filePath, albumArt } = song;
    try {
        const result = await executeSql(
            `INSERT INTO songs (title, artist, genre, duration, filePath, albumArt) 
       VALUES (?, ?, ?, ?, ?, ?)`,
            [
                title,
                artist || 'Unknown Artist',
                genre || 'Unknown',
                duration,
                filePath,
                albumArt,
            ],
        );
        return result[0].insertId;
    } catch (error) {
        console.error('Error inserting song:', error);
        throw error;
    }
};

export const getAllSongs = async () => {
    try {
        const result = await executeSql('SELECT * FROM songs ORDER BY title ASC');
        return result[0].rows.raw();
    } catch (error) {
        console.error('Error getting songs:', error);
        return [];
    }
};

export const searchSongs = async query => {
    try {
        const result = await executeSql(
            'SELECT * FROM songs WHERE title LIKE ? OR artist LIKE ? ORDER BY title ASC',
            [`%${query}%`, `%${query}%`],
        );
        return result[0].rows.raw();
    } catch (error) {
        console.error('Error searching songs:', error);
        return [];
    }
};

export const getSongsByGenre = async genre => {
    try {
        const result = await executeSql(
            'SELECT * FROM songs WHERE genre = ? ORDER BY title ASC',
            [genre],
        );
        return result[0].rows.raw();
    } catch (error) {
        console.error('Error getting songs by genre:', error);
        return [];
    }
};

export const getSongsByArtist = async artist => {
    try {
        const result = await executeSql(
            'SELECT * FROM songs WHERE artist = ? ORDER BY title ASC',
            [artist],
        );
        return result[0].rows.raw();
    } catch (error) {
        console.error('Error getting songs by artist:', error);
        return [];
    }
};

export const deleteSong = async id => {
    try {
        await executeSql('DELETE FROM playlist_songs WHERE songId = ?', [id]);
        await executeSql('DELETE FROM songs WHERE id = ?', [id]);
    } catch (error) {
        console.error('Error deleting song:', error);
        throw error;
    }
};

// ==================== PLAYLISTS ====================
export const insertPlaylist = async (
    name,
    description = '',
    coverImage = '🎵',
) => {
    try {
        const result = await executeSql(
            `INSERT INTO playlists (name, description, coverImage) VALUES (?, ?, ?)`,
            [name, description, coverImage],
        );
        return result[0].insertId;
    } catch (error) {
        console.error('Error inserting playlist:', error);
        throw error;
    }
};

export const getAllPlaylists = async () => {
    try {
        const result = await executeSql(
            'SELECT * FROM playlists ORDER BY createdAt DESC',
        );
        return result[0].rows.raw();
    } catch (error) {
        console.error('Error getting playlists:', error);
        return [];
    }
};

export const searchPlaylists = async query => {
    try {
        const result = await executeSql(
            'SELECT * FROM playlists WHERE name LIKE ? ORDER BY name ASC',
            [`%${query}%`],
        );
        return result[0].rows.raw();
    } catch (error) {
        console.error('Error searching playlists:', error);
        return [];
    }
};

export const updatePlaylist = async (id, name, description, coverImage) => {
    try {
        await executeSql(
            `UPDATE playlists SET name = ?, description = ?, coverImage = ? WHERE id = ?`,
            [name, description, coverImage, id],
        );
    } catch (error) {
        console.error('Error updating playlist:', error);
        throw error;
    }
};

export const deletePlaylist = async id => {
    try {
        await executeSql('DELETE FROM playlist_songs WHERE playlistId = ?', [id]);
        await executeSql('DELETE FROM playlists WHERE id = ?', [id]);
    } catch (error) {
        console.error('Error deleting playlist:', error);
        throw error;
    }
};

export const addSongToPlaylist = async (playlistId, songId) => {
    try {
        await executeSql(
            `INSERT INTO playlist_songs (playlistId, songId) VALUES (?, ?)`,
            [playlistId, songId],
        );
    } catch (error) {
        if (error.message && error.message.includes('UNIQUE constraint')) {
            console.log('Song already in playlist');
        } else {
            console.error('Error adding song to playlist:', error);
            throw error;
        }
    }
};

export const getPlaylistSongs = async playlistId => {
    try {
        const result = await executeSql(
            `SELECT s.* FROM songs s 
       INNER JOIN playlist_songs ps ON s.id = ps.songId 
       WHERE ps.playlistId = ? 
       ORDER BY ps.addedAt DESC`,
            [playlistId],
        );
        return result[0].rows.raw();
    } catch (error) {
        console.error('Error getting playlist songs:', error);
        return [];
    }
};

export const removeSongFromPlaylist = async (playlistId, songId) => {
    try {
        await executeSql(
            'DELETE FROM playlist_songs WHERE playlistId = ? AND songId = ?',
            [playlistId, songId],
        );
    } catch (error) {
        console.error('Error removing song from playlist:', error);
        throw error;
    }
};

// ==================== SETTINGS ====================
export const saveSetting = async (key, value) => {
    try {
        const existing = await executeSql('SELECT * FROM settings WHERE id = 1');
        if (existing[0].rows.length === 0) {
            await executeSql('INSERT INTO settings (id) VALUES (1)');
        }
        await executeSql(
            `UPDATE settings SET ${key} = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = 1`,
            [value],
        );
    } catch (error) {
        console.error('Error saving setting:', error);
        throw error;
    }
};

export const getSetting = async key => {
    try {
        const result = await executeSql('SELECT * FROM settings WHERE id = 1');
        if (result[0].rows.length === 0) {
            return null;
        }
        return result[0].rows.raw()[0][key];
    } catch (error) {
        console.error('Error getting setting:', error);
        return null;
    }
};

export const getAllSettings = async () => {
    try {
        const result = await executeSql('SELECT * FROM settings WHERE id = 1');
        if (result[0].rows.length === 0) {
            return { theme: 'dark', layout: 'list' };
        }
        return result[0].rows.raw()[0];
    } catch (error) {
        console.error('Error getting settings:', error);
        return { theme: 'dark', layout: 'list' };
    }
};

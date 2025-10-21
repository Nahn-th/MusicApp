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

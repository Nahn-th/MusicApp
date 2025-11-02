import { createArtist, linkSongArtist, getAllArtists, getAllSongs } from './db';

/**
 * Tạo artist từ artist_name_string của bài hát
 * @param {string} artistNameString - Tên artist (có thể nhiều artists cách nhau bởi &, feat, ft)
 * @returns {Array<number>} - Array of artist IDs
 */
export const createArtistsFromString = artistNameString => {
    if (!artistNameString || artistNameString.trim() === '') {
        return [];
    }

    // Split artists by common separators
    const separators = /[&,]|feat\.?|ft\.?|featuring/i;
    const artistNames = artistNameString
        .split(separators)
        .map(name => name.trim())
        .filter(name => name && name.toLowerCase() !== 'unknown artist');

    const artistIds = [];

    for (const artistName of artistNames) {
        if (artistName) {
            const artistId = createArtist(artistName, ''); // Empty cover_image_path
            if (artistId) {
                artistIds.push(artistId);
            }
        }
    }

    return artistIds;
};

/**
 * Link bài hát với artists
 * @param {number} songId - Song ID
 * @param {string} artistNameString - Artist name string from song
 */
export const linkSongWithArtists = (songId, artistNameString) => {
    const artistIds = createArtistsFromString(artistNameString);

    for (const artistId of artistIds) {
        linkSongArtist(songId, artistId);
    }

    return artistIds;
};

export const syncAllSongsWithArtists = () => {
    const songs = getAllSongs();
    let createdArtistsCount = 0;
    let linkedCount = 0;

    for (const song of songs) {
        if (song.artist_name_string && song.artist_name_string.trim() !== '') {
            const artistIds = linkSongWithArtists(song.id, song.artist_name_string);
            if (artistIds.length > 0) {
                createdArtistsCount += artistIds.length;
                linkedCount++;
            }
        }
    }

    console.log(
        ` Synced ${linkedCount} songs with ${createdArtistsCount} artists`,
    );

    return {
        songsLinked: linkedCount,
        artistsCreated: createdArtistsCount,
    };
};

export const cleanupEmptyArtists = () => { };

/**
 * @param {Object} song - Song object
 * @returns {string} - Artist name
 */
export const getPrimaryArtistName = song => {
    if (!song || !song.artist_name_string) {
        return 'Unknown Artist';
    }

    const separators = /[&,]|feat\.?|ft\.?|featuring/i;
    const artists = song.artist_name_string.split(separators);

    return artists[0]?.trim() || 'Unknown Artist';
};

/**
 * Format artist name string cho display
 * @param {string} artistNameString
 * @returns {string}
 */
export const formatArtistString = artistNameString => {
    if (!artistNameString || artistNameString.trim() === '') {
        return 'Unknown Artist';
    }

    // Replace common separators with consistent format
    return artistNameString
        .replace(/feat\.?/gi, 'feat.')
        .replace(/ft\.?/gi, 'feat.')
        .replace(/featuring/gi, 'feat.')
        .replace(/\s+/g, ' ')
        .trim();
};

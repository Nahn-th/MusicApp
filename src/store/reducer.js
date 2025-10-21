export const initialState = {
    theme: 'dark',
    layout: 'list',
    currentSong: null,
    isPlaying: false,
    songs: [],
    playlists: [],
    genres: [],
    artists: [],
    currentPlaylist: null,
};

export const appReducer = (state, action) => {
    switch (action.type) {
        case 'SET_THEME':
            return { ...state, theme: action.payload };
        case 'SET_LAYOUT':
            return { ...state, layout: action.payload };
        case 'SET_CURRENT_SONG':
            return { ...state, currentSong: action.payload };
        case 'SET_PLAYING':
            return { ...state, isPlaying: action.payload };
        case 'SET_SONGS':
            return { ...state, songs: action.payload };
        case 'SET_PLAYLISTS':
            return { ...state, playlists: action.payload };
        case 'SET_GENRES':
            return { ...state, genres: action.payload };
        case 'SET_ARTISTS':
            return { ...state, artists: action.payload };
        case 'SET_CURRENT_PLAYLIST':
            return { ...state, currentPlaylist: action.payload };
        case 'SET_SETTINGS':
            return {
                ...state,
                theme: action.payload.theme,
                layout: action.payload.layout,
            };
        default:
            return state;
    }
};

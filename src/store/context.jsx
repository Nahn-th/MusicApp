import React, { createContext, useReducer, useEffect } from 'react';
import { initDatabase, getAllSettings } from '../database/db';
import { initialState, appReducer } from './reducer';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        console.log('🚀 Initializing app...');
        await initDatabase();
        const settings = await getAllSettings();
        dispatch({
          type: 'SET_SETTINGS',
          payload: settings,
        });
        console.log('✅ App initialized with settings:', settings);
      } catch (error) {
        console.error('❌ Bootstrap error:', error);
      }
    };
    bootstrap();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

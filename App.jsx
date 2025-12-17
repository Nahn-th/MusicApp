import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider } from './src/context/AppContext';
import StackNavigator from './src/navigation/StackNavigator';
import { initDatabase } from './src/database/db';

const App = () => {
    useEffect(() => {
        // Initialize database on app start
        const setupDatabase = () => {
            const success = initDatabase();
            if (success) {
                console.log('Database initialized successfully');
            } else {
                console.error('Database initialization failed');
            }
        };

        setupDatabase();
    }, []);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AppProvider>
                <NavigationContainer>
                    <StatusBar barStyle="light-content" backgroundColor="#000000" />
                    <StackNavigator />
                </NavigationContainer>
            </AppProvider>
        </GestureHandlerRootView>
    );
};

export default App;

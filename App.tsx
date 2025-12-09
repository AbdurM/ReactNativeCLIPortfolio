/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StyleSheet, View, Text, Alert, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';
import { PermissionsAndroid } from 'react-native';
import notifee from '@notifee/react-native';

function App() {
  const requestUserPermission = async () => {
    let enabled = false;

    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    } else {
      const permissionStatus = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      enabled = permissionStatus === 'granted';
    }
    return enabled;
  };

  const registerNotificationEvents = () => {
    messaging().onMessage(async remoteMessage => {
      console.log('Foreground message:', remoteMessage);

      await notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        android: {
          channelId: 'default',
          smallIcon: 'ic_launcher', // change if you have a custom icon
          pressAction: {
            id: 'default',
          },
        },
      });
    });
  };

  useEffect(() => {
    async function setupPushNotifications() {
      const hasUserAllowed = await requestUserPermission();
      if (!hasUserAllowed) return;

      const token = getFCMToken();
      if (!token) return;

      registerNotificationEvents();
    }

    setupPushNotifications();
  }, []);

  async function getFCMToken() {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to push notifications example</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
  },
  text: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default App;

import React from 'react';
import { WebView } from 'react-native-webview';  
import { View, Text } from 'react-native';

const WebViewScreen = ({ route }: any) => {
  const { url } = route.params;

  if (!url) {
    return <Text>No URL provided</Text>;
  }

  return (
    <WebView source={{ uri: url }} style={{ flex: 1 }} />
  );
};

export default WebViewScreen;

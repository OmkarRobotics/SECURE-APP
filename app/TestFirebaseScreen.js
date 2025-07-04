// app/TestFirebaseScreen.js
import { addDoc, collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { db } from '../firebaseConfig';

export default function TestFirebaseScreen() {
  const [status, setStatus] = useState('Sending test data...');

  useEffect(() => {
    const sendTestData = async () => {
      try {
        await addDoc(collection(db, 'testData'), {
          message: ' Hello SECURE App!',
          createdAt: new Date().toISOString(),
        });
        setStatus('Success! Data sent to Firestore.');
      } catch (error) {
        setStatus(' Failed to send data.');
        console.error(error);
      }
    };

    sendTestData();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{status}</Text>
    </View>
  );
}

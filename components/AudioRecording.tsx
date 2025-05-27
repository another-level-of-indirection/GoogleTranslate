import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { useAudioRecorder, RecordingPresets, AudioModule } from 'expo-audio';
import { useState, useEffect } from 'react';

export default function AudioRecording({
  onNewRecording,
}: {
  onNewRecording: (uri: string) => void;
}) {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        console.log('Permission to access microphone was denied');
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      console.log('Starting recording..');
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    if (!audioRecorder) {
      return;
    }
    console.log('Stopping recording..');
    
    try {
      // The recording will be available on `audioRecorder.uri`.
      await audioRecorder.stop();
      setIsRecording(false);
      console.log('Recording stopped and stored at', audioRecorder.uri);

      if (audioRecorder.uri) {
        onNewRecording(audioRecorder.uri);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    }
  };

  if (isRecording) {
    return <FontAwesome5 onPress={stopRecording} name="stop-circle" size={18} color="royalblue" />;
  }

  return <FontAwesome6 onPress={startRecording} name="microphone" size={18} color="dimgray" />;
}

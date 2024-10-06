'use client';
import { useState } from 'react';
import { Button, Text } from '@mantine/core';
import AudioCutterEditor from '@/components/AudioCutterEditor';
import classes from './page.module.css';

export default function AudioCutterLanding() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isAudioFile = file.type.startsWith('audio/');
      if (isAudioFile) {
        setAudioFile(file);
        setErrorMessage(null); // Clear any previous error message
      } else {
        setErrorMessage('Please upload a valid audio file(mp3). Only audio formats are supported.');
        setAudioFile(null); // Reset the file
      }
    }
  };

  return (
    <div className='uploader'>
      {!audioFile ? (
        <>
          <h1>Audio Cutter</h1>
          <p>Free editor to trim and cut any audio file online</p>
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Button className={classes['button']}>
              <label htmlFor="file-upload" style={{ cursor: 'pointer' }}>
                Browse my files
              </label>
            </Button>
            <input
              type="file"
              id="file-upload"
              accept="audio/*" 
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {errorMessage && (
            <Text color="red" style={{ marginTop: '10px' }}>
              {errorMessage}
            </Text>
          )}
        </>
      ) : (
        <AudioCutterEditor file={audioFile} /> 
      )}
    </div>
  );
}

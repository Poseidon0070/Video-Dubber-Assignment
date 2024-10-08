import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Button, Flex } from '@mantine/core';
import classes from './AudioCutterEditor.module.css';
// @ts-ignore
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';
// @ts-ignore
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';
import { FaPlay, FaPause } from "react-icons/fa6";
import { RiScissors2Fill } from "react-icons/ri";
import { FaDownload } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { NativeSelect } from '@mantine/core';
import '@/app/global.css'

export default function AudioCutterEditor({ file }: { file: File }) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const selectedRegion = useRef<any>(null);
  const regions = useRef<any>(RegionsPlugin.create()).current;
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileFormat, setFileFormat] = useState('mp3')

  // Function to initialize or reload the waveform
  const loadWaveform = (audioUrl: string) => {
    // Destroy existing WaveSurfer instance if it exists
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    // Initialize a new WaveSurfer instance
    wavesurferRef.current = WaveSurfer.create({
      container: waveformRef.current!,
      height: 100,
      waveColor: '#21dfa6',
      progressColor: 'rgb(100, 0, 100)',
      plugins: [
        Timeline.create({
          container: '#wave-timeline',
        }),
        regions,
      ],
    });

    // Load the audio URL into WaveSurfer
    wavesurferRef.current.load(audioUrl);

    wavesurferRef.current.on('ready', () => {
      regions.addRegion({
        start: 0,
        end: wavesurferRef.current!.getDuration(),
        content: '',
        color: 'rgba(100, 100, 100, 0.3)',
        drag: true,
        resize: true,
      });
    });

    wavesurferRef.current.on('play', () => setIsPlaying(true));
    wavesurferRef.current.on('pause', () => setIsPlaying(false));

    // Update the selectedRegion ref when a region is updated
    regions.on('region-updated', (region: any) => {
      selectedRegion.current = region;
    });
  };

  // Load the initial waveform when the component mounts or file changes
  useEffect(() => {
    if (file) {
      const objectURL = URL.createObjectURL(file);
      loadWaveform(objectURL);
      setAudioUrl(objectURL);
    }

    // Cleanup on unmount
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
      }
    };
  }, [file]);

  // Function to handle cropping the audio to the selected region
  async function handleCrop() {
    if (selectedRegion.current && audioUrl) {
      const { start, end } = selectedRegion.current;

      // Create an AudioContext
      // @ts-ignore
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Fetch the current audio URL as ArrayBuffer
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();

      // Decode the audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Calculate start and end sample indices
      const startSample = Math.floor(start * audioBuffer.sampleRate);
      const endSample = Math.floor(end * audioBuffer.sampleRate);

      // Create a new AudioBuffer for the trimmed audio
      const trimmedBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        endSample - startSample,
        audioBuffer.sampleRate
      );

      // Copy the trimmed portion of the audio to the new buffer
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel).slice(startSample, endSample);
        trimmedBuffer.copyToChannel(channelData, channel);
      }

      // Convert the trimmed AudioBuffer to a Blob (WAV format)
      const trimmedAudioBlob = await audioBufferToWav(trimmedBuffer);
      const newTrimmedAudioUrl = URL.createObjectURL(trimmedAudioBlob);

      // Update the state with the new trimmed audio URL
      setAudioUrl(newTrimmedAudioUrl);

      // Reload the waveform with the trimmed audio
      loadWaveform(newTrimmedAudioUrl);

      console.log('Audio cropped successfully');
    }
  }

  // Function to handle deleting the selected region from the audio
  async function handleRemove() {
    if (selectedRegion.current && audioUrl) {
      const { start, end } = selectedRegion.current;

      // @ts-ignore
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Fetch the current audio URL as ArrayBuffer
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();

      // Decode the audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Calculate start and end sample indices
      const startSample = Math.floor(start * audioBuffer.sampleRate);
      const endSample = Math.floor(end * audioBuffer.sampleRate);

      // Calculate the new buffer length (original length - region length)
      const newLength = audioBuffer.length - (endSample - startSample);
      const newBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        newLength,
        audioBuffer.sampleRate
      );

      // Copy data before the region
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const channelData = audioBuffer.getChannelData(channel);
        const newChannelData = newBuffer.getChannelData(channel);
        newChannelData.set(channelData.slice(0, startSample));
        newChannelData.set(channelData.slice(endSample), startSample);
      }

      // Convert the new AudioBuffer to a Blob (WAV format)
      const newAudioBlob = await audioBufferToWav(newBuffer);
      const newAudioUrl = URL.createObjectURL(newAudioBlob);

      // Update the state with the new audio URL
      setAudioUrl(newAudioUrl);

      // Reload the waveform with the updated audio
      loadWaveform(newAudioUrl);

      console.log('Audio region removed successfully');
    }
  }

  // Utility function to convert AudioBuffer to WAV Blob
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const bitDepth = 16;

    // Interleave channel data
    const interleaved: number[] = [];
    for (let i = 0; i < buffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        interleaved.push(buffer.getChannelData(channel)[i]);
      }
    }

    // Create ArrayBuffer for WAV file
    const wavBuffer = new ArrayBuffer(44 + interleaved.length * 2);
    const view = new DataView(wavBuffer);

    // Write WAV header
    writeWAVHeader(view, sampleRate, numChannels, bitDepth);

    // Write PCM samples
    let offset = 44;
    for (let i = 0; i < interleaved.length; i++) {
      // Clamp the value to [-1, 1]
      let sample = Math.max(-1, Math.min(1, interleaved[i]));
      // Scale to 16-bit integer
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, sample, true);
      offset += 2;
    }

    return new Blob([wavBuffer], { type: 'audio/wav' });
  };

  // Utility function to write WAV header
  const writeWAVHeader = (view: DataView, sampleRate: number, numChannels: number, bitDepth: number) => {
    const bufferLength = view.byteLength;
    const dataLength = bufferLength - 44;
    const byteRate = sampleRate * numChannels * (bitDepth / 8);

    // RIFF identifier
    writeString(view, 0, 'RIFF');
    // File length minus RIFF identifier and size
    view.setUint32(4, bufferLength - 8, true);
    // RIFF type
    writeString(view, 8, 'WAVE');
    // Format chunk identifier
    writeString(view, 12, 'fmt ');
    // Format chunk length
    view.setUint32(16, 16, true);
    // Sample format (PCM)
    view.setUint16(20, 1, true);
    // Number of channels
    view.setUint16(22, numChannels, true);
    // Sample rate
    view.setUint32(24, sampleRate, true);
    // Byte rate
    view.setUint32(28, byteRate, true);
    // Block align
    view.setUint16(32, numChannels * (bitDepth / 8), true);
    // Bits per sample
    view.setUint16(34, bitDepth, true);
    // Data chunk identifier
    writeString(view, 36, 'data');
    // Data chunk length
    view.setUint32(40, dataLength, true);
  };

  // Utility function to write strings to DataView
  const writeString = (view: DataView, offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // Function to toggle play/pause
  function handlePlay() {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  }

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `downloaded-audio.${fileFormat}`; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error('No audio available to download.');
    }
  };



  return (
<Flex direction="column" align="center" style={{ minHeight: '100vh' }}>
  {/* Main content at the center */}
  <Flex direction='column' w="90vw" justify="center" style={{ flexGrow: 1 }} align="center">
    <div ref={waveformRef} id="waveform" style={{ width: '95%', height: '100px' }} className={classes.waveform}></div>
    <div id="wave-timeline" style={{ width: '95%', height: '50px' }} className={classes.timeline}></div>
    <Flex justify="flex-end" me="60px" gap="20px">
      <Button onClick={handleCrop} className={classes['play-button']}><RiScissors2Fill size={20} /><p style={{ margin: "10px" }}>Crop</p></Button>
      <Button onClick={handleRemove} className={classes['play-button']}><MdDelete size={20} /><p style={{ margin: "10px" }}>Remove</p></Button>
    </Flex>
  </Flex>

  {/* Bottom controls aligned to bottom */}
  <Flex justify="space-between" align="center" w="100%" p={10} style={{ marginTop: 'auto', borderTop:"1px solid gray" }}>
    <Button onClick={handlePlay} w={80} h={40} ms={20} className={classes['play-button']}>
      {isPlaying ? <FaPause size={15} /> : <FaPlay size={15} />}
    </Button>
    <Flex align="center" gap="lg" me="60px">
      <NativeSelect radius="xl" data={['mp3', 'wav', 'aac', 'ogg']} onChange={e => setFileFormat(e.target.value)} />
      <Button onClick={handleDownload} className={classes['play-button']}>
        <FaDownload size={20} />
        <p style={{ margin: "10px" }}>Save</p>
      </Button>
    </Flex>
  </Flex>
</Flex>
  );
}

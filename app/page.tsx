'use client';
import { useMantineColorScheme } from '@mantine/core';
import Link from 'next/link';
import { useEffect } from 'react';
import './global.css'
import { IoIosCut } from "react-icons/io";
export default function HomePage() {
  const { setColorScheme } = useMantineColorScheme();
  useEffect(() => {
    setColorScheme('dark')
  }, [])
  return (
    <>
      <div className='landing-page'>
        <h1>Assignment - Video Dubber</h1>
        <Link href='/cutter'><button className='button'><p style={{margin:"2px"}}>Audio Trimmer</p></button></Link>
      </div>
    </>
  );
}

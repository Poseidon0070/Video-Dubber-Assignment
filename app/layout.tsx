import '@mantine/core/styles.css';

import React from 'react';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { theme } from '../theme';
import Sidebar from '@/components/Sidebar'
import './global.css'

export const metadata = {
  title: 'Audio Cutter',
  description: 'I am using Mantine with Next.js!',
};

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <div className='main-layout'>
            <div>
              <Sidebar />
            </div>
            {children}
          </div>
        </MantineProvider>
      </body>
    </html>
  );
}

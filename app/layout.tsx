import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { siteName } from '@/lib/utils';
import ConfigureAmplifyClientSide from '@/components/configure-amplify';
import outputs from '../amplify_outputs.json';
import { Amplify } from 'aws-amplify';

Amplify.configure(outputs);

export const metadata: Metadata = {
  title: siteName,
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
};

export const viewport: Viewport = {
  maximumScale: 1,
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <ConfigureAmplifyClientSide />
        {children}
      </body>
    </html>
  );
}

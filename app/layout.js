import './globals.css'


export const metadata = {
  title: 'AudioAmbient - Premium Ambient Sound Mixer for Focus & Sleep',
  description: 'Create your perfect background noise. Mix high-fidelity rain, wind, cafe, and nature sounds to boost productivity, block distractions, and sleep better.',
  keywords: ['ambient sound mixer', 'background noise generator', 'white noise', 'focus sounds', 'sleep sounds'],
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Newsreader:ital,opsz,wght@0,6..72,200;0,6..72,300;0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,200&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-background text-on-surface antialiased selection:bg-primary/30 min-h-screen relative">
        {children}
      </body>
    </html>
  )
}

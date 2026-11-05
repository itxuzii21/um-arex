import './globals.css';
import AnnouncementBar from '../components/AnnouncementBar';

export const metadata = {
  title: 'UM-AREX | Premium Leather Wallets & Accessories',
  description:
    'Premium handcrafted leather wallets and accessories. Timeless elegance from UM-AREX.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />

        {/* Font Awesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
      </head>

      <body>
        {/* =====================================================
            ANNOUNCEMENT BAR
        ===================================================== */}

        <AnnouncementBar />

        {/* =====================================================
            PAGE CONTENT
        ===================================================== */}

        {children}
      </body>
    </html>
  );
}
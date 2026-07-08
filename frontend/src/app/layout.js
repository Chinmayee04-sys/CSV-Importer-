import './globals.css';

export const metadata = {
  title: 'GrowEasy CSV Importer',
  description: 'AI-powered CSV import for CRM leads',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

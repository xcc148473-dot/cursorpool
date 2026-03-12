import './globals.css';

export const metadata = {
  title: 'Team Seat MVP',
  description: 'Minimal storefront + order tracking + message inbox'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

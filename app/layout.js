import './globals.css';

export const metadata = {
  title: 'SWD Predictive Tool | Scale with Data',
  description: 'Predict whether your next YouTube video will outperform, perform normally, or underperform — before you publish.',
  icons: {
    icon: '/logo-icon.svg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}

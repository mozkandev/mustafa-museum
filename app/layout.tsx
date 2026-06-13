import "./globals.css";

export const metadata = {
  title: "Art History Museum",
  description: "An interactive 3D walk-through museum of art history, powered by Wikipedia and Wikimedia Commons.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white antialiased overflow-hidden">
        {children}
      </body>
    </html>
  );
}

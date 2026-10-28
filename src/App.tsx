
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ImageCompressor from './pages/ImageCompressor';
import ImageConverter from './pages/ImageConverter';
import ImageResizer from './pages/ImageResizer';
import SocialImageMaker from './pages/SocialImageMaker';
import ScrollToTop from './components/layout/ScrollToTop';

export default function App() {
  return (
    <BrowserRouter>
    <ScrollToTop />
      <div className="flex min-h-screen flex-col bg-[#F7F8F4] font-sans text-[#202820]">
        <Header />

        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/image-compressor" element={<ImageCompressor />} />
            <Route path="/image-converter" element={<ImageConverter />} />
            <Route path="/image-resizer" element={<ImageResizer />} />
            <Route path="/social-image-maker" element={<SocialImageMaker />} />
            <Route
              path="*"
              element={
                <main className="mx-auto max-w-3xl px-5 py-24 text-center">
                  <h1 className="text-3xl font-extrabold">Page not found</h1>
                  <p className="mt-3 text-[#687268]">
                    Looks like this image tool doesn't exist yet.
                  </p>
                  <a
                    href="/"
                    className="mt-6 inline-flex rounded-xl bg-[#176B45] px-5 py-3 font-bold text-white"
                  >
                    Back to home
                  </a>
                </main>
              }
            />
          </Routes>
        </div>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

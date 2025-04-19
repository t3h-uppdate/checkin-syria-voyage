
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageGalleryProps {
  images: string[];
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [showFullGallery, setShowFullGallery] = useState(false);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const openGallery = (index: number) => {
    setCurrentImage(index);
    setShowFullGallery(true);
  };

  const closeGallery = () => {
    setShowFullGallery(false);
  };

  // Prevent scroll when gallery is open
  if (showFullGallery) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'unset';
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-96">
        {/* Main image */}
        <div 
          className="col-span-1 md:col-span-2 row-span-2 relative rounded-lg overflow-hidden cursor-pointer"
          onClick={() => openGallery(0)}
        >
          <img
            src={images[0]}
            alt="Hotel main view"
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Secondary images */}
        {images.slice(1, 5).map((image, index) => (
          <div 
            key={index} 
            className="relative rounded-lg overflow-hidden cursor-pointer hidden md:block"
            onClick={() => openGallery(index + 1)}
          >
            <img
              src={image}
              alt={`Hotel view ${index + 1}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
            {index === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white font-bold text-xl">+{images.length - 5} more</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Full screen gallery */}
      <AnimatePresence>
        {showFullGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          >
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={closeGallery}
                className="text-white hover:bg-white/20"
              >
                <X size={24} />
              </Button>
            </div>
            
            <div className="relative w-full max-w-6xl px-4">
              <div className="relative h-[70vh]">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImage}
                    src={images[currentImage]}
                    alt={`Gallery image ${currentImage + 1}`}
                    className="w-full h-full object-contain"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
              </div>
              
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevImage}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <ChevronLeft size={32} />
                </Button>
              </div>
              
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextImage}
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <ChevronRight size={32} />
                </Button>
              </div>
              
              <div className="text-center mt-4 text-white">
                {currentImage + 1} / {images.length}
              </div>
              
              {/* Thumbnails */}
              <div className="mt-4 flex justify-center space-x-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2 ${
                      index === currentImage ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => setCurrentImage(index)}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageGallery;

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Keyboard } from "swiper/modules";
import { Expand, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { MediaAsset } from "@district-one/shared-types";
import "swiper/css";
import "swiper/css/navigation";

interface ImageGalleryProps {
  images: MediaAsset[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowLeft") setActiveIndex((i) => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setActiveIndex((i) => (i + 1) % images.length);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isFullscreen, images.length]);

  if (images.length === 0) {
    return <div className="aspect-video rounded-xl bg-grey-light" />;
  }

  return (
    <div>
      {/* Desktop: main image + thumbnail rail */}
      <div className="hidden gap-3 md:grid md:grid-cols-[1fr_120px]">
        <button
          onClick={() => setFullscreen(true)}
          className="group relative aspect-[16/10] overflow-hidden rounded-xl bg-grey-light"
        >
          <img
            src={images[activeIndex].url}
            alt={images[activeIndex].alt ?? title}
            loading="eager"
            fetchPriority="high"
            className="h-full w-full object-cover"
          />
          <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-md bg-navy/80 px-3 py-1.5 text-xs text-white opacity-0 transition group-hover:opacity-100">
            <Expand size={13} /> View Gallery
          </span>
        </button>
        <div className="flex max-h-[420px] flex-col gap-3 overflow-y-auto">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`aspect-square shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === activeIndex ? "border-gold" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img.url} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: swipeable gallery */}
      <div className="md:hidden">
        <Swiper
          modules={[Navigation]}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          className="aspect-[4/3] overflow-hidden rounded-xl"
        >
          {images.map((img) => (
            <SwiperSlide key={img.id} onClick={() => setFullscreen(true)}>
              <img src={img.url} alt={img.alt ?? title} loading="lazy" className="h-full w-full object-cover" />
            </SwiperSlide>
          ))}
        </Swiper>
        <p className="mt-2 text-center text-xs text-text-muted">
          {activeIndex + 1} / {images.length}
        </p>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/95">
          <button onClick={() => setFullscreen(false)} aria-label="Close" className="absolute right-5 top-5 text-white/80 hover:text-white">
            <X size={28} />
          </button>

          <button
            onClick={() => setActiveIndex((i) => (i - 1 + images.length) % images.length)}
            aria-label="Previous"
            className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:left-6"
          >
            <ChevronLeft size={22} />
          </button>

          <Swiper
            modules={[Navigation, Keyboard]}
            keyboard
            initialSlide={activeIndex}
            onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
            className="h-[80vh] w-full max-w-5xl px-14"
          >
            {images.map((img) => (
              <SwiperSlide key={img.id} className="flex items-center justify-center">
                <img src={img.url} alt={img.alt ?? title} loading="lazy" className="max-h-full max-w-full object-contain" />
              </SwiperSlide>
            ))}
          </Swiper>

          <button
            onClick={() => setActiveIndex((i) => (i + 1) % images.length)}
            aria-label="Next"
            className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:right-6"
          >
            <ChevronRight size={22} />
          </button>

          <p className="absolute bottom-5 text-sm text-white/70">
            {activeIndex + 1} / {images.length}
          </p>
        </div>
      )}
    </div>
  );
}

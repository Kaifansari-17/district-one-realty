import { useRef } from "react";
import type { ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";

interface CarouselProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  itemKey: (item: T) => string;
  slidesPerView?: { base: number; sm?: number; md?: number; lg?: number };
}

export function Carousel<T>({ items, renderItem, itemKey, slidesPerView = { base: 1.15, sm: 2.2, md: 3.2, lg: 4 } }: CarouselProps<T>) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <Swiper
        modules={[Navigation]}
        spaceBetween={20}
        slidesPerView={slidesPerView.base}
        breakpoints={{
          640: { slidesPerView: slidesPerView.sm ?? slidesPerView.base },
          768: { slidesPerView: slidesPerView.md ?? slidesPerView.base },
          1024: { slidesPerView: slidesPerView.lg ?? slidesPerView.base },
        }}
        onBeforeInit={(swiper) => {
          // @ts-expect-error swiper types expect the ref before it's attached
          swiper.params.navigation.prevEl = prevRef.current;
          // @ts-expect-error same as above
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        className="!pb-2"
      >
        {items.map((item) => (
          <SwiperSlide key={itemKey(item)} className="!h-auto">
            {renderItem(item)}
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="mt-4 hidden justify-end gap-2 md:flex">
        <button
          ref={prevRef}
          aria-label="Previous"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-navy transition hover:border-navy hover:bg-navy hover:text-white disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          ref={nextRef}
          aria-label="Next"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-navy transition hover:border-navy hover:bg-navy hover:text-white disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

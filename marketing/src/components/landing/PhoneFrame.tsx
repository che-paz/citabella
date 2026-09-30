import Image from "next/image";

type PhoneFrameProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function PhoneFrame({
  src,
  alt,
  className = "",
  priority = false,
  sizes = "(min-width: 1024px) 280px, 45vw",
}: PhoneFrameProps) {
  return (
    <div
      className={`rounded-[2.4rem] bg-lp-ink p-[0.55rem] shadow-[0_30px_60px_-20px_rgba(29,23,24,0.45),0_12px_24px_-12px_rgba(29,23,24,0.3)] ring-1 ring-black/10 ${className}`}
    >
      <div className="relative overflow-hidden rounded-[1.9rem] bg-white">
        <div
          aria-hidden
          className="absolute left-1/2 top-2 z-10 h-[0.9rem] w-[32%] -translate-x-1/2 rounded-full bg-lp-ink"
        />
        <Image
          src={src}
          alt={alt}
          width={808}
          height={1502}
          sizes={sizes}
          priority={priority}
          className="block aspect-[404/751] h-auto w-full object-cover object-top"
        />
      </div>
    </div>
  );
}

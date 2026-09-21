import Image from "next/image";
import { existsSync } from "fs";
import path from "path";

type GuideScreenshotProps = {
  slug: string;
  filename: string;
  alt: string;
};

function screenshotExists(slug: string, filename: string): boolean {
  const filePath = path.join(
    process.cwd(),
    "public",
    "ayuda",
    slug,
    filename
  );
  return existsSync(filePath);
}

export function GuideScreenshot({
  slug,
  filename,
  alt,
}: GuideScreenshotProps) {
  const ready = screenshotExists(slug, filename);
  const src = `/ayuda/${slug}/${filename}`;

  if (ready) {
    return (
      <figure className="overflow-hidden rounded-xl border border-sand bg-white/60">
        <Image
          src={src}
          alt={alt}
          width={960}
          height={640}
          className="h-auto w-full object-cover object-top"
          sizes="(max-width: 768px) 100vw, 720px"
        />
        <figcaption className="border-t border-sand px-3 py-2 text-xs text-muted">
          {alt}
        </figcaption>
      </figure>
    );
  }

  return (
    <figure
      className="flex min-h-[10rem] flex-col items-center justify-center rounded-xl border border-dashed border-rose-soft/80 bg-white/40 px-4 py-8 text-center"
      aria-label={`Captura pendiente: ${alt}`}
    >
      <p className="text-sm font-medium text-ink">Captura pendiente</p>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted">
        {alt}. Se agregará en{" "}
        <code className="rounded bg-sand/60 px-1 py-0.5 text-[0.7rem]">
          public/ayuda/{slug}/{filename}
        </code>
      </p>
    </figure>
  );
}

import React from "react";
import { Image as ImageIcon, ExternalLink } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function GeneratedImages({ images }) {
  if (!images?.length) return null;
  return (
    <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5 backdrop-blur-2xl">
      <div className="mb-2 flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5 text-fuchsia-300" />
        <span className="text-xs font-medium text-white/80">Set generato · {images.length} foto</span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {images.map((im, i) => (
          <div key={i} className="aspect-[3/4] overflow-hidden rounded-lg border border-white/10 bg-black/40">
            {im.image_url ? (
              <Image src={im.image_url} alt={im.prompt} fittingType="fill" className="h-full w-full" />
            ) : (
              <div className="flex h-full items-center justify-center p-1 text-center text-[9px] text-red-300/80">{im.error || "errore"}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
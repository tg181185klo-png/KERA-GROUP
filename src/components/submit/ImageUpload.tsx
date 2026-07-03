"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/utils/supabase";

interface ImageUploadProps {
  images: string[];
  onChange: (urls: string[]) => void;
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      setUploading(true);

      try {
        if (!isSupabaseConfigured()) {
          setError(
            "Supabase არ არის კონფიგურირებული. დაამატეთ .env.local ფაილი."
          );
          return;
        }

        const supabase = createClient();
        const fileArray = Array.from(files).filter((f) =>
          ["image/jpeg", "image/png", "image/webp"].includes(f.type)
        );

        if (fileArray.length === 0) {
          setError("მხოლოდ JPG, PNG ან WEBP ფორმატია დაშვებული");
          return;
        }

        const uploaded: string[] = [];

        for (const file of fileArray) {
          const ext = file.name.split(".").pop() ?? "jpg";
          const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

          const { error: uploadError } = await supabase.storage
            .from("property-images")
            .upload(path, file, { cacheControl: "3600", upsert: false });

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from("property-images")
            .getPublicUrl(path);

          uploaded.push(data.publicUrl);
        }

        onChange([...images, ...uploaded]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "ატვირთვა ვერ მოხერხდა. შეამოწმეთ Supabase Storage კონფიგურაცია."
        );
      } finally {
        setUploading(false);
      }
    },
    [images, onChange]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) {
      uploadFiles(e.dataTransfer.files);
    }
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? "border-kera-tbc bg-kera-tbc/5"
            : "border-slate-200 bg-slate-50"
        }`}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          disabled={uploading}
        />
        <ImagePlus className="mx-auto h-10 w-10 text-slate-400" />
        <p className="mt-3 text-sm font-medium text-slate-700">
          ჩააგდეთ ფოტოები ან აირჩიეთ ფაილები
        </p>
        <p className="mt-1 text-xs text-slate-500">
          JPG, PNG, WEBP — პირდაპირ Supabase Storage-ში აიტვირთება
        </p>
        {uploading && (
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-kera-tbc">
            <Loader2 className="h-4 w-4 animate-spin" />
            იტვირთება...
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, i) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100"
            >
              <Image
                src={url}
                alt={`ფოტო ${i + 1}`}
                fill
                className="object-cover"
                sizes="200px"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

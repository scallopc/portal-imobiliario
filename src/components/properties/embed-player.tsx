'use client';

import React from 'react';

interface EmbedPlayerProps {
  src: string;
  title: string;
}

const getEmbedUrl = (url: string): string => {
  if (!url) return '';

  try {
    const urlObject = new URL(url);
    let videoId: string | null = null;

    if (urlObject.hostname.includes('youtube.com')) {
      videoId = urlObject.searchParams.get('v');
    } else if (urlObject.hostname.includes('youtu.be')) {
      videoId = urlObject.pathname.slice(1);
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  } catch (error) {
    console.error('Invalid URL for embed player:', url, error);
    return '';
  }

  return url;
};

export function EmbedPlayer({ src, title }: EmbedPlayerProps) {
  const embedSrc = getEmbedUrl(src);

  if (!embedSrc) {
    return (
      <div className="aspect-video w-full flex items-center justify-center bg-muted rounded-2xl border border-destructive/50">
        <p className="text-destructive">URL do conteúdo inválida ou não suportada.</p>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-accent/20 shadow-lg">
      <iframe
        src={embedSrc}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="h-full w-full"
      ></iframe>
    </div>
  );
}

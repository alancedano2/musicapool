import React from 'react';
import SearchableList from './SearchableList';

interface Song {
  name: string;
  url: string;
}

const CLOUDFLARE_URL = "https://lance-movement-reliability-fares.trycloudflare.com";

async function getSongsFromHTML(): Promise<Song[]> {
  try {
    const res = await fetch(CLOUDFLARE_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('No se pudo conectar al almacenamiento local');
    
    const html = await res.text();
    const regex = /<a href="([^"]+)">([^<]+)<\/a>/g;
    const songs: Song[] = [];
    let match;

    const decodeHTML = (str: string) => {
      let decoded = str.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => 
        String.fromCharCode(parseInt(hex, 16))
      );
      return decoded.normalize('NFC');
    };

    while ((match = regex.exec(html)) !== null) {
      const href = match[1];
      const rawName = match[2];

      if (href === '../' || rawName === '../') continue;

      if (/\.(mp3|wav|flac|m4a)$/i.test(rawName)) {
        const cleanName = decodeHTML(rawName);

        songs.push({
          name: cleanName,
          url: `${CLOUDFLARE_URL}/${href}`
        });
      }
    }

    return songs;
  } catch (error) {
    console.error("Error leyendo la lista de música:", error);
    return []; // Si el fetch falla, devuelve un array vacío en vez de romper la app
  }
}

export default async function Home() {
  const songs = await getSongsFromHTML();

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-6 sm:p-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Music Pool</h1>
            <p className="text-sm text-zinc-400 mt-1">Tu almacenamiento de musica</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Server Activo
          </div>
        </div>

        {/* Pasamos los temas al componente interactivo */}
        <SearchableList initialSongs={songs} />

      </div>
    </main>
  );
}
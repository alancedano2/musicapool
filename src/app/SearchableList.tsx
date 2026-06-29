'use client';

import React, { useState, useMemo } from 'react';

interface Song {
  name: string;
  url: string;
}

// ARREGLADO: Le ponemos '= []' para que si por algún error llega undefined, no explote el forEach
export default function SearchableList({ initialSongs = [] }: { initialSongs?: Song[] }) {
  const [search, setSearch] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);

  const removeAccents = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const artists = useMemo(() => {
    const artistMap = new Map<string, string>();
    
    initialSongs.forEach(song => {
      let rawArtist = '';

      if (song.name.includes(' - ')) {
        rawArtist = song.name.split(' - ')[0].trim();
      } else {
        rawArtist = song.name.split(' ')[0].trim();
      }

      if (rawArtist && rawArtist.length > 2) {
        const firstArtist = rawArtist
          .split(/,|\bfeat\b|\bft\b|\bfaet\b|&|\bx\b/i)[0]
          .trim();

        if (firstArtist) {
          const cleanKey = removeAccents(firstArtist.toLowerCase());
          if (!artistMap.has(cleanKey)) {
            artistMap.set(cleanKey, firstArtist);
          }
        }
      }
    });

    return Array.from(artistMap.values()).sort((a, b) => a.localeCompare(b));
  }, [initialSongs]);

  const filteredSongs = useMemo(() => {
    return initialSongs.filter(song => {
      let matchesArtist = true;

      if (selectedArtist) {
        const cleanSongName = removeAccents(song.name.toLowerCase());
        const cleanSelectedArtist = removeAccents(selectedArtist.toLowerCase());
        matchesArtist = cleanSongName.startsWith(cleanSelectedArtist);
      }

      const matchesSearch = removeAccents(song.name.toLowerCase())
        .includes(removeAccents(search.toLowerCase()));

      return matchesArtist && matchesSearch;
    });
  }, [initialSongs, selectedArtist, search]);

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start w-full">
      
      {/* PANEL IZQUIERDO: Artistas */}
      <aside className="w-full md:w-72 shrink-0 bg-zinc-900 border border-zinc-800 rounded-xl p-4 sticky top-6 shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-3">
          <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-400">Filtrar por Artista</h2>
          {selectedArtist && (
            <button 
              onClick={() => setSelectedArtist(null)}
              className="text-xs text-blue-400 hover:text-blue-300 hover:underline transition"
            >
              Limpiar
            </button>
          )}
        </div>
        
        <div className="space-y-1 max-h-[calc(100vh-250px)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
          <button
            onClick={() => setSelectedArtist(null)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-between ${
              selectedArtist === null 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold' 
                : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-2">🎵 Todos los tracks</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${selectedArtist === null ? 'bg-blue-700 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
              {initialSongs.length}
            </span>
          </button>

          {artists.map(artist => {
            const cleanArtist = removeAccents(artist.toLowerCase());
            const count = initialSongs.filter(s => 
              removeAccents(s.name.toLowerCase()).startsWith(cleanArtist)
            ).length;

            return (
              <button
                key={artist}
                onClick={() => setSelectedArtist(artist)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-between group ${
                  selectedArtist === artist 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold' 
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-white'
                }`}
              >
                <span className="truncate pr-2 flex items-center gap-2">
                  <span className={selectedArtist === artist ? 'text-white' : 'text-zinc-600 group-hover:text-zinc-400'}>👤</span>
                  {artist}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-mono shrink-0 transition-colors ${
                  selectedArtist === artist ? 'bg-blue-700 text-white' : 'bg-zinc-800/80 text-zinc-500 group-hover:bg-zinc-700 group-hover:text-zinc-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* PANEL DERECHO: Buscador y Lista */}
      <div className="flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
        
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500 text-base">
              🔍
            </span>
            <input
              type="text"
              placeholder={selectedArtist ? `Buscar dentro de ${selectedArtist}...` : "Buscar por nombre"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 transition"
            />
          </div>
          {(search || selectedArtist) && (
            <p className="text-xs text-zinc-500 font-mono self-end sm:self-center">
              Resultados: <span className="text-zinc-300 font-bold">{filteredSongs.length}</span> tracks
            </p>
          )}
        </div>

        <div className="w-full">
          {filteredSongs.length === 0 ? (
            <div className="p-16 text-center text-zinc-500">
              <span className="text-4xl block mb-3">🎵</span>
              <p className="text-sm font-medium">No se encontraron tracks en esta sección</p>
            </div>
          ) : (
            <div className="w-full text-left border-collapse">
              <div className="flex items-center justify-between px-6 py-3 bg-zinc-950/40 border-b border-zinc-800/60 text-xs font-bold uppercase tracking-wider text-zinc-500">
                <span>Nombre del archivo</span>
                <span className="pr-12">Acción</span>
              </div>

              <ul className="divide-y divide-zinc-800/60">
                {filteredSongs.map((song) => (
                  <li 
                    key={song.name} 
                    className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/30 transition-all duration-150 group gap-4"
                  >
                    <div className="flex items-start gap-4 flex-1 py-0.5">
                      <span className="text-lg text-zinc-600 group-hover:text-blue-400 transition-colors shrink-0 mt-0.5">
                        🎵
                      </span>
                      <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors break-words">
                        {song.name}
                      </span>
                    </div>

                    <div className="shrink-0 self-center">
                      <a 
                        href={song.url}
                        download={song.name}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all active:scale-95 inline-block whitespace-nowrap"
                      >
                        Descargar
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
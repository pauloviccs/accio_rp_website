import React, { useState, useEffect } from 'react';
import { 
  Music, Play, Pause, SkipForward, SkipBack, Shuffle, 
  Volume2, VolumeX, ChevronDown, ChevronUp, Disc3 
} from 'lucide-react';
import { 
  musicPlayer, 
  MusicPlayerState, 
  HOGWARTS_SOUNDTRACK_PLAYLIST 
} from '../lib/audio';
import { ArcaneFrame } from './ArcaneOrnaments';

export const MusicPlayerWidget: React.FC = () => {
  const [playerState, setPlayerState] = useState<MusicPlayerState>(musicPlayer.getState());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const unsub = musicPlayer.subscribe((state) => {
      setPlayerState(state);
    });
    return unsub;
  }, []);

  const { isPlaying, currentTrack, volume, isMuted, shuffle } = playerState;

  return (
    <div className="fixed bottom-4 left-4 z-50 select-none">
      {/* Widget Expandido com Playlist Completa */}
      {isExpanded ? (
        <ArcaneFrame className="w-80 sm:w-96 bg-[#0a0f19]/95 p-4 sm:p-5 shadow-2xl backdrop-blur-xl animate-apple-modal">
          
          {/* Topo do Player */}
          <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-[#0d1422] flex items-center justify-center border border-[var(--house-border)]">
                <Disc3 className={`w-4 h-4 text-[var(--house-accent)] ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              </div>
              <div>
                <span className="eyebrow text-[10px] block leading-none">
                  Trilha Sonora de Hogwarts
                </span>
                <span className="text-xs text-[#b6bbc5] font-crimson">
                  Composta por Jeremy Soule
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 text-[#b6bbc5] hover:text-white hover:bg-white/5 transition cursor-pointer"
              title="Recolher player"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Faixa Atual */}
          <div className="bg-[#090e17] border border-[var(--house-border)] p-3 mb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-2">
                <span className="text-xs sm:text-sm font-display text-gold-gradient block truncate">
                  {currentTrack.title}
                </span>
                <span className="text-[11px] text-[#b6bbc5] font-crimson italic block truncate">
                  {currentTrack.subtitle}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[var(--house-accent)] px-1.5 py-0.5 bg-white/5">
                {currentTrack.duration}
              </span>
            </div>

            {/* Visualizador de Barras de Som */}
            <div className="flex items-center justify-center gap-1 mt-3 h-5">
              {[40, 70, 100, 55, 85, 30, 95, 60, 45, 80, 65, 35, 90, 50, 75].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 bg-gradient-to-t from-[var(--house-btn-end)] to-[var(--house-btn-start)] rounded-full transition-all duration-300 ${
                    isPlaying ? 'opacity-100 animate-pulse' : 'opacity-30'
                  }`}
                  style={{
                    height: isPlaying ? `${Math.max(15, (h * (volume || 0.5)))}%` : '20%',
                    animationDelay: `${i * 0.08}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Controles Principais */}
          <div className="flex items-center justify-between mb-3 px-2">
            <button
              onClick={() => musicPlayer.toggleShuffle()}
              className={`p-2 transition cursor-pointer ${
                shuffle ? 'text-[var(--house-accent)] bg-white/5' : 'text-[#8b93a1] hover:text-white'
              }`}
              title={shuffle ? 'Modo Shuffle Ativado' : 'Modo Shuffle Desativado'}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => musicPlayer.prev()}
                className="p-2 hover:bg-white/10 text-[#ece7da] transition cursor-pointer active:scale-95"
                title="Faixa anterior"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => musicPlayer.togglePlay()}
                className="w-10 h-10 rounded-full bg-gradient-to-b from-[var(--house-btn-start)] to-[var(--house-btn-end)] flex items-center justify-center shadow-lg cursor-pointer active:scale-90 transition"
                title={isPlaying ? 'Pausar Trilha' : 'Reproduzir Trilha'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-[#17130b]" />
                ) : (
                  <Play className="w-5 h-5 text-[#17130b] ml-0.5" />
                )}
              </button>

              <button
                onClick={() => musicPlayer.next()}
                className="p-2 hover:bg-white/10 text-[#ece7da] transition cursor-pointer active:scale-95"
                title="Próxima faixa"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => musicPlayer.toggleMute()}
              className={`p-2 transition cursor-pointer ${
                isMuted ? 'text-[#b5675e] bg-[#b5675e]/10' : 'text-[#b6bbc5] hover:text-[#7fd29a]'
              }`}
              title={isMuted ? 'Desmutar' : 'Mutar'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Slider de Volume */}
          <div className="flex items-center space-x-2 px-2 py-1 mb-3 bg-white/5">
            <Volume2 className="w-3.5 h-3.5 text-[var(--house-accent)]" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                if (isMuted) musicPlayer.setMuted(false);
                musicPlayer.setVolume(parseFloat(e.target.value));
              }}
              className="w-full h-1 bg-[#090e17] appearance-none cursor-pointer accent-[#c9b07a]"
            />
            <span className="text-[10px] font-mono text-[#b6bbc5] w-8 text-right">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>

          {/* Lista de Faixas Canônicas */}
          <div>
            <span className="eyebrow text-[10px] block mb-1.5 px-1">
              Faixas Temáticas de Hogwarts
            </span>
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {HOGWARTS_SOUNDTRACK_PLAYLIST.map((track, idx) => {
                const isSelected = track.id === currentTrack.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => musicPlayer.playTrackIndex(idx)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-left text-xs transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#0d1422] text-[#ece7da] border border-[var(--house-border)]'
                        : 'hover:bg-white/5 text-[#b6bbc5] hover:text-[#ece7da]'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className="text-[10px] font-mono text-[var(--house-accent)]">0{idx + 1}</span>
                      <span className="truncate font-medium">{track.title}</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-60 ml-2">{track.duration}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </ArcaneFrame>
      ) : (
        /* Widget Compacto / Pílula Flutuante */
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center space-x-2.5 px-3 py-2 bg-[#0a0f19]/92 hover:bg-[#0d1422] border border-[var(--house-border)] text-xs text-[#ece7da] shadow-xl backdrop-blur-md transition-all hover:scale-105 cursor-pointer group"
          title="Abrir Player de Música de Hogwarts"
        >
          <div className="w-5 h-5 bg-[#0d1422] flex items-center justify-center border border-[var(--house-border)]">
            <Music className={`w-3 h-3 text-[var(--house-accent)] ${isPlaying ? 'animate-bounce' : ''}`} />
          </div>

          {/* Barrinhas animadas */}
          <div className="flex items-center gap-0.5 h-3">
            {[4, 8, 12, 6, 10].map((h, i) => (
              <div
                key={i}
                className={`w-0.5 bg-[var(--house-accent)] transition-all duration-200 ${
                  isPlaying ? 'animate-pulse' : 'opacity-40'
                }`}
                style={{
                  height: isPlaying ? `${h}px` : '3px',
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>

          <span className="font-display text-[11px] text-gold-gradient max-w-[120px] truncate hidden sm:inline">
            {currentTrack.title}
          </span>

          <ChevronUp className="w-3.5 h-3.5 text-[var(--house-accent)] opacity-75 group-hover:opacity-100 transition" />
        </button>
      )}
    </div>
  );
};

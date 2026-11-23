// Gerenciador de Efeitos Sonoros Mágicos (Web Audio API)
// 100% Procedural e Offline: Sem dependências externas de rede, sem risco de 404, latência zero.

class SoundManager {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;
  private listeners: Set<(muted: boolean) => void> = new Set();

  constructor() {
    // Carregar preferência salva
    try {
      const saved = localStorage.getItem('accio_sound_muted');
      if (saved !== null) {
        this.muted = saved === 'true';
      }
    } catch {
      this.muted = false;
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    try {
      localStorage.setItem('accio_sound_muted', String(muted));
    } catch {}
    this.notify();
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    if (!this.muted) {
      this.playSparkle();
    }
    return this.muted;
  }

  public subscribe(listener: (muted: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn(this.muted));
  }

  // 1. Som de Lacre Rompido (Wax Seal Crack)
  public playWaxBreak() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Ruído branco filtrado para simular o estalo da cera sólida partindo
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(3.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    whiteNoise.start(now);

    // Adiciona faísca sonora mágica subsequente
    setTimeout(() => this.playSparkle(), 80);
  }

  // 2. Poeira de Estrelas / Feitiço Conjurado (Sparkle Harp)
  public playSparkle() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Arpejo estelar pentatônico em Lá Maior (A5, C#6, E6, G#6, A6)
    const freqs = [880, 1108.73, 1318.51, 1661.22, 1760];

    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.045);

      gain.gain.setValueAtTime(0.001, now + index * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.08, now + index * 0.045 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.045 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.045);
      osc.stop(now + index * 0.045 + 0.46);
    });
  }

  // 3. Tique Mecânico Suave da Roleta / Timer Apple (Wheel Picker Tick)
  public playWheelTick() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.025);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  // 4. Toque Suave de Botão / Clique Tátil
  public playClick() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  // 5. Ressonância Arcana ao Passar o Mouse (Hover)
  public playHover() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, now); // Frequência harmônica dourada

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.025, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  // 6. Pena Escrevendo no Pergaminho (Quill Scratch)
  public playQuill() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.08;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(3200, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
  }

  // 7. Chamado da Coruja & Voo Mágico (Owl & Whoosh)
  public playOwl() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Nota 1 do pio
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(580, now);
    osc1.frequency.exponentialRampToValueAtTime(620, now + 0.15);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.08, now + 0.06);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.23);

    // Nota 2 do pio (mais longa e suave)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(520, now + 0.26);
    osc2.frequency.exponentialRampToValueAtTime(540, now + 0.45);
    gain2.gain.setValueAtTime(0.001, now + 0.26);
    gain2.gain.linearRampToValueAtTime(0.09, now + 0.35);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.26);
    osc2.stop(now + 0.66);
  }

  // 8. Desdobrar da Carta de Pergaminho (Paper Unfold)
  public playEnvelopeOpen() {
    if (this.muted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }
}

export const soundManager = new SoundManager();

// =============================================================
// REPRODUTOR DE TRILHA SONORA MÁGICA CONTÍNUA (BACKGROUND MUSIC)
// Trilha orquestral composta por Jeremy Soule para a saga Harry Potter
// =============================================================

export type MusicTheme = 'mystical' | 'letter' | 'creation' | 'dungeon' | 'express' | 'triumph';

export interface MusicTrack {
  id: string;
  title: string;
  subtitle: string;
  composer: string;
  url: string;
  theme: MusicTheme;
  duration: string;
}

export const HOGWARTS_SOUNDTRACK_PLAYLIST: MusicTrack[] = [
  {
    id: 'twilight-magic',
    title: 'Twilight Magic',
    subtitle: 'Noite nos Arcos do Castelo',
    composer: 'Jeremy Soule',
    url: '/audio/twilight-magic.mp3',
    theme: 'mystical',
    duration: '01:18',
  },
  {
    id: 'secret-garden',
    title: 'Secret Garden',
    subtitle: 'A Carta de Convocação & Jardins',
    composer: 'Jeremy Soule',
    url: '/audio/secret-garden.mp3',
    theme: 'letter',
    duration: '02:10',
  },
  {
    id: 'casting-spells',
    title: 'Casting Spells',
    subtitle: 'Oficina de Varinhas de Ollivanders',
    composer: 'Jeremy Soule',
    url: '/audio/casting-spells.mp3',
    theme: 'creation',
    duration: '01:07',
  },
  {
    id: 'dark-tale',
    title: 'Dark Tale',
    subtitle: 'Masmorras & Gabinete Ministerial',
    composer: 'Jeremy Soule',
    url: '/audio/dark-tale.mp3',
    theme: 'dungeon',
    duration: '01:21',
  },
  {
    id: 'train-leaving',
    title: "Train's Leaving",
    subtitle: 'Plataforma 9¾ & Expresso de Hogwarts',
    composer: 'Jeremy Soule',
    url: '/audio/train-leaving.mp3',
    theme: 'express',
    duration: '01:01',
  },
  {
    id: 'triumphant-arrival',
    title: 'Triumphant Arrival',
    subtitle: 'Chegada ao Salão Principal',
    composer: 'Jeremy Soule',
    url: '/audio/triumphant-arrival.mp3',
    theme: 'triumph',
    duration: '00:59',
  },
];

export interface MusicPlayerState {
  isPlaying: boolean;
  currentTrack: MusicTrack;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  currentTheme: MusicTheme;
}

class MusicPlayer {
  private audio: HTMLAudioElement | null = null;
  private playlist: MusicTrack[] = HOGWARTS_SOUNDTRACK_PLAYLIST;
  private currentIndex: number = 0;
  private isPlaying: boolean = false;
  private volume: number = 0.35;
  private isMuted: boolean = false;
  private shuffle: boolean = true;
  private currentTheme: MusicTheme = 'mystical';
  private listeners: Set<(state: MusicPlayerState) => void> = new Set();
  private userInteracted: boolean = false;
  private fadeInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedMuted = localStorage.getItem('accio_sound_muted');
        if (savedMuted !== null) {
          this.isMuted = savedMuted === 'true';
        }
        const savedVol = localStorage.getItem('accio_music_volume');
        if (savedVol !== null) {
          this.volume = parseFloat(savedVol);
        }
      } catch {}

      // Sincroniza com mutação global de soundManager
      soundManager.subscribe((muted) => {
        this.setMuted(muted);
      });

      // Ouvinte de primeiro clique para contornar restrições de autoplay dos navegadores
      const handleFirstInteraction = () => {
        if (!this.userInteracted) {
          this.userInteracted = true;
          this.initAudio();
          if (!this.isMuted && !this.isPlaying) {
            this.play();
          }
        }
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
      };

      window.addEventListener('click', handleFirstInteraction, { passive: true });
      window.addEventListener('keydown', handleFirstInteraction, { passive: true });
      window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    }
  }

  private initAudio() {
    if (this.audio) return;
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.volume = this.isMuted ? 0 : this.volume;
    this.loadTrack(this.currentIndex);

    this.audio.addEventListener('ended', () => {
      this.handleTrackEnded();
    });

    this.audio.addEventListener('error', (e) => {
      console.warn('Erro ao reproduzir áudio ambiente de Hogwarts:', e);
    });
  }

  private loadTrack(index: number) {
    if (!this.audio) return;
    this.currentIndex = index;
    const track = this.playlist[this.currentIndex];
    this.audio.src = track.url;
    this.notify();
  }

  private handleTrackEnded() {
    if (this.shuffle) {
      let nextIdx = Math.floor(Math.random() * this.playlist.length);
      if (nextIdx === this.currentIndex && this.playlist.length > 1) {
        nextIdx = (this.currentIndex + 1) % this.playlist.length;
      }
      this.playTrackIndex(nextIdx);
    } else {
      this.next();
    }
  }

  public getState(): MusicPlayerState {
    return {
      isPlaying: this.isPlaying,
      currentTrack: this.playlist[this.currentIndex] || this.playlist[0],
      volume: this.volume,
      isMuted: this.isMuted,
      shuffle: this.shuffle,
      currentTheme: this.currentTheme,
    };
  }

  public subscribe(listener: (state: MusicPlayerState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const st = this.getState();
    this.listeners.forEach((fn) => fn(st));
  }

  public async play(): Promise<void> {
    this.initAudio();
    if (!this.audio) return;
    try {
      this.audio.volume = this.isMuted ? 0 : this.volume;
      await this.audio.play();
      this.isPlaying = true;
      this.notify();
    } catch (err) {
      console.warn('Autoplay bloqueado pelo navegador aguardando interação do usuário.');
    }
  }

  public pause() {
    if (this.audio) {
      this.audio.pause();
    }
    this.isPlaying = false;
    this.notify();
  }

  public togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public playTrackIndex(index: number) {
    this.initAudio();
    if (!this.audio) return;
    this.currentIndex = (index + this.playlist.length) % this.playlist.length;
    this.loadTrack(this.currentIndex);
    this.play();
  }

  public next() {
    this.playTrackIndex(this.currentIndex + 1);
  }

  public prev() {
    this.playTrackIndex(this.currentIndex - 1);
  }

  public toggleShuffle() {
    this.shuffle = !this.shuffle;
    this.notify();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audio && !this.isMuted) {
      this.audio.volume = this.volume;
    }
    try {
      localStorage.setItem('accio_music_volume', String(this.volume));
    } catch {}
    this.notify();
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.audio) {
      this.audio.volume = muted ? 0 : this.volume;
    }
    this.notify();
  }

  public toggleMute(): boolean {
    const next = !this.isMuted;
    soundManager.setMuted(next);
    this.setMuted(next);
    return next;
  }

  /**
   * Transiciona suavemente para a faixa com o teor/tema desejado
   * (ex: 'creation' ao abrir formulário de varinhas, 'letter' ao abrir a carta, 'dungeon' no admin)
   */
  public setContextTheme(theme: MusicTheme) {
    this.currentTheme = theme;
    const targetIdx = this.playlist.findIndex((t) => t.theme === theme);
    if (targetIdx !== -1 && targetIdx !== this.currentIndex) {
      this.fadeToTrack(targetIdx);
    }
  }

  private fadeToTrack(targetIndex: number) {
    if (!this.audio || !this.isPlaying) {
      this.currentIndex = targetIndex;
      this.loadTrack(targetIndex);
      return;
    }

    if (this.fadeInterval) clearInterval(this.fadeInterval);

    let currentVol = this.audio.volume;
    const step = 0.05;

    // Fade Out rápido
    this.fadeInterval = setInterval(() => {
      currentVol = Math.max(0, currentVol - step);
      if (this.audio) this.audio.volume = currentVol;

      if (currentVol <= 0.02) {
        clearInterval(this.fadeInterval);
        this.loadTrack(targetIndex);
        this.play().then(() => {
          // Fade In
          let inVol = 0.02;
          this.fadeInterval = setInterval(() => {
            inVol = Math.min(this.volume, inVol + step);
            if (this.audio && !this.isMuted) this.audio.volume = inVol;
            if (inVol >= this.volume) {
              clearInterval(this.fadeInterval);
            }
          }, 60);
        });
      }
    }, 50);
  }
}

export const musicPlayer = new MusicPlayer();


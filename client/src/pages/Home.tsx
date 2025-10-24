import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    instagram: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const audioRef = useRef<HTMLAudioElement>(null);

  const createLeadMutation = trpc.leads.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Cadastro realizado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao enviar formulário. Tente novamente.");
      console.error(error);
    },
  });

  useEffect(() => {
    // Fade-in inicial
    const introTimer = setTimeout(() => {
      setShowIntro(false);
    }, 1500);

    const loadTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 2000);

    return () => {
      clearTimeout(introTimer);
      clearTimeout(loadTimer);
    };
  }, []);

  // Countdown timer até 29/10/2025 00:00:00
  useEffect(() => {
    const targetDate = new Date("2025-10-29T00:00:00").getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const handlePlayMusic = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setShowPlayButton(false);
      }).catch((error) => {
        console.log("Erro ao reproduzir música:", error);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLeadMutation.mutate(formData);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden cursor-custom">
      {/* Ruído visual (grain film) */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-noise" />

      {/* Fade-in inicial */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black animate-fade-in">
          <p className="text-xs md:text-sm tracking-[0.3em] opacity-70 font-light px-4 text-center">
            We Believe In Ghosts...
          </p>
        </div>
      )}

      {/* Botão de Play inicial */}
      {showPlayButton && !showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <button
            onClick={handlePlayMusic}
            className="group flex flex-col items-center gap-4 transition-transform hover:scale-105"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-white/50 flex items-center justify-center group-hover:border-white transition-colors">
              <svg
                className="w-10 h-10 md:w-12 md:h-12 text-white/70 group-hover:text-white transition-colors ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="text-xs md:text-sm tracking-[0.2em] text-white/50 group-hover:text-white/70 transition-colors">
              CLICK TO ENTER
            </p>
          </button>
        </div>
      )}

      {/* Áudio da música */}
      <audio ref={audioRef} loop>
        <source src="/midnight-ravers.mp3" type="audio/mpeg" />
      </audio>

      {/* Botão de mute */}
      {isPlaying && (
        <button
          onClick={toggleMute}
          className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-40 text-white/50 hover:text-white transition-colors text-xs tracking-wider"
        >
          {isMuted ? "UNMUTE" : "MUTE"}
        </button>
      )}

      {/* Conteúdo principal */}
      <div
        className={`flex flex-col items-center justify-center min-h-screen px-4 py-12 md:py-8 transition-opacity duration-1000 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Logo WBG - AUMENTADA */}
        <div className="mb-6 md:mb-8 animate-glow">
          <img
            src="/wbg-logo.png"
            alt="WBG Logo"
            className="w-32 h-32 md:w-48 md:h-48 lg:w-56 lg:h-56 object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          />
        </div>

        {/* Nome do drop com fonte Impact */}
        <h1 
          className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-[0.15em] md:tracking-[0.2em] mb-3 md:mb-4 text-center px-4"
          style={{ fontFamily: 'Impact, sans-serif' }}
        >
          MIDNIGHT RAVER$
        </h1>

        {/* H2 - ACESSO ANTECIPADO */}
        <h2 className="text-lg md:text-2xl lg:text-3xl font-light tracking-[0.2em] md:tracking-[0.25em] mb-8 md:mb-10 text-center px-4 text-white/80">
          ACESSO ANTECIPADO
        </h2>

        {/* Formulário ou mensagem de confirmação */}
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md space-y-3 md:space-y-4 animate-fade-in-up px-4"
          >
            <Input
              type="text"
              name="fullName"
              placeholder="Nome completo"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="bg-transparent border-white/30 text-white placeholder:text-white/40 focus:border-white transition-colors h-11 md:h-12 text-sm md:text-base"
            />
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="bg-transparent border-white/30 text-white placeholder:text-white/40 focus:border-white transition-colors h-11 md:h-12 text-sm md:text-base"
            />
            <Input
              type="tel"
              name="phone"
              placeholder="Telefone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="bg-transparent border-white/30 text-white placeholder:text-white/40 focus:border-white transition-colors h-11 md:h-12 text-sm md:text-base"
            />
            <Input
              type="text"
              name="instagram"
              placeholder="@ do Instagram"
              value={formData.instagram}
              onChange={handleChange}
              required
              className="bg-transparent border-white/30 text-white placeholder:text-white/40 focus:border-white transition-colors h-11 md:h-12 text-sm md:text-base"
            />
            <Button
              type="submit"
              disabled={createLeadMutation.isPending}
              className="w-full bg-white text-black hover:bg-white/90 transition-colors tracking-wider font-light h-11 md:h-12 text-sm md:text-base"
            >
              {createLeadMutation.isPending ? "ENVIANDO..." : "ENVIAR"}
            </Button>
          </form>
        ) : (
          <div className="text-center animate-fade-in px-4 max-w-2xl">
            <p className="text-sm md:text-base lg:text-lg tracking-wide leading-relaxed">
              Você está cadastrado e irá receber uma senha pelo seu e-mail dia <span className="font-bold">29/10</span>, que vai te liberar acesso à coleção + até <span className="font-bold">20% de desconto</span> com acesso antecipado dos outros. O Drop será lançado oficialmente dia <span className="font-bold">07/11</span>.
            </p>
          </div>
        )}

        {/* Timer Countdown - só aparece se não tiver enviado o formulário */}
        {!submitted && (
          <div className="mt-6 md:mt-8 text-center px-4">
            <p className="text-xs md:text-sm text-white/50 tracking-wider mb-3 md:mb-4">
              Acesso privado à Coleção em:
            </p>
            <div className="flex gap-3 md:gap-6 justify-center items-center">
              <div className="flex flex-col items-center">
                <span className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-wider" style={{ fontFamily: 'Impact, sans-serif' }}>
                  {String(countdown.days).padStart(2, '0')}
                </span>
                <span className="text-[10px] md:text-xs text-white/40 tracking-widest mt-1">DIAS</span>
              </div>
              <span className="text-2xl md:text-4xl text-white/30">:</span>
              <div className="flex flex-col items-center">
                <span className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-wider" style={{ fontFamily: 'Impact, sans-serif' }}>
                  {String(countdown.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] md:text-xs text-white/40 tracking-widest mt-1">HORAS</span>
              </div>
              <span className="text-2xl md:text-4xl text-white/30">:</span>
              <div className="flex flex-col items-center">
                <span className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-wider" style={{ fontFamily: 'Impact, sans-serif' }}>
                  {String(countdown.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] md:text-xs text-white/40 tracking-widest mt-1">MIN</span>
              </div>
              <span className="text-2xl md:text-4xl text-white/30">:</span>
              <div className="flex flex-col items-center">
                <span className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-wider" style={{ fontFamily: 'Impact, sans-serif' }}>
                  {String(countdown.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] md:text-xs text-white/40 tracking-widest mt-1">SEG</span>
              </div>
            </div>
            <p className="text-xs md:text-sm text-white/50 tracking-wider mt-3 md:mt-4">
              com até 20% off apenas para cadastrados
            </p>
          </div>
        )}
      </div>

      {/* Rodapé */}
      <footer className="fixed bottom-6 right-6 md:bottom-8 md:right-8 text-[10px] md:text-xs text-white/30 tracking-wider">
        © 2025 WBG — We Believe In Ghosts
      </footer>
    </div>
  );
}


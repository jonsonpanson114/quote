"use client";

import { useState, useEffect } from "react";
import { Play, Pause, SkipForward, RefreshCw, Volume2 } from "lucide-react";
import { useQuoteStore } from "@/lib/store";
import { AffirmationPlayer } from "@/lib/audio-player";

const player = typeof window !== 'undefined' ? new AffirmationPlayer() : null;

export default function Home() {
  const { currentQuote, setRandomQuote } = useQuoteStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => console.log('SW registered:', registration),
        (error) => console.error('SW registration failed:', error)
      );
    }
  }, []);

  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      alert('通知が有効になりました。毎日名言が届きます。');
    }
  };

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying || !currentQuote || !player) return;

    setIsLoading(true);
    setIsPlaying(true);
    try {
      await player.playQuote(currentQuote.text, currentQuote.author);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPlaying(false);
      setIsLoading(false);
    }
  };

  const handleShout = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);
    
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  };

  if (!hydrated) return null;

  const [showAdd, setShowAdd] = useState(false);

  return (
    <>
      <main className="glass-container" onClick={handleShout}>
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="shout-ripple"
            style={{ left: ripple.x, top: ripple.y }}
          />
        ))}
        
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
          <button 
            className="btn-circle" 
            style={{ width: '36px', height: '36px', opacity: 0.5 }}
            onClick={(e) => { e.stopPropagation(); setShowAdd(!showAdd); }}
            title="言葉を追加"
          >
            {showAdd ? <Pause size={18} /> : <SkipForward size={18} style={{ transform: 'rotate(90deg)' }} />}
          </button>
          <button 
            className="btn-circle" 
            style={{ width: '36px', height: '36px', opacity: 0.5 }}
            onClick={(e) => { e.stopPropagation(); requestNotificationPermission(); }}
            title="通知を有効にする"
          >
            <Volume2 size={18} />
          </button>
        </div>

        <div className="quote-content" style={{ opacity: isLoading ? 0.3 : 1, transition: 'opacity 0.3s' }}>
          <p className="quote-text">
            {currentQuote?.text || "..."}
          </p>
          <p className="quote-author" style={{ opacity: 0.5 }}>{currentQuote?.author}</p>
        </div>

        <div className="controls" style={{ marginTop: '4rem' }}>
          <button 
            className={`btn-circle ${isLoading ? 'loading' : ''}`}
            onClick={handlePlay}
            disabled={isLoading}
            style={{ width: '80px', height: '80px', background: 'transparent', border: '1px solid var(--card-border)' }}
          >
            {isLoading ? (
              <RefreshCw size={32} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={32} />
            ) : (
              <Play size={32} style={{ marginLeft: '4px' }} />
            )}
          </button>
        </div>
      </main>

      {showAdd && (
        <div className="quote-management" style={{ marginTop: '2rem', width: '90%', maxWidth: '400px', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input 
              type="text" 
              id="new-quote"
              placeholder="新しい言葉..."
              style={{ 
                flex: 1, 
                padding: '0.8rem', 
                borderRadius: '0.5rem', 
                border: 'none', 
                background: 'rgba(255,255,255,0.2)',
                color: 'var(--text-primary)',
                backdropFilter: 'blur(10px)',
                outline: 'none'
              }}
            />
            <button 
              onClick={() => {
                const input = document.getElementById('new-quote') as HTMLInputElement;
                if (input.value) {
                  useQuoteStore.getState().addQuote(input.value, '自分');
                  input.value = '';
                  setShowAdd(false);
                }
              }}
              style={{ padding: '0 1rem', borderRadius: '0.5rem', border: 'none', background: 'var(--text-primary)', color: 'var(--background-start)', cursor: 'pointer' }}
            >
              保存
            </button>
          </div>
        </div>
      )}
    </>
  );
}

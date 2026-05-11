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
        
        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
          <button 
            className="btn-circle" 
            style={{ width: '40px', height: '40px' }}
            onClick={(e) => { e.stopPropagation(); requestNotificationPermission(); }}
            title="通知を有効にする"
          >
            <Volume2 size={20} />
          </button>
        </div>

        <div className="quote-content">
          <p className="quote-text">
            {currentQuote?.text || "名言を読み込み中..."}
          </p>
          <p className="quote-author">— {currentQuote?.author || "..."}</p>
        </div>

        <div className="controls">
          <button 
            className="btn-circle" 
            onClick={(e) => {
              e.stopPropagation();
              setRandomQuote();
            }}
            title="シャッフル"
          >
            <RefreshCw size={24} />
          </button>
          <button 
            className={`btn-circle ${isLoading ? 'loading' : ''}`}
            onClick={handlePlay}
            disabled={isLoading}
            title={isPlaying ? "再生中" : "再生"}
          >
            {isLoading ? (
              <RefreshCw size={28} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={28} />
            ) : (
              <Play size={28} fill="currentColor" />
            )}
          </button>
          <button className="btn-circle" title="次へ">
            <SkipForward size={24} />
          </button>
        </div>

        <div style={{ marginTop: '1.5rem', opacity: 0.6, fontSize: '0.8rem' }}>
          <Volume2 size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
          Google AI Voice: Neural2-C
        </div>
      </main>

      <div className="quote-management" style={{ marginTop: '3rem', width: '90%', maxWidth: '500px' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', opacity: 0.8, color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>自分の名言を追加</h2>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input 
            type="text" 
            id="new-quote"
            placeholder="ここに名言を入力..."
            style={{ 
              flex: 1, 
              padding: '1rem', 
              borderRadius: '1rem', 
              border: '1px solid var(--card-border)', 
              background: 'var(--card-bg)',
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
                alert('名言リストに追加しました！');
              }
            }}
            style={{ 
              padding: '0 1.5rem', 
              borderRadius: '1rem', 
              border: 'none', 
              background: 'var(--accent-soft)', 
              color: 'white',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            追加
          </button>
        </div>
      </div>
    </>
  );
}

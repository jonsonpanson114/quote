import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Quote {
  id: string;
  text: string;
  author: string;
  isCustom: boolean; // ユーザーが追加したものは true
}

interface QuoteState {
  quotes: Quote[];
  currentQuote: Quote | null;
  addQuote: (text: string, author: string) => void;
  removeQuote: (id: string) => void;
  setRandomQuote: () => void;
}

const defaultQuotes: Quote[] = [
  { id: '1', text: '人生における最大の栄光は、決して倒れないことではなく、倒れるたびに起き上がることにある。', author: 'ネルソン・マンデラ', isCustom: false },
  { id: '2', text: 'もし今日が人生最後の日だとしたら、今からやろうとしていることを本当にやりたいと思うだろうか？', author: 'スティーブ・ジョブズ', isCustom: false },
  { id: '3', text: '夢は逃げない。逃げるのはいつも自分だ。', author: '高橋歩', isCustom: false },
];

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      quotes: defaultQuotes,
      currentQuote: defaultQuotes[0],
      addQuote: (text, author) => {
        const newQuote: Quote = {
          id: Date.now().toString(),
          text,
          author,
          isCustom: true,
        };
        set((state) => ({ quotes: [...state.quotes, newQuote] }));
      },
      removeQuote: (id) => {
        set((state) => ({ quotes: state.quotes.filter((q) => q.id !== id) }));
      },
      setRandomQuote: () => {
        const { quotes } = get();
        if (quotes.length === 0) return;
        const randomIndex = Math.floor(Math.random() * quotes.length);
        set({ currentQuote: quotes[randomIndex] });
      },
    }),
    {
      name: 'quote-storage',
    }
  )
);

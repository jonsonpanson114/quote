export async function fetchAudio(text: string): Promise<string | null> {
  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.audioContent;
  } catch (error) {
    console.error('Fetch Audio Error:', error);
    return null;
  }
}

export async function fetchDJMessage(quote: string, author: string, type: 'intro' | 'outro'): Promise<string | null> {
  try {
    const res = await fetch('/api/llm', {
      method: 'POST',
      body: JSON.stringify({ quote, author, type }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.text;
  } catch (error) {
    console.error('Fetch DJ Message Error:', error);
    return null;
  }
}

export class AffirmationPlayer {
  private audioContext: AudioContext | null = null;

  async playQuote(text: string, author: string) {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    // 1. Fetch DJ Intro
    const introText = await fetchDJMessage(text, author, 'intro');
    if (introText) {
      await this.playText(introText);
    }

    // 2. Fetch and Play Quote
    await this.playText(`「${text}」。${author}。`);

    // 3. Fetch DJ Outro
    const outroText = await fetchDJMessage(text, author, 'outro');
    if (outroText) {
      await this.playText(outroText);
    }
  }

  private async playText(text: string) {
    const audioContent = await fetchAudio(text);
    if (!audioContent) return;

    const binaryString = atob(audioContent);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const buffer = await this.audioContext!.decodeAudioData(bytes.buffer);
    
    const source = this.audioContext!.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext!.destination);
    
    return new Promise((resolve) => {
      source.onended = resolve;
      source.start(0);
    });
  }
}

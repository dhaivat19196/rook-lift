export interface ToastMsg {
  id: number;
  text: string;
  kind: 'xp' | 'info' | 'badge';
}

type Fn = (t: ToastMsg) => void;
const subs = new Set<Fn>();
let n = 0;

export function subscribeToasts(fn: Fn): () => void {
  subs.add(fn);
  return () => {
    subs.delete(fn);
  };
}

export function toast(text: string, kind: ToastMsg['kind'] = 'info') {
  const t = { id: ++n, text, kind };
  subs.forEach((f) => f(t));
}

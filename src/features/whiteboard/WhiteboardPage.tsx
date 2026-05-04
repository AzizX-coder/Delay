import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
import { useSettingsStore } from "@/stores/settingsStore";

export function WhiteboardPage() {
  const { theme } = useSettingsStore();
  
  return (
    <div className="w-full h-full relative" style={{ zIndex: 0 }}>
      <Tldraw 
        persistenceKey="delay-tldraw-v1"
        autoFocus
      />
    </div>
  );
}

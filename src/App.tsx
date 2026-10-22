import { ExperienceProvider } from '@/state/ExperienceContext';
import { OpeningSequenceProvider } from '@/state/OpeningSequenceContext';
import { ExperienceCanvas } from '@/scenes/ExperienceCanvas';
import { StageOverlay } from '@/components/StageOverlay';
import { ExperienceControls } from '@/components/ExperienceControls';
import { FallbackBackground } from '@/components/FallbackBackground';
import { CanvasErrorBoundary } from '@/components/CanvasErrorBoundary';
import { useWebGLSupport } from '@/hooks/useEnvironment';

export default function App() {
  const webglSupported = useWebGLSupport();

  return (
    <ExperienceProvider>
      <OpeningSequenceProvider>
        <div className="app">
          <div className="app__scene">
            {webglSupported ? (
              <CanvasErrorBoundary fallback={<FallbackBackground />}>
                <ExperienceCanvas />
              </CanvasErrorBoundary>
            ) : (
              <FallbackBackground />
            )}
          </div>

          <ExperienceControls />

          <main className="app__overlay" id="main">
            <StageOverlay />
          </main>
        </div>
      </OpeningSequenceProvider>
    </ExperienceProvider>
  );
}

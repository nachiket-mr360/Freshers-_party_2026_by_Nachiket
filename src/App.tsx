import { ExperienceProvider } from '@/state/ExperienceContext';
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
      <div className="app">
        {/* Layer 1: the immersive world (WebGL or CSS fallback). */}
        <div className="app__scene">
          {webglSupported ? (
            <CanvasErrorBoundary fallback={<FallbackBackground />}>
              <ExperienceCanvas />
            </CanvasErrorBoundary>
          ) : (
            <FallbackBackground />
          )}
        </div>

        {/* Layer 2: discreet journey chrome. */}
        <ExperienceControls />

        {/* Layer 3: all content as accessible HTML. */}
        <main className="app__overlay" id="main">
          <StageOverlay />
        </main>
      </div>
    </ExperienceProvider>
  );
}

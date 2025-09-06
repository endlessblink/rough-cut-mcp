import { Composition } from "remotion";
import EnhancedOrbsTest from "./VideoComposition";

export const VideoComposition: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoComposition"
        component={EnhancedOrbsTest}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
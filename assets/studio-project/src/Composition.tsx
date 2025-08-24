import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';

interface CompositionProps {
  title: string;
  subtitle: string;
}

export const MyComposition: React.FC<CompositionProps> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  
  // Fade in animation
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateRight: 'clamp',
  });
  
  // Scale animation
  const scale = interpolate(frame, [0, 30], [0.8, 1], {
    extrapolateRight: 'clamp',
  });
  
  return (
    <AbsoluteFill 
      style={{ 
        backgroundColor: '#1a1a1a', 
        color: 'white', 
        justifyContent: 'center', 
        alignItems: 'center' 
      }}
    >
      <div 
        style={{ 
          opacity, 
          transform: `scale(${scale})`,
          textAlign: 'center'
        }}
      >
        <h1 style={{ fontSize: 80, margin: 0 }}>{title}</h1>
        <p style={{ fontSize: 40, marginTop: 20 }}>{subtitle}</p>
      </div>
    </AbsoluteFill>
  );
};
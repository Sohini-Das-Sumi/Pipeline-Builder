import { PipelineUI } from './ui.jsx';
import { SubmitButton } from './submit.jsx';
import ThreeBackground from './ThreeBackground.jsx';
import { useStore } from './store';

function App() {
  console.log('App rendering');
  
  // Get theme from store
  const theme = useStore((state) => state.theme);
  
  // Dynamic background color based on theme
  const backgroundColor = theme === 'dark' ? '#000000' : '#ffffff';
  
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', backgroundColor: backgroundColor }}>
      <ThreeBackground theme={theme} />
      <PipelineUI />
      <SubmitButton />
    </div>
  );
}

export default App;

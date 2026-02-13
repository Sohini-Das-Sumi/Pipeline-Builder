import { PipelineUI } from './ui.jsx';
import { SubmitButton } from './submit.jsx';
import ThreeBackground from './ThreeBackground.jsx';

function App() {
  console.log('App rendering');
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', backgroundColor: '#000000' }}>
      <ThreeBackground />
      <PipelineUI />
      <SubmitButton />
    </div>
  );
}

export default App;

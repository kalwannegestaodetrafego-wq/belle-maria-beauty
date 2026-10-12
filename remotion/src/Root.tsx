import { Composition } from 'remotion';
import { MainVideo } from './MainVideo';
import { VIDEO } from './timing';

export const RemotionRoot = () => <Composition id={VIDEO.id} component={MainVideo} durationInFrames={VIDEO.durationInFrames} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />;
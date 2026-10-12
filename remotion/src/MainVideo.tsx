import { AbsoluteFill, Audio, staticFile } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { PersistentBackground } from './components/PersistentBackground';
import { PersistentAccents } from './components/PersistentAccents';
import { Scene1 } from './scenes/Scene1';
import { Scene2 } from './scenes/Scene2';
import { Scene3 } from './scenes/Scene3';
import { Scene4 } from './scenes/Scene4';
import { Scene5 } from './scenes/Scene5';
import { sequenceDuration, TRANSITION_FRAMES } from './timing';

const scenes = [Scene1, Scene2, Scene3, Scene4, Scene5];
export const MainVideo = () => <AbsoluteFill><PersistentBackground /><Audio src={staticFile('audio/voiceover.mp3')} /><TransitionSeries>{scenes.flatMap((Component, index) => [
  ...(index > 0 ? [<TransitionSeries.Transition key={`transition-${index}`} presentation={fade()} timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })} />] : []),
  <TransitionSeries.Sequence key={`scene-${index}`} durationInFrames={sequenceDuration(index)}><Component /></TransitionSeries.Sequence>,
])}</TransitionSeries><PersistentAccents /></AbsoluteFill>;
// FIX(audit-3-F): encode all selected OBS source settings in a stable URL contract.
export function buildObsSourceUrl(origin: string, background: string, resolution: string): string {
  const params = new URLSearchParams({ obs: 'true', bg: background, resolution });
  return origin + '/?' + params.toString();
}

export type AvatarExpression = 'neutral' | 'happy' | 'surprised' | 'smirk' | 'wink' | 'focused';
export type AvatarGesture = 'idle' | 'wave' | 'nod' | 'think' | 'shrug' | 'point' | 'cheer';

export interface WebcamTrackingMetrics {
  headPitch: number; // -30 to +30 degrees
  headYaw: number;   // -45 to +45 degrees
  headRoll: number;  // -20 to +20 degrees
  leftEyeBlink: boolean;
  rightEyeBlink: boolean;
  mouthOpen: number; // 0.0 (closed) to 1.0 (wide)
  smileScore: number;// 0.0 to 1.0
  activeExpression: AvatarExpression;
}

export interface AudioMotionSignal {
  volumePercent: number; // 0 to 100
  pitchHz: number;
  isSpeaking: boolean;
  activeGesture: AvatarGesture;
  energyLevel: 'low' | 'moderate' | 'high';
}

export interface CoHostInteraction {
  id: string;
  sender: string;
  question: string;
  response: string;
  expression: AvatarExpression;
  gesture: AvatarGesture;
  timestamp: string;
}

export function detectFacialExpression(smile: number, mouthOpen: number, leftBlink: boolean, rightBlink: boolean): AvatarExpression {
  if (leftBlink && !rightBlink) return 'wink';
  if (rightBlink && !leftBlink) return 'wink';
  if (mouthOpen > 0.65) return 'surprised';
  if (smile > 0.5) return 'happy';
  if (smile > 0.3 && mouthOpen < 0.2) return 'smirk';
  return 'neutral';
}

export function analyzeAudioMotion(volumePercent: number, pitchHz: number): AudioMotionSignal {
  const isSpeaking = volumePercent > 18;
  let energyLevel: 'low' | 'moderate' | 'high' = 'low';
  let activeGesture: AvatarGesture = 'idle';

  if (volumePercent > 65) {
    energyLevel = 'high';
    activeGesture = 'cheer';
  } else if (volumePercent > 35) {
    energyLevel = 'moderate';
    activeGesture = pitchHz > 250 ? 'point' : 'nod';
  } else if (isSpeaking) {
    energyLevel = 'low';
    activeGesture = 'think';
  }

  return {
    volumePercent: Math.min(Math.max(volumePercent, 0), 100),
    pitchHz: Math.max(pitchHz, 0),
    isSpeaking,
    activeGesture,
    energyLevel,
  };
}

export function generateCoHostReply(question: string, characterName: string): CoHostInteraction {
  const lower = question.toLowerCase();
  let response = `Thanks for asking, chat! That's a great question about our 3D avatar setup.`;
  let expression: AvatarExpression = 'happy';
  let gesture: AvatarGesture = 'wave';

  if (lower.includes('power') || lower.includes('ability') || lower.includes('fight')) {
    response = `My combat system specializes in ultra-speed kinetic strikes and neon particle overdrive!`;
    expression = 'smirk';
    gesture = 'point';
  } else if (lower.includes('how') || lower.includes('why') || lower.includes('explain') || lower.includes('vrm')) {
    response = `We use humanoid bone rigging and glTF extensions to translate webcam blendshapes directly to 3D mesh morph targets!`;
    expression = 'focused';
    gesture = 'think';
  } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    response = `Konnichiwa! Welcome to our AuraCraft interactive broadcast session!`;
    expression = 'happy';
    gesture = 'wave';
  } else if (lower.includes('wow') || lower.includes('cool') || lower.includes('amazing')) {
    response = `Arigatou! The energy in the chat today is absolutely electric!`;
    expression = 'surprised';
    gesture = 'cheer';
  }

  return {
    id: `cohost_${Date.now()}`,
    sender: 'Chat Audience',
    question,
    response: `${characterName}: "${response}"`,
    expression,
    gesture,
    timestamp: new Date().toLocaleTimeString(),
  };
}

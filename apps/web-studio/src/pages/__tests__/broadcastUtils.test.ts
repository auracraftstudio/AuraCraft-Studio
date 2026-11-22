import { describe, expect, it } from 'vitest';
import {
  buildObsSourceUrl,
  detectFacialExpression,
  analyzeAudioMotion,
  generateCoHostReply,
} from '../broadcastUtils';

describe('OBS source URL', () => {
  it('includes selected background and resolution', () => {
    const url = new URL(buildObsSourceUrl('https://studio.example.com', 'greenscreen', '720p'));
    expect(url.searchParams.get('obs')).toBe('true');
    expect(url.searchParams.get('bg')).toBe('greenscreen');
    expect(url.searchParams.get('resolution')).toBe('720p');
  });
});

describe('Facial expression detection', () => {
  it('detects smiling as happy', () => {
    expect(detectFacialExpression(0.8, 0.1, false, false)).toBe('happy');
  });

  it('detects one-eye blink as wink', () => {
    expect(detectFacialExpression(0.2, 0.1, true, false)).toBe('wink');
  });

  it('detects wide mouth open as surprised', () => {
    expect(detectFacialExpression(0.1, 0.75, false, false)).toBe('surprised');
  });

  it('detects neutral state when metrics are low', () => {
    expect(detectFacialExpression(0.1, 0.1, false, false)).toBe('neutral');
  });
});

describe('Audio-driven motion and gestures', () => {
  it('triggers idle state on silence', () => {
    const signal = analyzeAudioMotion(10, 100);
    expect(signal.isSpeaking).toBe(false);
    expect(signal.activeGesture).toBe('idle');
  });

  it('triggers cheer on high energy shouting', () => {
    const signal = analyzeAudioMotion(80, 220);
    expect(signal.isSpeaking).toBe(true);
    expect(signal.energyLevel).toBe('high');
    expect(signal.activeGesture).toBe('cheer');
  });

  it('triggers point or nod on moderate volume', () => {
    const signal = analyzeAudioMotion(45, 300);
    expect(signal.isSpeaking).toBe(true);
    expect(signal.activeGesture).toBe('point');
  });
});

describe('Virtual co-host reply engine', () => {
  it('generates interactive reply with matching expression and gesture', () => {
    const reply = generateCoHostReply('Can you explain how VRM models work?', 'Kenshiro');
    expect(reply.response).toContain('Kenshiro: "');
    expect(reply.expression).toBe('focused');
    expect(reply.gesture).toBe('think');
  });
});

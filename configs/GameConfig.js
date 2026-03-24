export const GAME_CONFIG = {
  lanes: {
    laneCount: 4,
    laneWidthRatio: 0.8,
    laneHeightHighRatio: 0.9,
    laneHeightLowRatio: 0.91,
    playZoneWidthRatio: 0.8,
    playZoneTopRatio: 0.3,
    laneAlternateOffset: 20
  },

  clouds: {
    cloudOffsetY: -10,
    cloudScale: 1.3,
    cloudAlternateOffset: 12,
    scaleAnimation: {
      duration: 0.5,
      scaleUp: 1.1
    }
  },

  player: {
    maxTiltAngle: 10,
    tiltSpeedAmplitude: 0.05,
    tiltSmoothness: 10,
    globalSpeedMultiplier: 2.5,
    idleAmplitude: 10,
    idleFrequency: 1,
    idleSmoothness: 3,
    yRatio: 0.79
  },

  spawning: {
    interval: 0.8,
    fallDuration: 4,
    coinChance: 10,
  },

  coins: {
    bgWidthRatio: 0.5,
    coinSizeRatio: 0.6,
    bgSrc: { x: 217, y: 798, w: 111, h: 111 }
  },

  letters: {
    fontName: 'font',
    fontSize: 0.6,
    color: '#ffffff',
    hideAnimation: {
      duration: 1.0,
      moveDown: 50
    },
    flyAnimation: {
      duration: 0.3
    }
  },

  difficulty: {
    correctLetterProbability: 0.5,
    minCorrectLetterProbability: 0.1,
    dropStep: 0.05
  }
};

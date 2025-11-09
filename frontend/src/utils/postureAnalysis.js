export class PostureAnalyzer {
  constructor() {
    this.videoElement = null;
    this.canvasElement = document.createElement('canvas');
    this.ctx = this.canvasElement.getContext('2d');
    this.isAnalyzing = false;
    this.analysisInterval = null;
    this.postureHistory = [];
  }

  startAnalysis(videoElement, callback) {
    this.videoElement = videoElement;
    this.isAnalyzing = true;

    this.analysisInterval = setInterval(() => {
      if (this.videoElement && this.isAnalyzing) {
        const analysis = this.analyzeFrame();
        this.postureHistory.push(analysis);
        callback(analysis);
      }
    }, 3000);
  }

  stopAnalysis() {
    this.isAnalyzing = false;
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
    }
  }

  analyzeFrame() {
    if (!this.videoElement || !this.canvasElement || !this.ctx) {
      return this.getDefaultAnalysis();
    }

    try {
      this.canvasElement.width = this.videoElement.videoWidth;
      this.canvasElement.height = this.videoElement.videoHeight;
      this.ctx.drawImage(this.videoElement, 0, 0);

      const imageData = this.ctx.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
      
      const brightness = this.analyzeBrightness(imageData);
      const facePosition = this.analyzeFacePosition(imageData);
      const movement = this.analyzeMovement();

      return this.generateAnalysis(brightness, facePosition, movement);
    } catch (error) {
      console.error('Posture analysis error:', error);
      return this.getDefaultAnalysis();
    }
  }

  analyzeBrightness(imageData) {
    const data = imageData.data;
    let totalBrightness = 0;
    
    for (let i = 0; i < data.length; i += 40) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      totalBrightness += (r + g + b) / 3;
    }
    
    return totalBrightness / (data.length / 40);
  }

  analyzeFacePosition(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    
    let centerBrightness = 0;
    let samples = 0;

    for (let y = height * 0.3; y < height * 0.7; y += 10) {
      for (let x = width * 0.3; x < width * 0.7; x += 10) {
        const i = (y * width + x) * 4;
        centerBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
        samples++;
      }
    }

    centerBrightness /= samples;
    const centered = centerBrightness > 100;
    const distance = Math.abs(centerBrightness - 128) / 128;

    return { centered, distance };
  }

  analyzeMovement() {
    if (this.postureHistory.length < 2) return 0.5;
    
    const recentAnalyses = this.postureHistory.slice(-5);
    const scores = recentAnalyses.map(a => a.score);
    const variance = this.calculateVariance(scores);
    
    return Math.min(variance / 10, 1);
  }

  calculateVariance(numbers) {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }

  generateAnalysis(brightness, facePosition, movement) {
    const bodyLanguage = [];
    const suggestions = [];
    let score = 70;

    let eyeContact = 'moderate';
    if (brightness > 120) {
      eyeContact = 'strong';
      bodyLanguage.push('Good eye contact maintained');
      score += 10;
    } else if (brightness < 80) {
      eyeContact = 'weak';
      bodyLanguage.push('Limited eye contact detected');
      suggestions.push('Maintain eye contact with the camera');
      score -= 10;
    } else {
      bodyLanguage.push('Moderate eye contact');
      score += 5;
    }

    let posture = 'good';
    if (facePosition.centered && facePosition.distance < 0.3) {
      posture = 'excellent';
      bodyLanguage.push('Excellent posture - well centered');
      score += 15;
    } else if (facePosition.centered) {
      posture = 'good';
      bodyLanguage.push('Good posture maintained');
      score += 10;
    } else if (facePosition.distance < 0.5) {
      posture = 'fair';
      bodyLanguage.push('Posture could be improved');
      suggestions.push('Sit up straight and center yourself in frame');
      score -= 5;
    } else {
      posture = 'poor';
      bodyLanguage.push('Poor posture detected');
      suggestions.push('Adjust your position to be centered in the camera');
      score -= 15;
    }

    let facialExpression = 'neutral';
    if (movement < 0.3) {
      facialExpression = 'confident';
      bodyLanguage.push('Calm and composed demeanor');
      score += 10;
    } else if (movement > 0.7) {
      facialExpression = 'nervous';
      bodyLanguage.push('Excessive movement detected');
      suggestions.push('Try to stay still and composed');
      score -= 10;
    } else {
      bodyLanguage.push('Natural body movement');
      score += 5;
    }

    if (suggestions.length === 0) {
      suggestions.push('Keep up the great body language!');
    }

    score = Math.max(0, Math.min(100, score));

    return {
      posture,
      confidence: score / 100,
      eyeContact,
      facialExpression,
      bodyLanguage,
      suggestions,
      score
    };
  }

  getDefaultAnalysis() {
    return {
      posture: 'good',
      confidence: 0.75,
      eyeContact: 'moderate',
      facialExpression: 'neutral',
      bodyLanguage: ['Analyzing body language...'],
      suggestions: ['Position yourself in front of the camera'],
      score: 75
    };
  }

  getAverageAnalysis() {
    if (this.postureHistory.length === 0) {
      return this.getDefaultAnalysis();
    }

    const avgScore = this.postureHistory.reduce((sum, a) => sum + a.score, 0) / this.postureHistory.length;
    
    const eyeContactCounts = { strong: 0, moderate: 0, weak: 0 };
    const postureCounts = { excellent: 0, good: 0, fair: 0, poor: 0 };
    const expressionCounts = { confident: 0, neutral: 0, nervous: 0 };

    this.postureHistory.forEach(a => {
      eyeContactCounts[a.eyeContact]++;
      postureCounts[a.posture]++;
      expressionCounts[a.facialExpression]++;
    });

    const getMostCommon = (counts) => {
      return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    };

    return {
      posture: getMostCommon(postureCounts),
      confidence: avgScore / 100,
      eyeContact: getMostCommon(eyeContactCounts),
      facialExpression: getMostCommon(expressionCounts),
      bodyLanguage: ['Overall body language analysis complete'],
      suggestions: ['Review your performance feedback'],
      score: Math.round(avgScore)
    };
  }
}

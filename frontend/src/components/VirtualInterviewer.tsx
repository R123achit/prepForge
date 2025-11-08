import { useEffect, useRef, useState } from 'react';

interface VirtualInterviewerProps {
  isSpeaking: boolean;
  gender?: 'male' | 'female';
}

export default function VirtualInterviewer({ isSpeaking, gender = 'female' }: VirtualInterviewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mouthOpen, setMouthOpen] = useState(0);
  const [eyesClosed, setEyesClosed] = useState(false);
  const [headTilt, setHeadTilt] = useState(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawInterviewer = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Professional gradient background with subtle animation
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1e3a8a');
      gradient.addColorStop(0.5, '#2563eb');
      gradient.addColorStop(1, '#3b82f6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add subtle office background elements
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(50, 100, 80, 120);
      ctx.fillRect(370, 100, 80, 120);

      // Save context for head tilt
      ctx.save();
      ctx.translate(250, 200);
      ctx.rotate(headTilt * 0.02);
      ctx.translate(-250, -200);

      // Head with better skin tone and shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 15;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
      
      ctx.fillStyle = gender === 'female' ? '#ffd7ba' : '#e8b896';
      ctx.beginPath();
      ctx.ellipse(250, 200, 90, 110, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Professional hairstyle with more detail
      ctx.fillStyle = gender === 'female' ? '#4a2c2a' : '#3d2817';
      ctx.beginPath();
      if (gender === 'female') {
        // Female: Long professional hair
        ctx.ellipse(250, 150, 100, 80, 0, 0, Math.PI * 2);
        ctx.ellipse(180, 180, 40, 60, -0.3, 0, Math.PI * 2);
        ctx.ellipse(320, 180, 40, 60, 0.3, 0, Math.PI * 2);
        // Hair highlights
        ctx.fillStyle = 'rgba(139, 69, 19, 0.3)';
        ctx.ellipse(230, 140, 30, 20, -0.2, 0, Math.PI * 2);
      } else {
        // Male: Short professional cut
        ctx.ellipse(250, 140, 95, 60, 0, 0, Math.PI);
        ctx.fillRect(160, 140, 180, 30);
      }
      ctx.fill();

      // Eyes with realistic blinking
      if (!eyesClosed) {
        // Eye whites
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(220, 190, 18, 22, 0, 0, Math.PI * 2);
        ctx.ellipse(280, 190, 18, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Iris (colored part)
        ctx.fillStyle = gender === 'female' ? '#4a90e2' : '#8b4513';
        ctx.beginPath();
        ctx.arc(220, 195, 12, 0, Math.PI * 2);
        ctx.arc(280, 195, 12, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(220, 195, 8, 0, Math.PI * 2);
        ctx.arc(280, 195, 8, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine (multiple highlights for realism)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(223, 192, 4, 0, Math.PI * 2);
        ctx.arc(283, 192, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(218, 197, 2, 0, Math.PI * 2);
        ctx.arc(278, 197, 2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Closed eyes (blinking)
        ctx.strokeStyle = '#3d2817';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(202, 190);
        ctx.quadraticCurveTo(220, 195, 238, 190);
        ctx.moveTo(262, 190);
        ctx.quadraticCurveTo(280, 195, 298, 190);
        ctx.stroke();
      }

      // Eyebrows with expression
      ctx.strokeStyle = '#3d2817';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      const browLift = isSpeaking ? -2 : 0;
      ctx.moveTo(200, 170 + browLift);
      ctx.quadraticCurveTo(220, 165 + browLift, 240, 170 + browLift);
      ctx.moveTo(260, 170 + browLift);
      ctx.quadraticCurveTo(280, 165 + browLift, 300, 170 + browLift);
      ctx.stroke();

      // Nose with shading
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(250, 200);
      ctx.lineTo(250, 225);
      ctx.moveTo(250, 225);
      ctx.lineTo(245, 230);
      ctx.moveTo(250, 225);
      ctx.lineTo(255, 230);
      ctx.stroke();
      
      // Nose shadow
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.ellipse(248, 228, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Enhanced mouth with realistic lip-sync
      if (isSpeaking) {
        const openAmount = mouthOpen;
        
        // Mouth opening
        ctx.fillStyle = '#8b4545';
        ctx.beginPath();
        ctx.ellipse(250, 252, 32, 12 + openAmount, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Upper lip
        ctx.fillStyle = '#d4756e';
        ctx.beginPath();
        ctx.ellipse(250, 248, 32, 6, 0, 0, Math.PI);
        ctx.fill();
        
        // Lower lip
        ctx.beginPath();
        ctx.ellipse(250, 256 + openAmount * 0.5, 32, 6, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        
        // Teeth when mouth is open enough
        if (openAmount > 5) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(230, 248, 40, 6);
          // Tooth separation lines
          ctx.strokeStyle = 'rgba(0,0,0,0.1)';
          ctx.lineWidth = 1;
          for (let i = 0; i < 4; i++) {
            ctx.beginPath();
            ctx.moveTo(235 + i * 10, 248);
            ctx.lineTo(235 + i * 10, 254);
            ctx.stroke();
          }
        }
        
        // Tongue (visible when speaking)
        if (openAmount > 8) {
          ctx.fillStyle = '#ff6b9d';
          ctx.beginPath();
          ctx.ellipse(250, 258, 20, 8, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // Neutral smile
        ctx.fillStyle = '#d4756e';
        ctx.beginPath();
        ctx.moveTo(225, 250);
        ctx.quadraticCurveTo(250, 262, 275, 250);
        ctx.quadraticCurveTo(250, 256, 225, 250);
        ctx.fill();
        
        // Lip highlight
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(230, 248);
        ctx.quadraticCurveTo(250, 252, 270, 248);
        ctx.stroke();
      }

      // Neck with shadow
      ctx.fillStyle = gender === 'female' ? '#ffd7ba' : '#e8b896';
      ctx.fillRect(225, 300, 50, 40);
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(225, 300, 50, 5);

      // Professional attire with more detail
      ctx.fillStyle = gender === 'female' ? '#dc2626' : '#1e40af';
      ctx.beginPath();
      ctx.moveTo(150, 340);
      ctx.lineTo(225, 310);
      ctx.lineTo(275, 310);
      ctx.lineTo(350, 340);
      ctx.lineTo(350, 500);
      ctx.lineTo(150, 500);
      ctx.closePath();
      ctx.fill();
      
      // Suit shading
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.moveTo(150, 340);
      ctx.lineTo(180, 360);
      ctx.lineTo(180, 500);
      ctx.lineTo(150, 500);
      ctx.closePath();
      ctx.fill();

      // White collar with detail
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(225, 310);
      ctx.lineTo(235, 330);
      ctx.lineTo(250, 320);
      ctx.lineTo(265, 330);
      ctx.lineTo(275, 310);
      ctx.closePath();
      ctx.fill();
      
      // Collar shadow
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Tie (for male) or necklace (for female)
      if (gender === 'male') {
        ctx.fillStyle = '#7c2d12';
        ctx.beginPath();
        ctx.moveTo(250, 320);
        ctx.lineTo(245, 380);
        ctx.lineTo(255, 380);
        ctx.closePath();
        ctx.fill();
        
        // Tie knot
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.moveTo(245, 320);
        ctx.lineTo(250, 330);
        ctx.lineTo(255, 320);
        ctx.closePath();
        ctx.fill();
      } else {
        // Simple necklace
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(250, 315, 25, 0.3, Math.PI - 0.3);
        ctx.stroke();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(250, 330, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Professional badge
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(215, 370, 70, 28);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.strokeRect(215, 370, 70, 28);
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('AI EXPERT', 250, 389);

      // Glasses for male
      if (gender === 'male') {
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(220, 190, 22, 0, Math.PI * 2);
        ctx.arc(280, 190, 22, 0, Math.PI * 2);
        ctx.moveTo(242, 190);
        ctx.lineTo(258, 190);
        ctx.moveTo(198, 188);
        ctx.lineTo(180, 185);
        ctx.moveTo(302, 188);
        ctx.lineTo(320, 185);
        ctx.stroke();
        
        // Glasses reflection
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(215, 185, 8, 0.5, 2);
        ctx.arc(275, 185, 8, 0.5, 2);
        ctx.stroke();
      }

      ctx.restore();
    };

    drawInterviewer();
  }, [isSpeaking, mouthOpen, eyesClosed, headTilt, gender]);

  // Enhanced lip-sync animation
  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(0);
      return;
    }

    const interval = setInterval(() => {
      setMouthOpen(prev => {
        // More natural mouth movement with phoneme-like patterns
        const target = Math.random() * 18;
        const speed = 0.4;
        return prev + (target - prev) * speed;
      });
    }, 60); // Faster updates for smoother animation

    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Realistic blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyesClosed(true);
      setTimeout(() => setEyesClosed(false), 150);
    }, 3000 + Math.random() * 2000); // Random blink every 3-5 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  // Subtle head movement
  useEffect(() => {
    const headInterval = setInterval(() => {
      setHeadTilt(prev => {
        const target = (Math.random() - 0.5) * 3;
        return prev + (target - prev) * 0.1;
      });
    }, 100);

    return () => clearInterval(headInterval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="max-w-full max-h-full object-contain"
      />
      {isSpeaking && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg animate-pulse flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          Speaking...
        </div>
      )}
      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>AI Interviewer Active</span>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';

export default function VirtualInterviewer({ isSpeaking, gender = 'female' }) {
  const canvasRef = useRef(null);
  const [mouthOpen, setMouthOpen] = useState(0);
  const [eyesClosed, setEyesClosed] = useState(false);
  const [headTilt, setHeadTilt] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawInterviewer = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(0.5, '#764ba2');
      gradient.addColorStop(1, '#f093fb');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.arc(100, 150, 80, 0, Math.PI * 2);
      ctx.arc(400, 200, 100, 0, Math.PI * 2);
      ctx.arc(450, 400, 60, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(250, 200);
      ctx.rotate(headTilt * 0.02);
      ctx.translate(-250, -200);

      ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
      ctx.shadowBlur = 20;
      
      ctx.fillStyle = gender === 'female' ? '#ffd7ba' : '#e8b896';
      ctx.beginPath();
      ctx.ellipse(250, 200, 90, 110, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = gender === 'female' ? '#4a2c2a' : '#3d2817';
      ctx.beginPath();
      if (gender === 'female') {
        ctx.ellipse(250, 150, 100, 80, 0, 0, Math.PI * 2);
        ctx.ellipse(180, 180, 40, 60, -0.3, 0, Math.PI * 2);
        ctx.ellipse(320, 180, 40, 60, 0.3, 0, Math.PI * 2);
      } else {
        ctx.ellipse(250, 140, 95, 60, 0, 0, Math.PI);
        ctx.fillRect(160, 140, 180, 30);
      }
      ctx.fill();

      if (!eyesClosed) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(220, 190, 18, 22, 0, 0, Math.PI * 2);
        ctx.ellipse(280, 190, 18, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = gender === 'female' ? '#4a90e2' : '#8b4513';
        ctx.beginPath();
        ctx.arc(220, 195, 12, 0, Math.PI * 2);
        ctx.arc(280, 195, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(220, 195, 8, 0, Math.PI * 2);
        ctx.arc(280, 195, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(223, 192, 4, 0, Math.PI * 2);
        ctx.arc(283, 192, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
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

      if (isSpeaking) {
        const openAmount = mouthOpen;
        
        ctx.fillStyle = '#8b4545';
        ctx.beginPath();
        ctx.ellipse(250, 252, 32, 12 + openAmount, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#d4756e';
        ctx.beginPath();
        ctx.ellipse(250, 248, 32, 6, 0, 0, Math.PI);
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(250, 256 + openAmount * 0.5, 32, 6, 0, Math.PI, Math.PI * 2);
        ctx.fill();
        
        if (openAmount > 5) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(230, 248, 40, 6);
        }
        
        if (openAmount > 8) {
          ctx.fillStyle = '#ff6b9d';
          ctx.beginPath();
          ctx.ellipse(250, 258, 20, 8, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        ctx.fillStyle = '#d4756e';
        ctx.beginPath();
        ctx.moveTo(225, 250);
        ctx.quadraticCurveTo(250, 262, 275, 250);
        ctx.quadraticCurveTo(250, 256, 225, 250);
        ctx.fill();
      }

      ctx.fillStyle = gender === 'female' ? '#ffd7ba' : '#e8b896';
      ctx.fillRect(225, 300, 50, 40);

      const suitGradient = ctx.createLinearGradient(150, 340, 350, 500);
      suitGradient.addColorStop(0, gender === 'female' ? '#dc2626' : '#1e40af');
      suitGradient.addColorStop(1, gender === 'female' ? '#991b1b' : '#1e3a8a');
      ctx.fillStyle = suitGradient;
      ctx.beginPath();
      ctx.moveTo(150, 340);
      ctx.lineTo(225, 310);
      ctx.lineTo(275, 310);
      ctx.lineTo(350, 340);
      ctx.lineTo(350, 500);
      ctx.lineTo(150, 500);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(225, 310);
      ctx.lineTo(235, 330);
      ctx.lineTo(250, 320);
      ctx.lineTo(265, 330);
      ctx.lineTo(275, 310);
      ctx.closePath();
      ctx.fill();

      const badgeGradient = ctx.createLinearGradient(215, 370, 285, 398);
      badgeGradient.addColorStop(0, '#fbbf24');
      badgeGradient.addColorStop(1, '#f59e0b');
      ctx.fillStyle = badgeGradient;
      ctx.fillRect(215, 370, 70, 28);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.strokeRect(215, 370, 70, 28);
      ctx.fillStyle = '#1e40af';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('AI EXPERT', 250, 389);

      if (gender === 'male') {
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(220, 190, 22, 0, Math.PI * 2);
        ctx.arc(280, 190, 22, 0, Math.PI * 2);
        ctx.moveTo(242, 190);
        ctx.lineTo(258, 190);
        ctx.stroke();
      }

      ctx.restore();
    };

    drawInterviewer();
  }, [isSpeaking, mouthOpen, eyesClosed, headTilt, gender]);

  useEffect(() => {
    if (!isSpeaking) {
      setMouthOpen(0);
      return;
    }

    const interval = setInterval(() => {
      setMouthOpen(prev => {
        const target = Math.random() * 18;
        const speed = 0.4;
        return prev + (target - prev) * speed;
      });
    }, 60);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setEyesClosed(true);
      setTimeout(() => setEyesClosed(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

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
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-animated">
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="max-w-full max-h-full object-contain"
      />
      {isSpeaking && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 btn-gradient-primary animate-pulse flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          Speaking...
        </div>
      )}
      <div className="absolute top-4 left-4 card-glass text-white px-3 py-1.5 rounded-lg text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>AI Interviewer Active</span>
        </div>
      </div>
    </div>
  );
}


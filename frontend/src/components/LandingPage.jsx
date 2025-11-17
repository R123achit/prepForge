import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Brain, 
  Video, 
  FileText, 
  Star, 
  ArrowRight, 
  Play,
  CheckCircle,
  Users,
  Trophy,
  Zap
} from 'lucide-react';

const LandingPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  
  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 0.1,
            y: mousePosition.y * 0.1,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 30 }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            x: -mousePosition.x * 0.05,
            y: -mousePosition.y * 0.05,
          }}
          transition={{ type: "spring", stiffness: 30, damping: 20 }}
        />
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-50 flex justify-between items-center p-6 backdrop-blur-md bg-white/5 border-b border-white/10"
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            PrepForge
          </span>
        </div>
        <div className="hidden md:flex space-x-8">
          <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
          <a href="#demo" className="hover:text-purple-400 transition-colors">Demo</a>
          <a href="#testimonials" className="hover:text-purple-400 transition-colors">Reviews</a>
        </div>
        <Link to="/login">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            Sign In
          </motion.button>
        </Link>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ y: y1, opacity }}
        className="relative z-10 min-h-screen flex items-center justify-center px-6"
      >
        <div className="text-center max-w-6xl mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mb-8"
          >
            <motion.h1
              className="text-6xl md:text-8xl font-bold mb-6 leading-tight"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{
                background: "linear-gradient(90deg, #a855f7, #3b82f6, #06b6d4, #a855f7)",
                backgroundSize: "300% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              PrepForge
            </motion.h1>
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-2xl md:text-4xl font-light mb-4 text-gray-300"
            >
              AI Powered Professional
            </motion.div>
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-2xl md:text-4xl font-light mb-8 text-gray-300"
            >
              Interview Preparation
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Master your interviews with AI-powered mock sessions, live video practice, 
            and intelligent resume analysis. Get hired faster with personalized feedback.
          </motion.p>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(168, 85, 247, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-lg font-semibold flex items-center space-x-2 shadow-lg shadow-purple-500/25"
              >
                <span>Start Practice</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 border-2 border-purple-500/50 rounded-full text-lg font-semibold flex items-center space-x-2 backdrop-blur-sm bg-white/5 hover:bg-white/10 transition-all"
              >
                <Play className="w-5 h-5" />
                <span>Try AI Mock Interview</span>
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Floating Elements */}
        <motion.div
          className="absolute top-1/4 left-10 w-20 h-20 border border-purple-500/30 rounded-full backdrop-blur-sm bg-white/5"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-10 w-16 h-16 border border-blue-500/30 rounded-lg backdrop-blur-sm bg-white/5"
          animate={{
            y: [0, 20, 0],
            rotate: [0, -180, -360],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </motion.section>

      {/* Why PrepForge Section */}
      <WhyPrepForgeSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Demo Section */}
      <DemoSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
};

// Why PrepForge Section Component
const WhyPrepForgeSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const cards = [
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Advanced AI analyzes your responses and provides personalized feedback to improve your interview performance.",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Video,
      title: "Real-Time Practice",
      description: "Practice with live video interviews and get instant feedback from experienced professionals.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Trophy,
      title: "Proven Results",
      description: "Join thousands of successful candidates who landed their dream jobs using PrepForge.",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  return (
    <section ref={ref} className="relative z-10 py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Why PrepForge?
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experience the future of interview preparation with cutting-edge AI technology
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ y: 100, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
                   style={{ background: `linear-gradient(135deg, ${card.gradient.split(' ')[1]}, ${card.gradient.split(' ')[3]})` }} />
              
              <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 h-full">
                <div className={`w-16 h-16 bg-gradient-to-r ${card.gradient} rounded-xl flex items-center justify-center mb-6`}>
                  <card.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{card.title}</h3>
                <p className="text-gray-400 leading-relaxed">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Features Section Component
const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const features = [
    { icon: Brain, title: "AI Mock Interviews", description: "Practice with intelligent AI that adapts to your responses" },
    { icon: Video, title: "Live Video Sessions", description: "Connect with real interviewers for authentic practice" },
    { icon: FileText, title: "Resume Analysis", description: "Get AI-powered insights to optimize your resume" },
    { icon: Zap, title: "Instant Feedback", description: "Receive immediate, actionable feedback on your performance" },
    { icon: Users, title: "Expert Network", description: "Access to industry professionals and career coaches" },
    { icon: Trophy, title: "Success Tracking", description: "Monitor your progress with detailed analytics" }
  ];

  return (
    <section id="features" ref={ref} className="relative z-10 py-32 px-6 bg-gradient-to-b from-transparent to-purple-900/20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Everything you need to ace your next interview, powered by advanced AI
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 100, opacity: 0, scale: 0.8 }}
              animate={isInView ? { y: 0, opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300"
            >
              <feature.icon className="w-12 h-12 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Demo Section Component
const DemoSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="demo" ref={ref} className="relative z-10 py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            See It In Action
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experience our AI interview system with this interactive demo
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={isInView ? { y: 0, opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -10 }}
          className="relative group cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-300" />
          
          <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 text-center">
            <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
              <Play className="w-16 h-16 text-white ml-2" />
            </div>
            
            <h3 className="text-3xl font-bold mb-4">Live AI Interview Demo</h3>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Watch how our AI conducts realistic interviews and provides instant, personalized feedback
            </p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-lg font-semibold flex items-center space-x-2 mx-auto shadow-lg shadow-purple-500/25"
            >
              <Play className="w-5 h-5" />
              <span>Start Demo</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Testimonials Section Component
const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer at Google",
      content: "PrepForge's AI interviews were incredibly realistic. The feedback helped me identify and fix my weak points before the real interview.",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Product Manager at Microsoft",
      content: "The live video practice sessions with industry experts gave me the confidence I needed. Landed my dream job in just 3 weeks!",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Data Scientist at Netflix",
      content: "The resume analysis feature was a game-changer. It helped me optimize my resume for ATS systems and get more interview calls.",
      rating: 5
    }
  ];

  return (
    <section id="testimonials" ref={ref} className="relative z-10 py-32 px-6 bg-gradient-to-b from-purple-900/20 to-transparent">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={isInView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Success Stories
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Join thousands of professionals who transformed their careers with PrepForge
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ y: 100, opacity: 0, rotateY: -15 }}
              animate={isInView ? { y: 0, opacity: 1, rotateY: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              whileHover={{ y: -10, rotateY: 5 }}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.content}"</p>
              
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-semibold">{testimonial.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-gray-400 text-sm">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// CTA Section Component
const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative z-10 py-32 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.9 }}
          animate={isInView ? { y: 0, opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-green-500/20 rounded-3xl blur-3xl" />
          
          <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-16">
            <motion.h2
              initial={{ y: 30, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent"
            >
              Ready to Ace Your Next Interview?
            </motion.h2>
            
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
            >
              Join thousands of successful candidates and transform your interview skills with AI-powered preparation
            </motion.p>
            
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={isInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link to="/register">
                <motion.button
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: "0 25px 50px rgba(168, 85, 247, 0.5)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="px-12 py-6 bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 rounded-full text-2xl font-bold flex items-center space-x-3 mx-auto shadow-2xl shadow-purple-500/30 animate-pulse hover:animate-none"
                >
                  <span>Start Your Journey</span>
                  <ArrowRight className="w-6 h-6" />
                </motion.button>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center justify-center space-x-8 mt-12 text-gray-400"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Free Trial</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Instant Access</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingPage;
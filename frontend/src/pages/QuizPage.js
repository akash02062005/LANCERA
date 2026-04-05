import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { Brain, ChevronRight } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [fullQuestions, setFullQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState('loading'); // loading | quiz | result
  const [score, setScore] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/bidding/quiz/${id}/start`).then(({ data }) => {
      if (data.alreadyCompleted) {
        setScore(data.score);
        setPhase('result');
      } else {
        setQuestions(data.data.questions);
        setFullQuestions(data.data.fullQuestions);
        setAnswers(new Array(data.data.questions.length).fill(-1));
        setPhase('quiz');
      }
    }).catch(() => { toast.error('Failed to load quiz'); navigate(`/projects/${id}`); });
  }, [id]);

  const moveNext = useCallback((answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = answerIndex ?? -1;
    setAnswers(newAnswers);
    setSelected(null);

    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
      setTimerKey(k => k + 1);
    } else {
      submitQuiz(newAnswers);
    }
  }, [currentQ, questions, answers]);

  const submitQuiz = async (finalAnswers) => {
    setPhase('submitting');
    setSubmitting(true);
    try {
      const { data } = await api.post(`/bidding/quiz/${id}/submit`, {
        answers: finalAnswers,
        questions: fullQuestions,
        timeTaken: questions.length * 10
      });
      setScore(data.data.score);
      setPhase('result');
    } catch (err) {
      toast.error('Failed to submit quiz');
      setPhase('quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswer = (optionIndex) => {
    setSelected(optionIndex);
    setTimeout(() => moveNext(optionIndex), 400);
  };

  if (phase === 'loading') return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Brain size={48} className="text-primary animate-pulse" />
      <p className="text-white/60">Generating AI quiz from project description...</p>
    </div>
  );

  if (phase === 'submitting') return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-white/60">Calculating your score...</p>
    </div>
  );

  if (phase === 'result') return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="glass-card p-10 text-center max-w-md w-full">
        <Brain size={48} className="text-primary mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
        <div className="relative w-36 h-36 mx-auto my-6">
          <svg viewBox="0 0 36 36" className="w-36 h-36 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2D2D4E" strokeWidth="2" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#6C63FF" strokeWidth="2"
              strokeDasharray={`${score} 100`} strokeLinecap="round" className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black gradient-text">{score}</span>
            <span className="text-white/40 text-sm">/100</span>
          </div>
        </div>
        <p className="text-white/60 mb-2">{score >= 80 ? 'Excellent! 🌟 You\'re highly qualified.' : score >= 60 ? 'Good job! You can proceed to bid.' : 'You can still bid. Improve your score next time!'}</p>
        <p className="text-white/40 text-sm mb-8">Your AI score has been recorded and will be visible to the client.</p>
        <button onClick={() => navigate(`/projects/${id}/bid`)} className="btn-primary w-full flex items-center justify-center gap-2">
          Enter Bidding Room <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );

  const q = questions[currentQ];
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen flex flex-col gradient-hero">
      {/* Header */}
      <div className="glass-card m-4 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain size={20} className="text-primary" />
          <span className="font-semibold">AI Technical Quiz</span>
        </div>
        <span className="text-white/50 text-sm">Question {currentQ + 1} of {questions.length}</span>
      </div>

      {/* Progress Bar */}
      <div className="mx-4 mb-4 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full gradient-bg rounded-full transition-all duration-300"
          style={{ width: `${((currentQ) / questions.length) * 100}%` }} />
      </div>

      {/* Main Quiz Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <div className="w-full max-w-2xl">
          {/* Timer */}
          <div className="flex justify-center mb-8">
            <CountdownCircleTimer key={timerKey} isPlaying duration={10} size={80} strokeWidth={6}
              colors={['#6C63FF', '#FFA500', '#FF6584']} colorsTime={[10, 5, 0]}
              onComplete={() => moveNext(-1)}>
              {({ remainingTime }) => (
                <span className={`text-2xl font-black ${remainingTime <= 2 ? 'timer-danger' : 'text-white'}`}>
                  {remainingTime}
                </span>
              )}
            </CountdownCircleTimer>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div key={currentQ} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <div className="glass-card p-6 mb-6 text-center">
                <p className="text-xl font-semibold leading-relaxed">{q?.question}</p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-3">
                {q?.options?.map((option, i) => (
                  <motion.button key={i} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    onClick={() => !selected && handleAnswer(i)}
                    className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 font-medium
                      ${selected === i ? 'border-primary bg-primary/20' : 'border-white/10 bg-white/5 hover:border-primary/50 hover:bg-white/10'}`}>
                    <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0
                      ${selected === i ? 'gradient-bg' : 'bg-white/10'}`}>
                      {optionLabels[i]}
                    </span>
                    {option}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

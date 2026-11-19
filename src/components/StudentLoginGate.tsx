import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  BookmarkCheck,
  Eye,
  EyeOff,
  KeyRound,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  AuthenticatedStudent,
  matchClassStudent,
  verifyCreatorKey,
} from '../constants/roster';

interface StudentLoginGateProps {
  reducedMotion: boolean;
  onLogin: (student: AuthenticatedStudent, saveForFuture: boolean) => void;
}

export const StudentLoginGate: React.FC<StudentLoginGateProps> = ({
  reducedMotion,
  onLogin,
}) => {
  const [step, setStep] = useState<'name' | 'creator-key'>('name');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [pendingStudent, setPendingStudent] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);
  const [pendingSave, setPendingSave] = useState(false);

  const [creatorKeyInput, setCreatorKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [keyError, setKeyError] = useState(false);

  const attemptNameStep = (saveForFuture: boolean) => {
    const matched = matchClassStudent(firstName, lastName);
    if (!matched) {
      setNameError(true);
      return;
    }
    setNameError(false);
    setKeyError(false);
    setPendingStudent(matched);
    setPendingSave(saveForFuture);
    setStep('creator-key');
  };

  const handleCreatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingStudent) return;
    if (!verifyCreatorKey(creatorKeyInput)) {
      setKeyError(true);
      return;
    }
    setKeyError(false);
    onLogin({ ...pendingStudent, isCreator: true }, pendingSave);
  };

  const handleNoCreatorKey = () => {
    if (!pendingStudent) return;
    onLogin({ ...pendingStudent, isCreator: false }, pendingSave);
  };

  return (
    <div className="fixed inset-0 z-30 flex min-h-screen w-screen items-center justify-center bg-[#05070d]/92 px-4 py-8">
      <motion.div
        key={step}
        initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reducedMotion ? 0 : 0.3,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="w-full max-w-md rounded-2xl border border-white/12 bg-[#0b0f1a] p-6 sm:p-8 shadow-[0_0_60px_rgba(34,211,238,0.14)]"
      >
        {step === 'name' ? (
          <>
            {/* Top Error Alert (shown on unrecognized student) */}
            {nameError && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/50 bg-rose-950/70 px-4 py-3.5 text-rose-100"
              >
                <AlertCircle
                  className="mt-0.5 h-5 w-5 shrink-0 text-rose-400"
                  aria-hidden="true"
                />
                <div>
                  <div className="font-display text-xs font-bold tracking-wider uppercase text-rose-300">
                    ERROR
                  </div>
                  <p className="mt-0.5 text-sm font-medium text-white">
                    Siz bu sinfning a&apos;zosi emassiz
                  </p>
                </div>
              </div>
            )}

            {/* Brand Header */}
            <div className="text-center">
              <div className="font-display text-3xl font-bold tracking-tight text-cyan-400">
                LSL <span className="text-pink-400">School</span>
              </div>
              <p className="mt-1.5 text-sm font-medium text-slate-200">
                Ism va Familiyangizni boshini bosh harf bilan to&apos;liq yozing
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Class 7 - B Student Portal
              </p>
            </div>

            {/* Step 1: First & Last Name Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                attemptNameStep(false);
              }}
              className="mt-7 space-y-4"
            >
              <div>
                <label
                  htmlFor="student-first-name"
                  className="block text-xs font-medium text-slate-300"
                >
                  First Name (Ism)
                </label>
                <input
                  id="student-first-name"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (nameError) setNameError(false);
                  }}
                  placeholder="Enter a Name"
                  className="mt-1.5 w-full min-h-11 rounded-xl border border-white/14 bg-[#070a12] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="student-last-name"
                  className="block text-xs font-medium text-slate-300"
                >
                  Last Name (Familiya)
                </label>
                <input
                  id="student-last-name"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (nameError) setNameError(false);
                  }}
                  placeholder="Username"
                  className="mt-1.5 w-full min-h-11 rounded-xl border border-white/14 bg-[#070a12] px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2.5 pt-2 sm:flex-row">
                <button
                  type="submit"
                  className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/6 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-white/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 whitespace-nowrap"
                >
                  <LogIn className="h-4 w-4 text-slate-300" aria-hidden="true" />
                  <span>Enter</span>
                </button>

                <button
                  type="button"
                  onClick={() => attemptNameStep(true)}
                  className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 whitespace-nowrap"
                >
                  <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
                  <span>Save &amp; Enter</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Top Error Alert (shown on invalid Creator Key) */}
            {keyError && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/50 bg-rose-950/70 px-4 py-3.5 text-rose-100"
              >
                <AlertCircle
                  className="mt-0.5 h-5 w-5 shrink-0 text-rose-400"
                  aria-hidden="true"
                />
                <div>
                  <div className="font-display text-xs font-bold tracking-wider uppercase text-rose-300">
                    ERROR
                  </div>
                  <p className="mt-0.5 text-sm font-medium text-white">
                    Invalid Creator Key. Access to Editor Mode denied.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep('name');
                  setKeyError(false);
                  setCreatorKeyInput('');
                }}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Back</span>
              </button>

              <span className="text-xs text-slate-400">
                {pendingStudent?.firstName}
                {pendingStudent?.lastName ? ` ${pendingStudent.lastName}` : ''}
              </span>
            </div>

            <div className="mt-5 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-400">
                <KeyRound className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="font-display mt-3 text-xl font-semibold text-slate-100">
                Enter a Creator Key
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Creator Key unlocks schedule and time editing.
              </p>
            </div>

            <form onSubmit={handleCreatorSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="creator-key-input"
                  className="block text-xs font-medium text-slate-300"
                >
                  Creator Key
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="creator-key-input"
                    type={showKey ? 'text' : 'password'}
                    value={creatorKeyInput}
                    onChange={(e) => {
                      setCreatorKeyInput(e.target.value);
                      if (keyError) setKeyError(false);
                    }}
                    placeholder="Enter a Creator Key"
                    autoFocus
                    className="w-full min-h-11 rounded-xl border border-white/14 bg-[#070a12] py-2.5 pl-4 pr-11 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((prev) => !prev)}
                    aria-label={showKey ? 'Hide key' : 'Show key'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition-colors hover:text-slate-200"
                  >
                    {showKey ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                <span>Unlock Editor Mode</span>
              </button>

              <button
                type="button"
                onClick={handleNoCreatorKey}
                className="flex min-h-11 w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                I Have Not Creator Key
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
};

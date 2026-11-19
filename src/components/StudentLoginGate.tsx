import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  AuthenticatedStudent,
  matchClassStudent,
  verifyCreatorKey,
} from '../constants/roster';
import {
  PixelAlertIcon,
  PixelArrowLeftIcon,
  PixelBookmarkIcon,
  PixelEyeIcon,
  PixelEyeOffIcon,
  PixelKeyIcon,
  PixelLogInIcon,
  PixelShieldCheckIcon,
} from './PixelIcons';

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
    <div className="pixel-grid-bg fixed inset-0 z-30 flex min-h-screen w-screen items-center justify-center bg-[#05070d]/94 px-4 py-8">
      <motion.div
        key={step}
        initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reducedMotion ? 0 : 0.24,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="pixel-panel relative w-full max-w-md p-6 sm:p-8"
      >
        {/* Crisp 8-bit corner pixel rivets */}
        <span className="pointer-events-none absolute top-1.5 left-1.5 h-1.5 w-1.5 bg-cyan-400" aria-hidden="true" />
        <span className="pointer-events-none absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-cyan-400" aria-hidden="true" />
        <span className="pointer-events-none absolute bottom-1.5 left-1.5 h-1.5 w-1.5 bg-pink-400" aria-hidden="true" />
        <span className="pointer-events-none absolute right-1.5 bottom-1.5 h-1.5 w-1.5 bg-pink-400" aria-hidden="true" />

        {step === 'name' ? (
          <>
            {/* Top Error Alert (shown on unrecognized student) */}
            {nameError && (
              <div
                role="alert"
                className="pixel-panel-error mb-6 flex items-start gap-3 px-4 py-3 text-rose-100"
              >
                <PixelAlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                <div>
                  <div className="font-display text-xs font-bold tracking-wider text-rose-300">
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
              <div
                className="font-display text-3xl font-bold tracking-tight text-cyan-400"
                style={{ textShadow: '3px 3px 0 #083344' }}
              >
                LSL{' '}
                <span
                  className="text-pink-400"
                  style={{ textShadow: '3px 3px 0 #500724' }}
                >
                  School
                </span>
              </div>
              <p className="mt-2.5 text-sm font-medium text-slate-100">
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
              className="mt-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="student-first-name"
                  className="block font-display text-[11px] font-bold text-slate-300"
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
                  className="pixel-input mt-1.5 min-h-11 w-full px-3.5 py-2.5 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="student-last-name"
                  className="block font-display text-[11px] font-bold text-slate-300"
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
                  className="pixel-input mt-1.5 min-h-11 w-full px-3.5 py-2.5 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  className="pixel-btn flex min-h-11 flex-1 items-center justify-center gap-2 border-2 border-slate-400/50 bg-[#12192d] px-4 py-2.5 font-display text-xs font-bold text-slate-100 hover:border-slate-300 hover:bg-[#192340] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 whitespace-nowrap"
                >
                  <PixelLogInIcon className="h-4 w-4 text-slate-300" />
                  <span>Enter</span>
                </button>

                <button
                  type="button"
                  onClick={() => attemptNameStep(true)}
                  className="pixel-btn flex min-h-11 flex-1 items-center justify-center gap-2 border-2 border-cyan-300 bg-cyan-500 px-4 py-2.5 font-display text-xs font-bold text-slate-950 hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 whitespace-nowrap"
                >
                  <PixelBookmarkIcon className="h-4 w-4" />
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
                className="pixel-panel-error mb-6 flex items-start gap-3 px-4 py-3 text-rose-100"
              >
                <PixelAlertIcon className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                <div>
                  <div className="font-display text-xs font-bold tracking-wider text-rose-300">
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
                className="pixel-btn-sm flex items-center gap-1.5 border-2 border-slate-500/50 bg-[#12192d] px-2.5 py-1.5 font-display text-[11px] font-bold text-slate-200 hover:border-cyan-400/70 hover:text-white"
              >
                <PixelArrowLeftIcon className="h-3.5 w-3.5" />
                <span>Back</span>
              </button>

              <span className="text-sm font-medium text-slate-300">
                {pendingStudent?.firstName}
                {pendingStudent?.lastName ? ` ${pendingStudent.lastName}` : ''}
              </span>
            </div>

            <div className="mt-5 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center border-2 border-cyan-400 bg-cyan-500/15 text-cyan-300 shadow-[3px_3px_0_0_#020308]">
                <PixelKeyIcon className="h-6 w-6" />
              </div>
              <h2 className="font-display mt-3.5 text-lg font-bold text-slate-100">
                Enter a Creator Key
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Creator Key unlocks schedule and time editing.
              </p>
            </div>

            <form onSubmit={handleCreatorSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="creator-key-input"
                  className="block font-display text-[11px] font-bold text-slate-300"
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
                    className="pixel-input min-h-11 w-full py-2.5 pl-3.5 pr-11 text-base text-slate-100 placeholder:text-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((prev) => !prev)}
                    aria-label={showKey ? 'Hide key' : 'Show key'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 transition-colors hover:text-cyan-300"
                  >
                    {showKey ? (
                      <PixelEyeOffIcon className="h-4 w-4" />
                    ) : (
                      <PixelEyeIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="pixel-btn flex min-h-11 w-full items-center justify-center gap-2 border-2 border-cyan-300 bg-cyan-500 px-4 py-2.5 font-display text-xs font-bold text-slate-950 hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
              >
                <PixelShieldCheckIcon className="h-4 w-4" />
                <span>Unlock Editor Mode</span>
              </button>

              <button
                type="button"
                onClick={handleNoCreatorKey}
                className="pixel-btn flex min-h-11 w-full items-center justify-center border-2 border-emerald-300 bg-emerald-500 px-4 py-2.5 font-display text-xs font-bold text-slate-950 hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
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

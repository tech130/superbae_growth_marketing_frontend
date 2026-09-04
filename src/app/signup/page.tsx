"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

type UserData = {
  id: number;
  name?: string;
  email: string;
  referral_code?: string;
  referral_link?: string;
};

function SignupForm() {
  const searchParams = useSearchParams();
  const refCode = (searchParams.get("ref") || "").trim().toUpperCase();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState(refCode);
  const [loading, setLoading] = useState(false);
  const [createdUser, setCreatedUser] = useState<UserData | null>(null);
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("annual_pro");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Automatically track link click on mount when refCode is present
  useEffect(() => {
    if (refCode) {
      setReferralCode(refCode);
      // Track in Express
      api.post(`/referrals/links/${encodeURIComponent(refCode)}/click`, {
        userAgent: typeof window !== "undefined" ? navigator.userAgent : "browser",
      }).catch(() => {});
      // Track in Admin / Django
      api.post(`/admin/referral-links/${encodeURIComponent(refCode)}/track-click/`).catch(() => {});
    }
  }, [refCode]);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      let data: UserData | null = null;
      try {
        // First try Express /api/admin/signup/
        data = await api.post<UserData>("/admin/signup/", {
          name,
          email,
          password,
          referral_code: referralCode ? referralCode.trim().toUpperCase() : undefined,
        });
      } catch {
        // Fallback to Django /api/signup/ if configured
        data = await api.post<UserData>("/signup/", {
          name,
          email,
          password,
          referral_code: referralCode ? referralCode.trim().toUpperCase() : undefined,
        });
      }

      if (!data?.id) {
        throw new Error("Could not create user account.");
      }

      // Also record pending referral in MongoDB tracking engine if a referral code was used
      if (referralCode) {
        await api.post("/referrals", {
          referredUserId: data.id,
          referralCode: referralCode.trim().toUpperCase(),
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "browser",
        }).catch(() => {});
      }

      setCreatedUser(data);
      setNotice("🎉 Account created successfully! Your referral code is ready.");
    } catch (err: any) {
      setError(err.message || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!createdUser?.id) return;
    try {
      setVerifying(true);
      setError("");
      await api.patch(`/referrals/users/${createdUser.id}/verified`);
      setVerified(true);
      setNotice("✅ Account verified! Referral stage moved to subscription.");
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  const handleSubscribe = async () => {
    if (!createdUser?.id) return;
    try {
      setSubscribing(true);
      setError("");
      // Call Express conversion endpoint to emit reward
      await api.post(`/referrals/users/${createdUser.id}/subscribe`, {
        subscriptionType: selectedPlan,
        orderAmount: selectedPlan === "annual_pro" ? 2999 : 499,
      });

      // Call Admin / Django subscribe webhook
      await api.post("/admin/subscribe/", {
        userId: createdUser.id,
        subscription_type: selectedPlan,
      }).catch(() => {});

      setSubscribed(true);
      setNotice("🎉 Subscription activated! Referral conversion recorded & reward issued to referrer!");
    } catch (err: any) {
      setError(err.message || "Subscription failed.");
    } finally {
      setSubscribing(false);
    }
  };

  const copyReferralLink = () => {
    if (!createdUser?.referral_code) return;
    const url = `http://localhost:3000/signup?ref=${createdUser.referral_code}`;
    navigator.clipboard.writeText(url);
    setNotice("Link copied to clipboard: " + url);
  };

  return (
    <div className="w-full max-w-lg rounded-3xl border border-[var(--line)] bg-[var(--paper)] p-8 shadow-xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between border-b border-[var(--line)] pb-5">
        <div>
          <Link href="/" className="font-display text-2xl font-extrabold tracking-tight text-[var(--ink)]">
            super<span className="text-[var(--violet)]">bae</span>
          </Link>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {createdUser ? "Customer Onboarding & Subscription Portal" : "Join Super Bae & Unlock Member Perks"}
          </p>
        </div>
        <Link
          href="/referral/dashboard"
          className="text-xs font-semibold text-[var(--violet)] hover:underline"
        >
          Admin Dashboard →
        </Link>
      </div>

      {/* Referral Tag */}
      {refCode && !createdUser && (
        <div className="mb-5 rounded-2xl bg-[var(--violet-dim)] p-4 border border-[var(--violet)]/30 flex items-center gap-3">
          <span className="text-2xl">🎁</span>
          <div>
            <p className="text-xs font-bold text-[var(--violet)]">Referral Discount Applied</p>
            <p className="text-xs text-[var(--ink)] font-mono">
              Invited by Code: <strong>{refCode}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Notification */}
      {notice && (
        <div className="mb-5 rounded-2xl border border-[var(--teal)]/40 bg-[var(--teal-dim)] p-4 text-sm font-medium text-[var(--teal)]">
          {notice}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-2xl border border-[var(--coral)]/40 bg-[var(--coral-dim)] p-4 text-sm font-medium text-[var(--coral)]">
          {error}
        </div>
      )}

      {!createdUser ? (
        <form onSubmit={handleSignup} className="space-y-4">
          <label className="block text-sm font-medium text-[var(--ink)]">
            Full Name
            <input
              className="input mt-1.5"
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="block text-sm font-medium text-[var(--ink)]">
            Email Address *
            <input
              className="input mt-1.5"
              type="email"
              placeholder="priya@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="block text-sm font-medium text-[var(--ink)]">
            Password *
            <input
              className="input mt-1.5"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          <label className="block text-sm font-medium text-[var(--ink)]">
            Referral Code (Optional)
            <input
              className="input mt-1.5 font-mono uppercase font-bold text-[var(--violet)]"
              placeholder="e.g. ROHA4092"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[var(--violet)] py-3 text-sm font-bold text-white shadow-lg shadow-[var(--violet)]/20 hover:bg-[#b03d82] disabled:opacity-50 transition-colors mt-2"
          >
            {loading ? "Creating account..." : "Sign Up with Super Bae"}
          </button>
        </form>
      ) : (
        <div className="space-y-5">
          {/* User Profile Card */}
          <div className="rounded-2xl border border-[var(--line)] bg-black/5 p-4 text-sm space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[var(--muted)]">User ID:</span>
              <strong className="font-mono text-[var(--ink)]">#{createdUser.id}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--muted)]">Email:</span>
              <strong className="text-[var(--ink)]">{createdUser.email}</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--muted)]">Account Status:</span>
              <strong className="text-[var(--teal)] font-semibold">Active</strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--muted)]">Verification:</span>
              <strong className={verified ? "text-[var(--teal)]" : "text-[var(--amber)]"}>
                {verified ? "Verified ✅" : "Unverified (Pending)"}
              </strong>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--muted)]">Subscription:</span>
              <strong className={subscribed ? "text-[var(--teal)]" : "text-[var(--muted)]"}>
                {subscribed ? `Subscribed (${selectedPlan}) 🎉` : "Free Plan"}
              </strong>
            </div>

            {createdUser.referral_code && (
              <div className="mt-3 border-t border-[var(--line)] pt-3 flex justify-between items-center bg-[var(--violet-dim)] -mx-4 -mb-4 p-3.5 rounded-b-2xl">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--violet)]">
                    Your Personal Referral Code
                  </p>
                  <p className="font-mono font-extrabold text-[var(--violet)] text-base">
                    {createdUser.referral_code}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={copyReferralLink}
                  className="rounded-xl bg-[var(--violet)] px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-[#b03d82] transition-colors"
                >
                  Copy Share Link
                </button>
              </div>
            )}
          </div>

          {/* Step 1: Verification Test Button */}
          {!verified && (
            <div className="rounded-2xl border border-[var(--amber)]/40 bg-[var(--amber-dim)] p-4 text-center space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--amber)]">Stage 1: Verify Account</p>
              <p className="text-xs text-[var(--ink)]">
                Click verify to simulate email/OTP verification and advance the referral funnel.
              </p>
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="w-full rounded-xl bg-[var(--amber)] py-2 text-xs font-bold text-white shadow hover:opacity-90 disabled:opacity-50"
              >
                {verifying ? "Verifying..." : "Verify Account Now"}
              </button>
            </div>
          )}

          {/* Step 2: Subscription Conversion Test Button */}
          {!subscribed ? (
            <div className="rounded-2xl border border-[var(--violet)]/40 bg-[var(--violet-dim)] p-5 text-center space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--violet)]">Stage 2: Convert to Paid Plan</p>
              <h3 className="font-display font-bold text-[var(--ink)] text-base">Purchase Subscription</h3>
              <div className="grid grid-cols-2 gap-2 text-left">
                <label className={`p-3 rounded-xl border text-xs cursor-pointer flex flex-col justify-between ${selectedPlan === "annual_pro" ? "border-[var(--violet)] bg-white" : "border-[var(--line)] bg-[var(--paper)]"}`}>
                  <div className="flex items-center gap-1.5">
                    <input type="radio" name="plan" checked={selectedPlan === "annual_pro"} onChange={() => setSelectedPlan("annual_pro")} />
                    <span className="font-bold text-[var(--ink)]">Pro Annual</span>
                  </div>
                  <span className="font-mono font-bold text-[var(--teal)] mt-1">₹2,999 / yr</span>
                </label>
                <label className={`p-3 rounded-xl border text-xs cursor-pointer flex flex-col justify-between ${selectedPlan === "monthly_starter" ? "border-[var(--violet)] bg-white" : "border-[var(--line)] bg-[var(--paper)]"}`}>
                  <div className="flex items-center gap-1.5">
                    <input type="radio" name="plan" checked={selectedPlan === "monthly_starter"} onChange={() => setSelectedPlan("monthly_starter")} />
                    <span className="font-bold text-[var(--ink)]">Starter Monthly</span>
                  </div>
                  <span className="font-mono font-bold text-[var(--teal)] mt-1">₹499 / mo</span>
                </label>
              </div>

              <button
                onClick={handleSubscribe}
                disabled={subscribing}
                className="w-full rounded-2xl bg-[var(--violet)] py-2.5 text-sm font-bold text-white shadow-lg shadow-[var(--violet)]/20 hover:bg-[#b03d82] disabled:opacity-50 transition-colors"
              >
                {subscribing ? "Activating Subscription..." : "Subscribe Now & Trigger Reward"}
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--teal)]/40 bg-[var(--teal-dim)] p-5 text-center space-y-2">
              <p className="text-base font-bold text-[var(--teal)]">✅ Conversion Complete!</p>
              <p className="text-xs text-[var(--ink)]">
                The referral has converted, and the reward is generated in the Admin Rewards ledger.
              </p>
            </div>
          )}

          {/* Navigation Links */}
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/referral/dashboard"
              className="w-full text-center rounded-2xl bg-[var(--ink)] py-3 text-xs font-bold text-white hover:bg-black/80 transition-colors"
            >
              Open Admin Dashboard to View Reward & Ledger →
            </Link>
            <button
              onClick={() => {
                setCreatedUser(null);
                setVerified(false);
                setSubscribed(false);
                setName("");
                setEmail("");
                setPassword("");
                setReferralCode("");
                setNotice("");
                setError("");
              }}
              className="w-full text-center rounded-2xl border border-[var(--line)] bg-[var(--paper)] py-2.5 text-xs font-semibold text-[var(--muted)] hover:bg-black/5 transition-colors"
            >
              + Register Another User
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black/[0.02] p-6">
      <Suspense fallback={<div className="text-sm text-[var(--muted)]">Loading signup...</div>}>
        <SignupForm />
      </Suspense>
    </main>
  );
}

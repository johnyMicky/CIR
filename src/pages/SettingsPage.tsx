import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ref, update } from "firebase/database";
import {
  User,
  Shield,
  Bell,
  SlidersHorizontal,
  Save,
  Mail,
  Phone,
  Globe,
  Clock3,
  Monitor,
  Eye,
  EyeOff,
  CheckCircle2,
  Smartphone,
  Laptop,
  KeyRound,
} from "lucide-react";

import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

type ShellContext = {
  showBalance: boolean;
  setShowBalance: React.Dispatch<React.SetStateAction<boolean>>;
  globalSearch: string;
};

type SettingsTab = "profile" | "security" | "notifications" | "preferences";

const SettingsPage = () => {
  const { showBalance, setShowBalance } = useOutletContext<ShellContext>();
  const { user, setUser } = useAuth() as any;

  const [toast, setToast] = useState("");
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [savingProfile, setSavingProfile] = useState(false);

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    region: "",
  });

  const [security, setSecurity] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    loginAlerts: true,
    trustedDevicesOnly: false,
    sessionTimeout: "30",
  });

  const [notifications, setNotifications] = useState({
    depositAlerts: true,
    withdrawalAlerts: true,
    transferAlerts: true,
    loginAlerts: true,
    emailNotifications: false,
    inAppNotifications: true,
  });

  const [preferences, setPreferences] = useState({
    defaultAsset: "USDT",
    preferredNetwork: "ERC20",
    fiatCurrency: "USD",
    language: "English",
    timezone: "Europe/Amsterdam",
    compactMode: false,
  });

  useEffect(() => {
    if (!user) return;

    const resolvedFullName =
      user.fullName ||
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      user.name ||
      "";

    const resolvedRegion =
      user.stateRegion ||
      user.region ||
      [user.city, user.stateRegion].filter(Boolean).join(" / ") ||
      user.city ||
      "";

    setProfile({
      fullName: resolvedFullName,
      email: user.email || "",
      phone: user.phone || "",
      country: user.country || "",
      region: resolvedRegion,
    });
  }, [user]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(timer);
  }, [toast]);

  const tabs = useMemo(
    () => [
      { key: "profile" as SettingsTab, label: "Profile", icon: User },
      { key: "security" as SettingsTab, label: "Security", icon: Shield },
      { key: "notifications" as SettingsTab, label: "Notifications", icon: Bell },
      { key: "preferences" as SettingsTab, label: "Preferences", icon: SlidersHorizontal },
    ],
    []
  );

  const saveProfile = async () => {
    if (!user?.id) {
      setToast("User session not found");
      return;
    }

    const cleanedFullName = profile.fullName.trim();
    const nameParts = cleanedFullName.split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ");

    try {
      setSavingProfile(true);

      await update(ref(db, `users/${user.id}`), {
        fullName: cleanedFullName,
        firstName,
        lastName,
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        country: profile.country.trim(),
        stateRegion: profile.region.trim(),
      });

      setUser((prev: any) => ({
        ...prev,
        fullName: cleanedFullName,
        firstName,
        lastName,
        email: profile.email.trim(),
        phone: profile.phone.trim(),
        country: profile.country.trim(),
        stateRegion: profile.region.trim(),
      }));

      setToast("Profile settings saved");
    } catch (error) {
      console.error("Profile save error:", error);
      setToast("Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveSecurity = () => {
    if (
      security.newPassword &&
      security.confirmPassword &&
      security.newPassword !== security.confirmPassword
    ) {
      setToast("New password and confirm password do not match");
      return;
    }

    setToast("Security settings saved");
    setSecurity((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  const saveNotifications = () => {
    setToast("Notification settings saved");
  };

  const savePreferences = () => {
    setToast("Preference settings saved");
  };

  const Toggle = ({
    checked,
    onChange,
    label,
    description,
  }: {
    checked: boolean;
    onChange: (next: boolean) => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
      <div className="min-w-0">
        <div className="text-sm font-medium text-white">{label}</div>
        {description && <div className="mt-1 text-sm text-slate-400">{description}</div>}
      </div>

      <button
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-14 rounded-full transition ${
          checked ? "bg-cyan-500" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
            checked ? "left-8" : "left-1"
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      {toast && (
        <div className="fixed right-4 top-24 z-[100] rounded-2xl border border-cyan-400/20 bg-[#0F1B33]/95 px-4 py-3 text-sm text-cyan-100 shadow-2xl backdrop-blur-xl">
          {toast}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl">
          <div className="text-sm uppercase tracking-[0.18em] text-cyan-300/80">
            Account Center
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400 sm:text-base">
            Manage your account profile, security controls, notifications, and wallet
            display preferences in one place.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Client account settings ready
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
            Sections
          </div>

          <div className="space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${
                    isActive
                      ? "bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-400/20"
                      : "bg-white/5 text-slate-300 ring-1 ring-white/8 hover:bg-white/10"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-3xl bg-white/5 p-4 ring-1 ring-white/8">
            <div className="text-sm font-medium text-white">Balance visibility</div>
            <div className="mt-2 flex items-center gap-3 text-sm text-slate-400">
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span>{showBalance ? "Currently visible" : "Currently hidden"}</span>
            </div>
          </div>
        </aside>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl sm:p-6 lg:p-7">
          {activeTab === "profile" && (
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                    Profile Settings
                  </div>
                  <div className="mt-1 text-xl font-semibold">Personal account details</div>
                </div>

                <button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 text-sm font-medium text-white shadow-[0_0_25px_rgba(34,211,238,0.18)] hover:opacity-95 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {savingProfile ? "Saving..." : "Save Profile"}
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/8">
                  <label className="mb-2 block text-sm text-slate-300">Full Name</label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={profile.fullName}
                      onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                    />
                  </div>
                </div>

                <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/8">
                  <label className="mb-2 block text-sm text-slate-300">Email</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={profile.email}
                      onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                    />
                  </div>
                </div>

                <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/8">
                  <label className="mb-2 block text-sm text-slate-300">Phone</label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={profile.phone}
                      onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                    />
                  </div>
                </div>

                <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/8">
                  <label className="mb-2 block text-sm text-slate-300">Country</label>
                  <div className="relative">
                    <Globe className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={profile.country}
                      onChange={(e) => setProfile((p) => ({ ...p, country: e.target.value }))}
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                    />
                  </div>
                </div>

                <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/8 lg:col-span-2">
                  <label className="mb-2 block text-sm text-slate-300">Region / City</label>
                  <input
                    value={profile.region}
                    onChange={(e) => setProfile((p) => ({ ...p, region: e.target.value }))}
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-400/40"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                    Security Settings
                  </div>
                  <div className="mt-1 text-xl font-semibold">Access and session control</div>
                </div>

                <button
                  onClick={saveSecurity}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 text-sm font-medium text-white shadow-[0_0_25px_rgba(34,211,238,0.18)] hover:opacity-95"
                >
                  <Save className="h-4 w-4" />
                  Save Security
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/8">
                  <label className="mb-2 block text-sm text-slate-300">Current Password</label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={security.currentPassword}
                      onChange={(e) =>
                        setSecurity((s) => ({ ...s, currentPassword: e.target.value }))
                      }
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm outline-none focus:border-cyan-400/40"
                    />
                  </div>
                </div>

                <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/8">
                  <label className="mb-2 block text-sm text-slate-300">New Password</label>
                  <div className="relative">
                    <Shield className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={security.newPassword}
                      onChange={(e) =>
                        setSecurity((s) => ({ ...s, newPassword: e.target.value }))
                      }
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm outline-none focus:border-cyan-400/40"
                    />
                  </div>
                </div>

                <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/8">
                  <label className="mb-2 block text-sm text-slate-300">Confirm Password</label>
                  <div className="relative">
                    <Shield className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={security.confirmPassword}
                      onChange={(e) =>
                        setSecurity((s) => ({ ...s, confirmPassword: e.target.value }))
                      }
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm outline-none focus:border-cyan-400/40"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <Toggle
                  checked={security.loginAlerts}
                  onChange={(next) => setSecurity((s) => ({ ...s, loginAlerts: next }))}
                  label="Login activity alerts"
                  description="Receive alerts whenever a new login session is detected."
                />

                <Toggle
                  checked={security.trustedDevicesOnly}
                  onChange={(next) =>
                    setSecurity((s) => ({ ...s, trustedDevicesOnly: next }))
                  }
                  label="Trusted devices only"
                  description="Restrict account access to previously approved devices."
                />

                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                  <label className="mb-2 block text-sm text-slate-300">Session timeout (minutes)</label>
                  <div className="relative">
                    <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <select
                      value={security.sessionTimeout}
                      onChange={(e) =>
                        setSecurity((s) => ({ ...s, sessionTimeout: e.target.value }))
                      }
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm outline-none focus:border-cyan-400/40"
                    >
                      <option value="15" className="bg-slate-900">15 minutes</option>
                      <option value="30" className="bg-slate-900">30 minutes</option>
                      <option value="60" className="bg-slate-900">60 minutes</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                    <div className="flex items-center gap-3">
                      <Laptop className="h-4 w-4 text-cyan-300" />
                      <div>
                        <div className="text-sm font-medium text-white">MacBook Pro</div>
                        <div className="text-sm text-slate-400">Last active: 2 min ago</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-4 w-4 text-cyan-300" />
                      <div>
                        <div className="text-sm font-medium text-white">iPhone 15 Pro</div>
                        <div className="text-sm text-slate-400">Last active: 1 hour ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                    Notification Settings
                  </div>
                  <div className="mt-1 text-xl font-semibold">Choose what you want to receive</div>
                </div>

                <button
                  onClick={saveNotifications}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 text-sm font-medium text-white shadow-[0_0_25px_rgba(34,211,238,0.18)] hover:opacity-95"
                >
                  <Save className="h-4 w-4" />
                  Save Notifications
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <Toggle
                  checked={notifications.depositAlerts}
                  onChange={(next) =>
                    setNotifications((n) => ({ ...n, depositAlerts: next }))
                  }
                  label="Deposit alerts"
                  description="Get notified when deposits are received or confirmed."
                />

                <Toggle
                  checked={notifications.withdrawalAlerts}
                  onChange={(next) =>
                    setNotifications((n) => ({ ...n, withdrawalAlerts: next }))
                  }
                  label="Withdrawal alerts"
                  description="Get notified for pending, completed, or failed withdrawals."
                />

                <Toggle
                  checked={notifications.transferAlerts}
                  onChange={(next) =>
                    setNotifications((n) => ({ ...n, transferAlerts: next }))
                  }
                  label="Transfer alerts"
                  description="Receive updates for internal transfers and wallet movements."
                />

                <Toggle
                  checked={notifications.loginAlerts}
                  onChange={(next) =>
                    setNotifications((n) => ({ ...n, loginAlerts: next }))
                  }
                  label="Login alerts"
                  description="Get informed when a new login is detected."
                />

                <Toggle
                  checked={notifications.emailNotifications}
                  onChange={(next) =>
                    setNotifications((n) => ({ ...n, emailNotifications: next }))
                  }
                  label="Email notifications"
                  description="Send selected alerts to your email address."
                />

                <Toggle
                  checked={notifications.inAppNotifications}
                  onChange={(next) =>
                    setNotifications((n) => ({ ...n, inAppNotifications: next }))
                  }
                  label="In-app notifications"
                  description="Show account alerts inside the dashboard."
                />
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">
                    Wallet Preferences
                  </div>
                  <div className="mt-1 text-xl font-semibold">Customize your dashboard experience</div>
                </div>

                <button
                  onClick={savePreferences}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 text-sm font-medium text-white shadow-[0_0_25px_rgba(34,211,238,0.18)] hover:opacity-95"
                >
                  <Save className="h-4 w-4" />
                  Save Preferences
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/8">
                  <label className="mb-2 block text-sm text-slate-300">Default Asset</label>
                  <select
                    value={preferences.defaultAsset}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, defaultAsset: e.target.value }))
                    }
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-cyan-400/40"
                  >
                    <option value="BTC" className="bg-slate-900">BTC</option>
                    <option value="ETH" className="bg-slate-900">ETH</option>
                    <option value="USDT" className="bg-slate-900">USDT</option>
                  </select>
                </div>

                <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/8">
                  <label className="mb-2 block text-sm text-slate-300">Preferred Network</label>
                  <select
                    value={preferences.preferredNetwork}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, preferredNetwork: e.target.value }))
                    }
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-cyan-400/40"
                  >
                    <option value="ERC20" className="bg-slate-900">ERC20</option>
                    <option value="TRC20" className="bg-slate-900">TRC20</option>
                    <option value="BEP20" className="bg-slate-900">BEP20</option>
                    <option value="Bitcoin" className="bg-slate-900">Bitcoin</option>
                  </select>
                </div>

                <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/8">
                  <label className="mb-2 block text-sm text-slate-300">Fiat Currency</label>
                  <select
                    value={preferences.fiatCurrency}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, fiatCurrency: e.target.value }))
                    }
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-cyan-400/40"
                  >
                    <option value="USD" className="bg-slate-900">USD</option>
                    <option value="EUR" className="bg-slate-900">EUR</option>
                    <option value="GBP" className="bg-slate-900">GBP</option>
                  </select>
                </div>

                <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/8">
                  <label className="mb-2 block text-sm text-slate-300">Language</label>
                  <select
                    value={preferences.language}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, language: e.target.value }))
                    }
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm outline-none focus:border-cyan-400/40"
                  >
                    <option value="English" className="bg-slate-900">English</option>
                  </select>
                </div>

                <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/8 lg:col-span-2">
                  <label className="mb-2 block text-sm text-slate-300">Timezone</label>
                  <div className="relative">
                    <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={preferences.timezone}
                      onChange={(e) =>
                        setPreferences((p) => ({ ...p, timezone: e.target.value }))
                      }
                      className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm outline-none focus:border-cyan-400/40"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <Toggle
                  checked={showBalance}
                  onChange={(next) => setShowBalance(next)}
                  label="Default balance visibility"
                  description="Choose whether wallet balances are shown or hidden by default."
                />

                <Toggle
                  checked={preferences.compactMode}
                  onChange={(next) =>
                    setPreferences((p) => ({ ...p, compactMode: next }))
                  }
                  label="Compact interface mode"
                  description="Reduce spacing and card height for denser layouts."
                />

                <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/8">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-4 w-4 text-cyan-300" />
                    <div>
                      <div className="text-sm font-medium text-white">Current theme</div>
                      <div className="text-sm text-slate-400">Dark premium dashboard layout</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-emerald-500/10 p-4 ring-1 ring-emerald-400/15">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
                    <div>
                      <div className="text-sm font-medium text-emerald-200">
                        Preferences ready to sync
                      </div>
                      <div className="mt-1 text-sm text-emerald-100/80">
                        This page is ready for Firebase-backed settings persistence in the next step.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;

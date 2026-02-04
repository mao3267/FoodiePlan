"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { ProfileSection } from "@/components/settings/profile-section";
import { AuthenticationSection } from "@/components/settings/authentication-section";
import { AppearanceSection } from "@/components/settings/appearance-section";
import { NotificationsSection } from "@/components/settings/notifications-section";
import { AIConfigSection } from "@/components/settings/ai-config-section";
import { PrivacySection } from "@/components/settings/privacy-section";
import { DangerZoneSection } from "@/components/settings/danger-zone-section";
import type {
  ClientUserSettings,
  INotificationPreferences,
  IDefaultMealTimes,
} from "@/lib/types";

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-full" />
        </Card>
      ))}
    </div>
  );
}

export function SettingsPageContent() {
  const { data: session, status, update: updateSession } = useSession();
  const [settings, setSettings] = useState<ClientUserSettings | null>(null);
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    image: string;
    bio: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;

    Promise.all([
      fetch("/api/user/settings").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch settings");
        return res.json();
      }),
      fetch("/api/user/profile").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      }),
    ])
      .then(([settingsData, profileData]) => {
        setSettings(settingsData);
        setProfile(profileData);
      })
      .finally(() => setLoading(false));
  }, [status]);

  const saveSettings = useCallback(
    async (update: Partial<{
      notifications: INotificationPreferences;
      defaultMealTimes: IDefaultMealTimes;
      publicProfile: boolean;
    }>) => {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      const data: ClientUserSettings = await res.json();
      setSettings(data);
    },
    []
  );

  if (status === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl mb-8">Settings</h1>
        <SettingsSkeleton />
      </div>
    );
  }

  if (!session?.user || !settings || !profile) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl mb-8">Settings</h1>

      <div className="space-y-6">
        <ProfileSection
          name={profile.name}
          email={profile.email}
          image={profile.image}
          bio={profile.bio}
          onProfileSaved={(name, bio) => {
            setProfile((p) => (p ? { ...p, name, bio } : null));
            updateSession({ user: { ...session.user, name } });
          }}
        />

        <AuthenticationSection />

        <AppearanceSection />

        <NotificationsSection
          notifications={settings.notifications}
          defaultMealTimes={settings.defaultMealTimes}
          onNotificationsChange={(notifications) =>
            saveSettings({ notifications })
          }
          onMealTimesChange={(defaultMealTimes) =>
            saveSettings({ defaultMealTimes })
          }
        />

        <AIConfigSection
          hasGeminiKey={settings.hasGeminiKey}
          maskedGeminiKey={settings.maskedGeminiKey}
          onKeyChanged={(hasGeminiKey, maskedGeminiKey) =>
            setSettings((prev) =>
              prev ? { ...prev, hasGeminiKey, maskedGeminiKey } : null
            )
          }
        />

        <PrivacySection
          publicProfile={settings.publicProfile}
          onPublicProfileChange={(publicProfile) =>
            saveSettings({ publicProfile })
          }
        />

        <DangerZoneSection />
      </div>
    </div>
  );
}

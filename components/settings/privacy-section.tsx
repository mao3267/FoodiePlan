"use client";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Globe } from "lucide-react";

interface PrivacySectionProps {
  publicProfile: boolean;
  onPublicProfileChange: (value: boolean) => void;
}

export function PrivacySection({
  publicProfile,
  onPublicProfileChange,
}: PrivacySectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Privacy</h2>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="size-5 text-muted-foreground" />
          <div>
            <p className="font-medium">Public Profile</p>
            <p className="text-sm text-muted-foreground">
              Allow others to see your profile and posts
            </p>
          </div>
        </div>
        <Switch
          checked={publicProfile}
          onCheckedChange={onPublicProfileChange}
        />
      </div>
    </Card>
  );
}

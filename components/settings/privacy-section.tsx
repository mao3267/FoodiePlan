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
    <Card className="p-8">
      <h2 className="font-headline font-bold text-xl tracking-tight mb-6">Privacy</h2>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Globe className="size-5 text-primary" />
          <div>
            <p className="font-headline font-bold text-card-foreground">Public Profile</p>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">
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

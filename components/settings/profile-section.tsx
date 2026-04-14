"use client";

import { useState } from "react";
import { ImageWithFallback } from "@/components/figma/image-with-fallback";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

interface ProfileSectionProps {
  name: string;
  email: string;
  image: string;
  bio: string;
  onProfileSaved: (name: string, bio: string) => void;
}

export function ProfileSection({
  name,
  email,
  image,
  bio,
  onProfileSaved,
}: ProfileSectionProps) {
  const [editedName, setEditedName] = useState(name);
  const [editedBio, setEditedBio] = useState(bio);
  const [saving, setSaving] = useState(false);

  const hasChanges = editedName.trim() !== name || editedBio.trim() !== bio;

  async function handleSaveProfile() {
    const trimmedName = editedName.trim();
    const trimmedBio = editedBio.trim();
    
    if (!trimmedName) return;

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, bio: trimmedBio }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      onProfileSaved(trimmedName, trimmedBio);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save profile";
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-8">
      <h2 className="font-headline font-bold text-xl tracking-tight mb-6">Profile</h2>

      <div className="flex items-center gap-6 mb-6">
        <ImageWithFallback
          src={image}
          alt="Profile"
          className="size-24 rounded-full object-cover ring-2 ring-border"
        />
        <div className="flex-1">
          <h3 className="font-headline font-bold mb-1 text-card-foreground">Profile Picture</h3>
          <p className="text-sm text-muted-foreground font-medium">
            Managed by your Google account
          </p>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="space-y-5">
        <div>
          <Label htmlFor="name" className="text-xs font-headline font-bold tracking-widest uppercase text-muted-foreground">
            Full Name
          </Label>
          <Input
            id="name"
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="email" className="text-xs font-headline font-bold tracking-widest uppercase text-muted-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="bio" className="text-xs font-headline font-bold tracking-widest uppercase text-muted-foreground">
            Bio
          </Label>
          <Textarea
            id="bio"
            value={editedBio}
            onChange={(e) => setEditedBio(e.target.value)}
            className="mt-2 rounded-2xl bg-muted border-none resize-none focus-visible:ring-2 focus-visible:ring-primary/30"
            rows={4}
            maxLength={500}
            placeholder="Tell us a little about yourself..."
          />
          <p className="text-xs text-muted-foreground mt-1 text-right font-medium">
            {editedBio.length}/500
          </p>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleSaveProfile}
            disabled={!hasChanges || saving}
            className="signature-gradient text-white font-headline font-bold rounded-full px-7 py-5 hover:opacity-90 active:scale-95 transition-transform"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

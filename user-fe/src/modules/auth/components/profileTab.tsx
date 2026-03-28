// tabs/ProfileTab.tsx

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AvatarUpload } from "./avatarUpload";

type Profile = {
  avatar: string;
  fullName: string;
  email: string;
  bio?: string;
};

type ProfileTabProps = {
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
};

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  setProfile,
}) => {
  return (
    <div className="space-y-6">
      <AvatarUpload
        avatar={profile.avatar}
        onChange={(file) => {
          const url = URL.createObjectURL(file);
          setProfile((prev) => ({ ...prev, avatar: url }));
        }}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <Input
          value={profile.fullName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setProfile((prev) => ({
              ...prev,
              fullName: e.target.value,
            }))
          }
          placeholder="Họ và tên"
        />

        <Input
          value={profile.email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setProfile((prev) => ({
              ...prev,
              email: e.target.value,
            }))
          }
          placeholder="Email"
        />
      </div>

      <Textarea
        placeholder="Bio..."
        value={profile.bio || ""}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setProfile((prev) => ({
            ...prev,
            bio: e.target.value,
          }))
        }
      />
    </div>
  );
};
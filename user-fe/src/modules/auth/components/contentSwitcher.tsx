// sections/Content.tsx

import React from "react";
import { ProfileTab } from "./profileTab";
import { AddressTab } from "./addressTab";
import { PasswordTab } from "./passWordTab";


// các tab hợp lệ
type TabType = "profile" | "address" | "password";

// type state cho từng tab
type ProfileState = {
  user: any; // nếu có type User thì thay vào
  onUpdate: (data: any) => void;
};

type AddressState = {
  addresses: any[];
  onAdd?: () => void;
  onEdit?: (addr: any) => void;
  onDelete?: (id: string) => void;
};

// union type
type ContentProps = {
  tab: TabType;
  state: ProfileState | AddressState;
};

export const Content: React.FC<ContentProps> = ({ tab, state }) => {
  switch (tab) {
    case "profile":
      return <ProfileTab profile={{
        avatar: "",
        fullName: "",
        email: "",
        bio: undefined
      }} setProfile={function (value: React.SetStateAction<{ avatar: string; fullName: string; email: string; bio?: string; }>): void {
        throw new Error("Function not implemented.");
      } } {...(state as ProfileState)} />;

    case "address":
      return <AddressTab {...(state as AddressState)} />;

    case "password":
      return <PasswordTab />;

    default:
      return null;
  }
};
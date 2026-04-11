// hooks/useAccount.ts
import { useState } from "react";

export const useAccount = () => {
  const [tab, setTab] = useState("profile");

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    avatar: ""
  });

  const [addresses, setAddresses] = useState([]);

  return {
    tab,
    setTab,
    profile,
    setProfile,
    addresses,
    setAddresses
  };
};
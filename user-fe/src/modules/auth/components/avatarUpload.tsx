// blocks/AvatarUpload.tsx
import { Upload } from "lucide-react";
import React from "react";
type AvatarUploadProps = {
  avatar:string
  onChange?:(file:File) => void;
}
export const AvatarUpload:React.FC<AvatarUploadProps> = ({ avatar,onChange, }) => {
  const HandleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
    const file = e.target.files?.[0];
    if (file){
      onChange?.(file);
    }
  }
  return (
     <div className="flex justify-center">
      <div className="relative">
        <img
          src={avatar}
          alt="avatar"
          className="w-32 h-32 rounded-full object-cover"
        />

        {/* hidden input */}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="avatar-upload"
          onChange={HandleFileChange}
        />

        <label
          htmlFor="avatar-upload"
          className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer"
        >
          <Upload size={16} />
        </label>
      </div>
    </div>
  );
};
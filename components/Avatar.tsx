// components/Avatar.tsx
import React from "react";
import { stringToHslColor } from "@/lib/color";

type AvatarProps = {
  name: string;
  size?: number;
};

export default function Avatar({ name, size = 48 }: AvatarProps) {
  const letter = name.charAt(0).toUpperCase();
  const bg = stringToHslColor(name);

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: bg,
      }}
      className="rounded-full flex items-center justify-center font-semibold text-white shadow-sm select-none"
    >
      {letter}
    </div>
  );
}

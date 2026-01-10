"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme();

  const handleSwitch = () => {
    if (theme === "light") {
      setTheme("dark");
      return;
    }

    setTheme("light");
  };

  return (
    <Button
      variant="outline"
      onClick={handleSwitch}
      className="border-none bg-transparent"
    >
      {theme === "light" ? <Moon /> : <Sun />}
    </Button>
  );
};

export default ThemeSwitch;

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

interface UserShortcutsProps {
  links: { href: string; label: string }[];
}

const ShortcutLinks = ({ links }: UserShortcutsProps) => {
  const backgrounds = [
    "bg-lamaSkyLight",
    "bg-lamaPurpleLight",
    "bg-lamaYellowLight",
    "bg-pink-50",
  ];

  return (
    <Card className="border-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Shortcuts</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex w-full flex-wrap gap-4 p-1">
          {links.map((link, index) => (
            <Link
              key={index}
              className={`bg-lamaSkyLight rounded-md p-2 text-xs text-gray-600 ${backgrounds[index % links.length]}`}
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
export default ShortcutLinks;

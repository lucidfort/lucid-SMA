import { cn } from "@/lib/utils";
import Link from "next/link";

const ShortcutLinks = ({ links }: { links: { href: string; className?: string; label: string; }[] }) => {
    return (
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
            {links.map(link => (
                <Link
                    key={link.label}
                    className={cn("rounded-md bg-lamaPurpleLight p-3", link.className)}
                    href={link.href}
                >
                    {link.label}
                </Link>
            ))}
        </div>
    )
}

export default ShortcutLinks
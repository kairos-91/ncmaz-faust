import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  height = 28,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/logo-light.png"
        alt="Levery"
        width={height * (1081 / 407)}
        height={height}
        className="block h-auto dark:hidden"
        style={{ height }}
        priority
      />
      <Image
        src="/logo-dark.png"
        alt="Levery"
        width={height * (500 / 200)}
        height={height}
        className="hidden h-auto dark:block"
        style={{ height }}
        priority
      />
    </span>
  );
}

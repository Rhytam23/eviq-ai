import { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1180px] px-5 md:px-[28px]", className)}>
      {children}
    </div>
  );
}

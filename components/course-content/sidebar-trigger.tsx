"use client";
import { SidebarTrigger, useSidebar } from "../ui/sidebar";

export default function CourseContentSidebarTrigger() {
  const { open, isMobile } = useSidebar();
  return (
    (isMobile || !open) && (
      <SidebarTrigger className="w-fit px-5 py-4 bg-zenite-primary-light text-primary-foreground rounded-r-md rounded-l-none shadow-sm shadow-black/30">
        Menu
      </SidebarTrigger>
    )
  );
}

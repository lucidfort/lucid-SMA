import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarLink,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { menuItems } from "@/lib/constants";
import { RoleAccessLevel } from "@/types";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import SignOutButton from "../SignOutButton";
import { defaultHome } from "@/lib/settings";

const Menu = async ({
  accessLevel,
  school,
}: {
  accessLevel: RoleAccessLevel;
  school: { logo?: string | null; name: string };
}) => {
  const home = defaultHome[accessLevel] || "/";

  return (
    <Sidebar className="h-screen">
      <SidebarHeader className="flex-row items-center">
        <Image
          src={school.logo || "/logo.webp"}
          alt="Logo"
          width={100}
          height={100}
          loading="eager"
          priority={true}
          fetchPriority="low"
          className="h-20 w-20 rounded-full object-center"
        />

        <h2 className="line-clamp-2 text-base">{school.name}</h2>
      </SidebarHeader>
      <SidebarContent>
        {menuItems.map(({ title, items, visible }) => (
          <div key={title}>
            {visible.includes(accessLevel) && (
              <SidebarGroup key={title}>
                <SidebarGroupLabel>{title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-3">
                    {items.map((item) => {
                      if (item.visible.includes(accessLevel)) {
                        if (item.grouped) {
                          return (
                            <Collapsible
                              key={item.label}
                              className="group/collapsible"
                            >
                              <SidebarGroup className="p-0">
                                <SidebarGroupLabel>
                                  <CollapsibleTrigger className="flex w-full flex-row items-center justify-between">
                                    <div className="flex items-center gap-2 text-base font-medium">
                                      <Image
                                        src={item.icon}
                                        alt={item.label}
                                        width={20}
                                        height={20}
                                        title={item.label}
                                      />
                                      {item.label}
                                    </div>
                                    <ChevronDown className="transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                  </CollapsibleTrigger>
                                </SidebarGroupLabel>
                                <CollapsibleContent>
                                  <SidebarGroupContent className="ml-2">
                                    <SidebarMenu>
                                      {item.links.map((link) => (
                                        <SidebarMenuItem key={link.label}>
                                          <SidebarLink href={link.href}>
                                            <span>{link.label}</span>
                                          </SidebarLink>
                                        </SidebarMenuItem>
                                      ))}
                                    </SidebarMenu>
                                  </SidebarGroupContent>
                                </CollapsibleContent>
                              </SidebarGroup>
                            </Collapsible>
                          );
                        }

                        return (
                          <SidebarMenuItem key={item.label}>
                            <SidebarLink
                              href={item.label === "Home" ? home : item.href!}
                            >
                              <Image
                                src={item.icon}
                                alt={item.label}
                                width={20}
                                height={20}
                                title={item.label}
                              />
                              <span>{item.label}</span>
                            </SidebarLink>
                          </SidebarMenuItem>
                        );
                      }
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </div>
        ))}

        <SidebarMenuItem className="flex-center w-full pl-2.5">
          <SignOutButton />
        </SidebarMenuItem>
      </SidebarContent>
    </Sidebar>
  );
};

export default Menu;

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
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { menuItems } from "@/constants";
import { RoleAccessLevel } from "@/types";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import SignOutButton from "./SignOutButton";
import { School } from "@/lib/generated/graphql/server";
import { defaultHome } from "@/lib/settings";

type SchoolDetails = Pick<School, "name" | "motto" | "slug" | "logo">;

const Menu = async ({
  accessLevel,
  school,
}: {
  accessLevel: RoleAccessLevel;
  school: SchoolDetails;
}) => {
  return (
    <Sidebar className="h-screen">
      <SidebarHeader className="flex-row items-center">
        <Image
          src={school.logo || "/logo.svg"}
          alt="Logo"
          width={100}
          height={100}
          priority={true}
          fetchPriority="low"
          className="h-20 w-20 rounded-full object-center"
        />

        <div>
          <h2>{school.name}</h2>
          <p className="text-xs text-gray-500">{school.motto}</p>
        </div>
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
                                    <div className="flex items-center gap-2 text-lg sm:text-base">
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
                              href={
                                item.label === "Home"
                                  ? `${defaultHome[accessLevel]}`
                                  : item.href!
                              }
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Icons } from "@/components/ui/icons";

interface MainNavProps {
  className?: string;
}

const games = [
  {
    title: "Memory",
    href: "/games/mode",
    description: "Testez votre mémoire et gagnez des points en trouvant les paires identiques.",
    icon: "gamepad",
  },
  {
    title: "Jackpot",
    href: "/games/jackpot",
    description: "Participez aux tirages au sort pour gagner le jackpot.",
    icon: "star",
  },
  {
    title: "Jackpot Communautaire",
    href: "/games/community-jackpot",
    description: "Jouez avec votre communauté pour gagner des récompenses collectives.",
    icon: "shop",
  },
];

const rewards = [
  {
    title: "Communautés",
    href: "/communities",
    description: "Rejoignez ou créez des communautés pour participer à des causes ensemble.",
    icon: "shop",
  },
  {
    title: "Boutique",
    href: "/shop",
    description: "Échangez vos points contre des récompenses exclusives.",
    icon: "shop",
  },
  {
    title: "Acheter des points",
    href: "/buy-points",
    description: "Achetez des points pour participer aux jeux et soutenir des causes.",
    icon: "shop",
  },
];

export function MainNav({ className }: MainNavProps) {
  const pathname = usePathname();

  return (
    <NavigationMenu className={cn("max-w-full justify-start", className)}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-10 text-base">
            Jeux
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[500px] gap-3 p-4 md:w-[600px] md:grid-cols-2 lg:w-[700px]">
              {games.map((game) => (
                <li key={game.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={game.href}
                      className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        pathname === game.href ? "bg-accent" : "transparent"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icons.gamepad className="h-5 w-5" />
                        <div className="text-sm font-medium leading-none">{game.title}</div>
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {game.description}
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="h-10 text-base">
            Récompenses
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[500px] gap-3 p-4 md:w-[600px] md:grid-cols-2 lg:w-[700px]">
              {rewards.map((reward) => (
                <li key={reward.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={reward.href}
                      className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        pathname === reward.href ? "bg-accent" : "transparent"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icons.shop className="h-5 w-5" />
                        <div className="text-sm font-medium leading-none">{reward.title}</div>
                      </div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {reward.description}
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

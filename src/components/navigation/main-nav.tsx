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
    href: "/games/memory",
    description: "Testez votre mémoire et gagnez des points en trouvant les paires identiques.",
    icon: "gamepad",
  },
  {
    title: "Blackjack",
    href: "/games/blackjack",
    description: "Le jeu de cartes classique du casino, affrontez le croupier pour gagner.",
    icon: "cards",
  },
  {
    title: "Machines à sous",
    href: "/games/slots",
    description: "Tentez votre chance sur nos machines à sous colorées et gagnantes.",
    icon: "slot",
  },
];

const rewards = [
  {
    title: "Boutique",
    href: "/shop",
    description: "Échangez vos points contre des récompenses exclusives.",
    icon: "shop",
  },
  {
    title: "Classement",
    href: "/leaderboard",
    description: "Découvrez les meilleurs joueurs et votre position dans le classement.",
    icon: "trophy",
  },
  {
    title: "Programme VIP",
    href: "/vip",
    description: "Accédez à des avantages exclusifs en devenant membre VIP.",
    icon: "star",
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
        <NavigationMenuItem>
          <Link href="/help" legacyBehavior passHref>
            <NavigationMenuLink className={cn(
              "h-10 px-4 py-2 text-base hover:text-accent-foreground inline-flex items-center justify-center rounded-md font-medium transition-colors hover:bg-accent focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
              pathname === "/help" ? "bg-accent text-accent-foreground" : "transparent"
            )}>
              Aide
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

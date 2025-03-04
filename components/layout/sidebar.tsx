'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  BarChart3,
  CalendarDays,
  Home,
  ListTodo,
  Settings,
  Sparkles,
  Target,
  Zap,
  BookOpen,
  Users,
  Briefcase,
  FileText,
  HelpCircle,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const sidebarNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Decisions',
    href: '/decisions',
    icon: ListTodo,
  },
  {
    title: 'Timeline',
    href: '/timeline',
    icon: CalendarDays,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    title: 'Goals',
    href: '/goals',
    icon: Target,
  },
  {
    title: 'AI Insights',
    href: '/insights',
    icon: Sparkles,
    badge: 'Beta',
  },
  {
    title: 'Quick Actions',
    href: '/actions',
    icon: Zap,
  },
  {
    section: 'Workspace',
    items: [
      {
        title: 'Projects',
        href: '/projects',
        icon: Briefcase,
      },
      {
        title: 'Documents',
        href: '/documents',
        icon: FileText,
      },
      {
        title: 'Team',
        href: '/team',
        icon: Users,
      },
    ],
  },
  {
    section: 'Support',
    items: [
      {
        title: 'Knowledge Base',
        href: '/knowledge',
        icon: BookOpen,
      },
      {
        title: 'Help & Support',
        href: '/support',
        icon: HelpCircle,
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
      },
    ],
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

const SidebarItem = ({ item, pathname }: { item: any; pathname: string }) => {
  return (
    <Button
      asChild
      variant={pathname === item.href ? 'secondary' : 'ghost'}
      className={cn(
        'w-full justify-start sidebar-item relative',
        pathname === item.href && 'active'
      )}
    >
      <Link href={item.href} className="flex items-center w-full">
        <item.icon className="mr-2 h-4 w-4" />
        <span className="flex-1">{item.title}</span>
        {item.badge && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground whitespace-nowrap"
          >
            {item.badge}
          </motion.span>
        )}
      </Link>
    </Button>
  );
};

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [pathname, isMobile]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isOpen || !isMobile ? 0 : -250,
          opacity: 1
        }}
        className={cn(
          "fixed left-0 top-0 bottom-0 w-[250px] z-50",
          "border-r bg-gradient-to-b from-background via-background/95 to-background/90",
          "transition-transform duration-300 ease-in-out",
          isMobile ? "shadow-xl" : ""
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-2 px-6 border-b">
            <Link className="flex items-center gap-2 font-semibold" href="/">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary"
              >
                <BarChart3 className="h-4 w-4 text-primary-foreground" />
              </motion.div>
              <span className="text-xl font-bold">Deci</span>
            </Link>
          </div>

          <ScrollArea className="flex-1 py-6">
            <motion.nav
              variants={container}
              initial="hidden"
              animate="show"
              className="grid gap-4 px-4"
            >
              {sidebarNavItems.map((item, index) => {
                if ('section' in item) {
                  return (
                    <motion.div key={index} variants={item} className="space-y-3">
                      <div className="px-4 text-xs font-semibold uppercase text-muted-foreground">
                        {item.section}
                      </div>
                      {item.items.map((subItem, subIndex) => (
                        <SidebarItem key={subIndex} item={subItem} pathname={pathname} />
                      ))}
                    </motion.div>
                  );
                }
                return (
                  <motion.div key={index} variants={item}>
                    <SidebarItem item={item} pathname={pathname} />
                  </motion.div>
                );
              })}
            </motion.nav>
          </ScrollArea>
        </div>
      </motion.div>

      {/* Mobile Navigation */}
      <div className="mobile-nav">
        <div className="flex justify-around py-2">
          {sidebarNavItems.slice(0, 5).map((item, index) => {
            if ('section' in item) return null;
            const Icon = item.icon;
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  'mobile-nav-item',
                  pathname === item.href && 'text-primary'
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs mt-1">{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
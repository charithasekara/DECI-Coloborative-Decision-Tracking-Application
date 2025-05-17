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
  LogOut,
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

// Animation variants for sidebar items
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

// SidebarItem component for rendering each navigation item
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

  // Handle window resize to detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on route change in mobile view
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
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isMobile ? (isOpen ? 0 : -256) : 0,
          width: isMobile ? (isOpen ? 256 : 0) : 256,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'sidebar fixed top-0 bottom-0 w-64 border-r bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60',
          'flex flex-col transition-all duration-300'
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold text-foreground"
            >
              Deci
            </motion.span>
          </Link>
        </div>

        {/* Sidebar Content */}
        <ScrollArea className="flex-1 px-3 py-4">
          <motion.nav variants={container} initial="hidden" animate="show" className="space-y-1">
            {sidebarNavItems.map((navItem, index) =>
              navItem.section ? (
                <div key={index} className="space-y-1 pt-4">
                  <motion.h4
                    variants={item}
                    className="px-3 text-xs font-semibold uppercase text-muted-foreground"
                  >
                    {navItem.section}
                  </motion.h4>
                  {navItem.items.map((subItem: any, subIndex: number) => (
                    <motion.div key={subIndex} variants={item}>
                      <SidebarItem item={subItem} pathname={pathname} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div key={index} variants={item}>
                  <SidebarItem item={navItem} pathname={pathname} />
                </motion.div>
              )
            )}
          </motion.nav>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="border-t p-4">
          <Button variant="ghost" className="w-full justify-center sidebar-item cursor-pointer border-2 hover:bg-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </Button>
        </div>
      </motion.div>

      {/* Mobile Bottom Navigation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mobile-nav md:hidden"
      >
        <div className="flex justify-around">
          {sidebarNavItems
            .filter((item) => !item.section)
            .slice(0, 5)
            .map((item, index) => (
              <Button
                key={index}
                asChild
                variant="ghost"
                className={cn('mobile-nav-item', pathname === item.href && 'text-primary')}
              >
                <Link href={item.href || '#'}>
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span className="text-xs mt-1">{item.title}</span>
                </Link>
              </Button>
            ))}
        </div>
      </motion.div>
    </>
  );
}
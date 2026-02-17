import { Outlet } from 'react-router'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-media-query'
import { useSidebarStore } from '@/stores/sidebar.store'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Header } from '@/components/layout/header'
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from '@/components/ui/sheet'

export function AppLayout() {
  const isMobile = useIsMobile()
  const { isOpen, close } = useSidebarStore()

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      {!isMobile && (
        <div className="hidden md:block">
          <Sidebar />
        </div>
      )}

      {/* Mobile sidebar sheet */}
      {isMobile && (
        <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
          <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
            <SheetTitle className="sr-only">Menu de navegacao</SheetTitle>
            <Sidebar />
          </SheetContent>
        </Sheet>
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />

        <main
          className={cn(
            'flex-1 overflow-y-auto',
            'px-4 py-6 md:px-6 lg:px-8',
            'pb-20 md:pb-6'
          )}
        >
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>

        {/* Mobile bottom navigation */}
        {isMobile && <MobileNav />}
      </div>
    </div>
  )
}

import { PageHeader } from '@/components/common/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileSettings } from '@/features/settings/components/profile-settings'
import { AppearanceSettings } from '@/features/settings/components/appearance-settings'
import { CategoryManager } from '@/features/transactions/components/category-manager'
import { DataSettings } from '@/features/settings/components/data-settings'
import { AccountSettings } from '@/features/settings/components/account-settings'

function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Configuracoes"
        description="Gerencie seu perfil e preferencias"
      />

      <Tabs defaultValue="profile">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="appearance">Aparencia</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
          <TabsTrigger value="data">Dados</TabsTrigger>
          <TabsTrigger value="account">Conta</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <AppearanceSettings />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <CategoryManager />
        </TabsContent>

        <TabsContent value="data" className="mt-6">
          <DataSettings />
        </TabsContent>

        <TabsContent value="account" className="mt-6">
          <AccountSettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingsPage
export { SettingsPage as Component }

import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { toast } from 'sonner'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useTheme } from '@/hooks/use-theme'
import { useUpdateProfile } from '@/features/auth/hooks/use-profile'
import { cn } from '@/lib/utils'

const themes = [
  {
    value: 'light' as const,
    label: 'Claro',
    icon: Sun,
    preview: {
      bg: 'bg-white',
      sidebar: 'bg-gray-100',
      card: 'bg-white border-gray-200',
      text: 'bg-gray-300',
      textSm: 'bg-gray-200',
      accent: 'bg-blue-500',
    },
  },
  {
    value: 'dark' as const,
    label: 'Escuro',
    icon: Moon,
    preview: {
      bg: 'bg-gray-950',
      sidebar: 'bg-gray-900',
      card: 'bg-gray-900 border-gray-800',
      text: 'bg-gray-600',
      textSm: 'bg-gray-700',
      accent: 'bg-blue-500',
    },
  },
  {
    value: 'system' as const,
    label: 'Sistema',
    icon: Monitor,
    preview: {
      bg: 'bg-gradient-to-r from-white to-gray-950',
      sidebar: 'bg-gradient-to-r from-gray-100 to-gray-900',
      card: 'bg-gradient-to-r from-white to-gray-900 border-gray-400',
      text: 'bg-gradient-to-r from-gray-300 to-gray-600',
      textSm: 'bg-gradient-to-r from-gray-200 to-gray-700',
      accent: 'bg-blue-500',
    },
  },
]

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const updateProfile = useUpdateProfile()

  function handleThemeChange(value: 'dark' | 'light' | 'system') {
    setTheme(value)
    updateProfile.mutate(
      { preferred_theme: value },
      {
        onError: () => {
          toast.error('Erro ao salvar preferência de tema.')
        },
      }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aparência</CardTitle>
        <CardDescription>
          Personalize a aparência do aplicativo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {themes.map((option) => {
            const isActive = theme === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleThemeChange(option.value)}
                className={cn(
                  'group relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all hover:border-primary/50',
                  isActive
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border bg-card'
                )}
              >
                {/* Mini preview */}
                <div
                  className={cn(
                    'w-full overflow-hidden rounded-lg border',
                    option.preview.card
                  )}
                >
                  <div className={cn('flex h-24', option.preview.bg)}>
                    {/* Sidebar mockup */}
                    <div
                      className={cn(
                        'w-8 shrink-0 border-r p-1.5',
                        option.preview.sidebar
                      )}
                    >
                      <div
                        className={cn(
                          'mb-1.5 h-1.5 w-full rounded-full',
                          option.preview.accent
                        )}
                      />
                      <div
                        className={cn(
                          'mb-1 h-1 w-full rounded-full',
                          option.preview.textSm
                        )}
                      />
                      <div
                        className={cn(
                          'mb-1 h-1 w-full rounded-full',
                          option.preview.textSm
                        )}
                      />
                      <div
                        className={cn(
                          'h-1 w-full rounded-full',
                          option.preview.textSm
                        )}
                      />
                    </div>
                    {/* Content area mockup */}
                    <div className="flex-1 p-2">
                      <div
                        className={cn(
                          'mb-2 h-1.5 w-12 rounded-full',
                          option.preview.text
                        )}
                      />
                      <div className="flex gap-1.5">
                        <div
                          className={cn(
                            'h-8 flex-1 rounded',
                            option.preview.card
                          )}
                        />
                        <div
                          className={cn(
                            'h-8 flex-1 rounded',
                            option.preview.card
                          )}
                        />
                      </div>
                      <div
                        className={cn(
                          'mt-1.5 h-1 w-16 rounded-full',
                          option.preview.textSm
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Label */}
                <div className="flex items-center gap-2">
                  <option.icon className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{option.label}</span>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

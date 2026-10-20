import { type ReactNode } from "react";
import { Bell, Eye, LayoutList, Palette } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { ConfigCard } from "./config-card";

export type ThemePreference = "light" | "dark" | "system";

interface PreferencesCardProps {
  compactMode: boolean;
  setCompactMode: (checked: boolean) => void;
  setShowReadNotifications: (checked: boolean) => void;
  setTheme: (theme: string) => void;
  showReadNotifications: boolean;
  theme: string | undefined;
}

export function PreferencesCard({
  compactMode,
  setCompactMode,
  setShowReadNotifications,
  setTheme,
  showReadNotifications,
  theme,
}: PreferencesCardProps) {
  return (
    <ConfigCard
      description="Ajustes locais para deixar a interface mais próxima do seu uso."
      icon={Palette}
      title="Personalização"
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 rounded-md border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Eye className="mt-0.5 size-4 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Tema
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Escolha entre claro, escuro ou preferência do sistema.
              </p>
            </div>
          </div>
          <Select
            value={(theme ?? "light") as ThemePreference}
            onValueChange={(value: ThemePreference) => setTheme(value)}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Tema" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Claro</SelectItem>
              <SelectItem value="dark">Escuro</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <PreferenceSwitch
          checked={compactMode}
          description="Reduz espaçamentos em listas de configuração e notificações."
          icon={
            <LayoutList className="size-4 text-gray-500 dark:text-gray-400" />
          }
          label="Visualização compacta"
          onCheckedChange={setCompactMode}
        />

        <PreferenceSwitch
          checked={showReadNotifications}
          description="Inclui notificações já lidas na lista desta tela."
          icon={<Bell className="size-4 text-gray-500 dark:text-gray-400" />}
          label="Mostrar notificações lidas"
          onCheckedChange={setShowReadNotifications}
        />
      </div>
    </ConfigCard>
  );
}

function PreferenceSwitch({
  checked,
  description,
  icon,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  description: string;
  icon: ReactNode;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-gray-200 p-4 dark:border-gray-700">
      <div className="flex items-start gap-3">
        {icon}
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {label}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="data-[state=checked]:bg-blue-600 dark:data-[state=checked]:bg-blue-500"
      />
    </div>
  );
}

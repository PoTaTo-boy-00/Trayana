"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { User } from "@supabase/auth-helpers-nextjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Globe,
  Lock,
  MessageSquare,
  User as UserIcon,
  Eye,
} from "lucide-react";
import { translations } from "@/lib/translation";

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (path: string) => path,
});

export default function SettingsPage(): JSX.Element {
  const supabase = createClientComponentClient();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>("en");

  // Translation function that safely returns string or fallback path
  const t = (path: string): string => {
    const keys = path.split(".");
    let result: any = translations[language] || translations["en"]; // Fallback to English
    for (const key of keys) {
      if (!result) {
        console.warn(
          `Translation missing for path: ${path}, falling back to English`
        );
        return path;
      }
      result = result[key];
    }
    if (typeof result !== "string") {
      console.warn(
        `Translation not string for path: ${path}, falling back to English`
      );
      return path;
    }
    return result;
  };

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("Failed to fetch user:", error);
          setUser(null);
        } else {
          setUser(user);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [supabase]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
        <main className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold tracking-tight">
              {t("settings.title")}
            </h2>
          </div>

          <Tabs defaultValue="account" className="space-y-4">
            <TabsList>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                {t("settings.tabs.account")}
              </TabsTrigger>
              <TabsTrigger value="language" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {t("settings.tabs.language")}
              </TabsTrigger>
              {/* <TabsTrigger value="security" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {t("settings.tabs.security")}
              </TabsTrigger> */}
              {/* <TabsTrigger
                value="accessibility"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {t("settings.tabs.accessibility")}
              </TabsTrigger> */}
              <TabsTrigger
                value="communications"
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                {t("settings.tabs.communications")}
              </TabsTrigger>
            </TabsList>

            {/* Account */}
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>{t("settings.accountSettings.title")}</CardTitle>
                  <CardDescription>
                    {t("settings.accountSettings.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <p>{t("settings.accountSettings.loading")}</p>
                  ) : user ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          {t("settings.accountSettings.emailLabel")}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue={user.email ?? ""}
                          readOnly
                        />
                      </div>
                      <Button>
                        {t("settings.accountSettings.saveButton")}
                      </Button>
                    </>
                  ) : (
                    <p>{t("settings.accountSettings.userNotFound")}</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Language */}
            <TabsContent value="language">
              <Card>
                <CardHeader>
                  <CardTitle>{t("settings.languageSettings.title")}</CardTitle>
                  <CardDescription>
                    {t("settings.languageSettings.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language-select">
                      {t("settings.languageSettings.languageLabel")}
                    </Label>
                    <Select
                      value={language}
                      onValueChange={(value) => setLanguage(value)}
                    >
                      <SelectTrigger id="language-select">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिंदी</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Accessibility */}
            <TabsContent value="accessibility">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("settings.accessibilitySettings.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("settings.accessibilitySettings.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>
                      {t("settings.accessibilitySettings.highContrastLabel")}
                    </Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>
                      {t("settings.accessibilitySettings.reduceMotionLabel")}
                    </Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>
                      {t("settings.accessibilitySettings.screenReaderLabel")}
                    </Label>
                    <Switch />
                  </div>
                  <Button>
                    {t("settings.accessibilitySettings.saveButton")}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Communications */}
            <TabsContent value="communications">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("settings.communicationSettings.title")}
                  </CardTitle>
                  <CardDescription>
                    {t("settings.communicationSettings.description")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>
                      {t("settings.communicationSettings.newslettersLabel")}
                    </Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>
                      {t("settings.communicationSettings.productUpdatesLabel")}
                    </Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>
                      {t(
                        "settings.communicationSettings.feedbackRequestsLabel"
                      )}
                    </Label>
                    <Switch />
                  </div>
                  <Button>
                    {t("settings.communicationSettings.saveButton")}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </LanguageContext.Provider>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { useSettings, SiteSettings } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Save, Type, Palette, FileText } from "lucide-react";

const availableFonts = [
  { value: "Inter", label: "Inter" },
  { value: "Poppins", label: "Poppins" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Merriweather", label: "Merriweather" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Source Sans Pro", label: "Source Sans Pro" },
  { value: "system-ui", label: "System UI" },
];

const SiteSettingsTab = () => {
  const [settings, setSettings] = useSettings();
  const { toast } = useToast();

  // Local state for all settings
  const [localSettings, setLocalSettings] = useState<SiteSettings>(settings);

  // Update local state when settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = (field: keyof SiteSettings, value: string | number) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setSettings(() => localSettings);
    toast({ title: "Settings saved!", description: "Your changes have been applied." });
  };

  const handleReset = () => {
    setLocalSettings(settings);
    toast({ title: "Changes discarded", description: "Settings have been reset to last saved values." });
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="font-serif text-xl">Site Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <p className="text-xs text-muted-foreground mb-1.5">
                This name appears in the navbar, footer, hero, and page title.
              </p>
              <Input
                id="businessName"
                value={localSettings.businessName}
                onChange={(e) => handleChange("businessName", e.target.value)}
                maxLength={50}
              />
            </div>
          </TabsContent>

          {/* Typography Settings */}
          <TabsContent value="typography" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="headingFont">Heading Font</Label>
                <p className="text-xs text-muted-foreground mb-1.5">Font for headings and titles</p>
                <select
                  id="headingFont"
                  value={localSettings.headingFont}
                  onChange={(e) => handleChange("headingFont", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  {availableFonts.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="bodyFont">Body Font</Label>
                <p className="text-xs text-muted-foreground mb-1.5">Font for paragraph text</p>
                <select
                  id="bodyFont"
                  value={localSettings.bodyFont}
                  onChange={(e) => handleChange("bodyFont", e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  {availableFonts.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="baseFontSize">Base Font Size (px)</Label>
              <p className="text-xs text-muted-foreground mb-1.5">
                Base size for body text (default: 16px)
              </p>
              <Input
                id="baseFontSize"
                type="number"
                min="12"
                max="24"
                value={localSettings.baseFontSize}
                onChange={(e) => handleChange("baseFontSize", e.target.value)}
              />
            </div>

            <div>
              <Label>Heading Scale: {localSettings.headingScale}</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Size multiplier for headings (default: 1.2)
              </p>
              <Slider
                value={[localSettings.headingScale]}
                onValueChange={([value]) => handleChange("headingScale", value)}
                min={1}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>
          </TabsContent>

          {/* Color Settings */}
          <TabsContent value="colors" className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <p className="text-xs text-muted-foreground mb-1.5">Main brand color</p>
                <div className="flex gap-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={localSettings.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={localSettings.primaryColor}
                    onChange={(e) => handleChange("primaryColor", e.target.value)}
                    placeholder="#6366f1"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <p className="text-xs text-muted-foreground mb-1.5">Accent brand color</p>
                <div className="flex gap-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={localSettings.secondaryColor}
                    onChange={(e) => handleChange("secondaryColor", e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={localSettings.secondaryColor}
                    onChange={(e) => handleChange("secondaryColor", e.target.value)}
                    placeholder="#8b5cf6"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="accentColor">Accent Color</Label>
                <p className="text-xs text-muted-foreground mb-1.5">Highlight color</p>
                <div className="flex gap-2">
                  <Input
                    id="accentColor"
                    type="color"
                    value={localSettings.accentColor}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    className="w-16 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={localSettings.accentColor}
                    onChange={(e) => handleChange("accentColor", e.target.value)}
                    placeholder="#f59e0b"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Color Preview */}
            <div className="p-4 rounded-lg border border-border space-y-2">
              <p className="text-xs text-muted-foreground">Color Preview</p>
              <div className="flex gap-2">
                <div
                  className="h-12 w-full rounded-md flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: localSettings.primaryColor }}
                >
                  Primary
                </div>
                <div
                  className="h-12 w-full rounded-md flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: localSettings.secondaryColor }}
                >
                  Secondary
                </div>
                <div
                  className="h-12 w-full rounded-md flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: localSettings.accentColor }}
                >
                  Accent
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Content Settings */}
          <TabsContent value="content" className="space-y-4">
            <div>
              <Label htmlFor="heroTitle">Hero Title</Label>
              <p className="text-xs text-muted-foreground mb-1.5">Main heading on the home page</p>
              <Input
                id="heroTitle"
                value={localSettings.heroTitle}
                onChange={(e) => handleChange("heroTitle", e.target.value)}
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
              <p className="text-xs text-muted-foreground mb-1.5">Description text below the hero title</p>
              <Textarea
                id="heroSubtitle"
                value={localSettings.heroSubtitle}
                onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                maxLength={300}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="heroCtaText">Hero CTA Button Text</Label>
              <p className="text-xs text-muted-foreground mb-1.5">Text for the main call-to-action button</p>
              <Input
                id="heroCtaText"
                value={localSettings.heroCtaText}
                onChange={(e) => handleChange("heroCtaText", e.target.value)}
                maxLength={50}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-border">
          <Button onClick={handleSave} className="rounded-full">
            <Save size={14} className="mr-2" /> Save Settings
          </Button>
          <Button variant="outline" onClick={handleReset} className="rounded-full">
            Discard Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SiteSettingsTab;

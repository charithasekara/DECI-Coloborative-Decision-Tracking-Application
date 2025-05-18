'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  bio: z.string().optional(),
});

export default function SettingsPage() {
  const [profile, setProfile] = useState({ name: '', email: '', bio: '' });
  const [preferences, setPreferences] = useState({ darkMode: false, emailNotifications: false });
  const [notifications, setNotifications] = useState({ decisionReminders: true, goalUpdates: true });
  const [errors, setErrors] = useState({ name: '', email: '', bio: '' });

  useEffect(() => {
    // Load settings from localStorage
    const savedProfile = localStorage.getItem('profile');
    const savedPrefs = localStorage.getItem('preferences');
    const savedNotifs = localStorage.getItem('notifications');
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (savedPrefs) setPreferences(JSON.parse(savedPrefs));
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
  }, []);

  const validateProfile = () => {
    const result = profileSchema.safeParse(profile);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0] || '',
        email: fieldErrors.email?.[0] || '',
        bio: fieldErrors.bio?.[0] || '',
      });
      return false;
    }
    setErrors({ name: '', email: '', bio: '' });
    return true;
  };

  const handleSave = () => {
    if (!validateProfile()) {
      toast.error('Please fix form errors');
      return;
    }
    localStorage.setItem('profile', JSON.stringify(profile));
    localStorage.setItem('preferences', JSON.stringify(preferences));
    localStorage.setItem('notifications', JSON.stringify(notifications));
    toast.success('Settings saved successfully');
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button onClick={handleSave} aria-label="Save settings">
          Save Changes
        </Button>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Enter your name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="text-sm text-destructive">
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="Enter your email"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="text-sm text-destructive">
                    {errors.email}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable dark mode for the application
                  </p>
                </div>
                <Switch
                  checked={preferences.darkMode}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, darkMode: checked })
                  }
                  aria-label="Toggle dark mode"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important updates
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, emailNotifications: checked })
                  }
                  aria-label="Toggle email notifications"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Decision Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded about pending decisions
                  </p>
                </div>
                <Switch
                  checked={notifications.decisionReminders}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, decisionReminders: checked })
                  }
                  aria-label="Toggle decision reminders"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Goal Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about goal progress
                  </p>
                </div>
                <Switch
                  checked={notifications.goalUpdates}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, goalUpdates: checked })
                  }
                  aria-label="Toggle goal updates"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Connected Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                No integrations available yet
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
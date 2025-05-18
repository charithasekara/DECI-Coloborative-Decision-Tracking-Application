'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Zap } from 'lucide-react';

export default function QuickActionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quick Actions</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search actions..." className="pl-10 w-[300px]" />
        </div>
      </div>

      <Tabs defaultValue="frequent" className="space-y-6">
        <TabsList>
          <TabsTrigger value="frequent">Frequent Actions</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="automated">Automated</TabsTrigger>
        </TabsList>

        <TabsContent value="frequent" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Decision Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Quickly log a new decision without all the details
                </p>
                <Button className="w-full">Start Quick Log</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Impact Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Quickly assess the impact of a recent decision
                </p>
                <Button className="w-full" variant="outline">
                  Start Assessment
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Decision Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Quick review of your recent decisions
                </p>
                <Button className="w-full" variant="outline">
                  Start Review
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8 text-muted-foreground">
                No recent actions available
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automated">
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-8 text-muted-foreground">
                No automated actions configured
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useBannerStore, useAuthStore } from '@/lib/store';

export default function AdminBanner() {
  const bannerStore = useBannerStore((s) => s.banner);
  const setBannerStore = useBannerStore((s) => s.setBanner);
  const token = useAuthStore((s) => s.token);

  const [text, setText] = useState('');
  const [link, setLink] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [previewVisible, setPreviewVisible] = useState(true);

  // Initialize from store
  useEffect(() => {
    if (bannerStore) {
      setText(bannerStore.text);
      setLink(bannerStore.link || '');
      setActive(bannerStore.active);
    }
  }, [bannerStore]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/banner', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ text, link: link || null, active }),
      });

      if (res.ok) {
        const data = await res.json();
        setBannerStore({ id: data.id || bannerStore?.id || '1', text, link: link || null, active });
        setMessage('Banner saved successfully!');
      } else {
        setMessage('Failed to save banner.');
      }
    } catch {
      // Still update locally
      setBannerStore({ id: bannerStore?.id || '1', text, link: link || null, active });
      setMessage('Saved locally (API unavailable).');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Preview Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-charcoal">Banner Preview</CardTitle>
              <CardDescription>Live preview of your announcement banner</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setPreviewVisible(!previewVisible)}
            >
              {previewVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {previewVisible ? (
            <div
              className={`rounded-lg px-4 py-3 text-center text-sm font-medium transition-all ${
                active
                  ? 'bg-charcoal text-gold'
                  : 'bg-gray-200 text-gray-400 line-through'
              }`}
            >
              {text || 'Your banner text will appear here...'}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/20 px-4 py-6 text-center text-sm text-muted-foreground">
              Preview hidden
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-charcoal">Edit Banner</CardTitle>
          <CardDescription>
            Customize the announcement banner shown at the top of the store
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="banner-text">Banner Text</Label>
            <Input
              id="banner-text"
              placeholder="Enter banner text..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="banner-link">
              Link URL{' '}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="banner-link"
              placeholder="https://example.com"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="banner-active">Active</Label>
              <p className="text-sm text-muted-foreground">
                Show the banner on the store
              </p>
            </div>
            <Switch
              id="banner-active"
              checked={active}
              onCheckedChange={setActive}
            />
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={saving || !text.trim()}
              className="bg-charcoal hover:bg-charcoal/90 text-white"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Banner
            </Button>
            {message && (
              <span
                className={`text-sm ${
                  message.includes('Failed')
                    ? 'text-red-500'
                    : 'text-green-600'
                }`}
              >
                {message}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

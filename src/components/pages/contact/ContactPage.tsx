'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Loader2, Send, Gem } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useNavigationStore } from '@/lib/store';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const contactInfo = [
  {
    icon: Mail,
    title: 'Email Us',
    detail: 'support@indicoreoriginals.com',
    description: 'We respond within 24 hours',
  },
  {
    icon: Phone,
    title: 'Call Us',
    detail: '+91 98765 43210',
    description: 'Mon-Sat, 10am-7pm IST',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    detail: 'IndiCore HQ, Mumbai, India',
    description: 'By appointment only',
  },
];

export default function ContactPage() {
  const navigate = useNavigationStore((s) => s.navigate);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Failed to send message');
      }

      toast.success('Message sent! We\'ll get back to you soon.');
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-[#FAF8F5]">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-20 w-64 h-64 rounded-full bg-[#C9A96E]/5 blur-3xl" />
        <div className="absolute bottom-40 left-20 w-48 h-48 rounded-full bg-[#C9A96E]/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 relative">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  className="cursor-pointer hover:text-[#C9A96E]"
                >
                  <span onClick={() => navigate('home')}>Home</span>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Contact</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="mx-auto w-14 h-14 rounded-full bg-[#C9A96E]/10 flex items-center justify-center mb-4">
            <Gem className="h-7 w-7 text-[#C9A96E]" />
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] sm:text-4xl">Get in Touch</h1>
          <p className="mt-2 text-[#1A1A1A]/60 max-w-md mx-auto">
            Have a question about our products or need help with an order? We&apos;d love to hear from you.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {contactInfo.map((item) => (
            <Card
              key={item.title}
              className="border-[#C9A96E]/20 text-center hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-6 pb-6 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#C9A96E]/10 flex items-center justify-center mb-3">
                  <item.icon className="h-5 w-5 text-[#C9A96E]" />
                </div>
                <h3 className="text-sm font-semibold text-[#1A1A1A]">{item.title}</h3>
                <p className="text-sm text-[#C9A96E] font-medium mt-1">{item.detail}</p>
                <p className="text-xs text-[#1A1A1A]/40 mt-1">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Form */}
        <Card className="max-w-2xl mx-auto border-[#C9A96E]/20">
          <CardHeader className="text-center">
            <CardTitle className="text-xl text-[#1A1A1A]">Send us a Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-name" className="text-sm font-medium text-[#1A1A1A]/80">
                    Name
                  </Label>
                  <Input
                    id="contact-name"
                    placeholder="Your name"
                    className="h-10 border-[#1A1A1A]/20 focus-visible:ring-[#C9A96E]/50 focus-visible:border-[#C9A96E]"
                    {...register('name')}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-email" className="text-sm font-medium text-[#1A1A1A]/80">
                    Email
                  </Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="you@example.com"
                    className="h-10 border-[#1A1A1A]/20 focus-visible:ring-[#C9A96E]/50 focus-visible:border-[#C9A96E]"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-subject" className="text-sm font-medium text-[#1A1A1A]/80">
                  Subject
                </Label>
                <Input
                  id="contact-subject"
                  placeholder="How can we help?"
                  className="h-10 border-[#1A1A1A]/20 focus-visible:ring-[#C9A96E]/50 focus-visible:border-[#C9A96E]"
                  {...register('subject')}
                />
                {errors.subject && (
                  <p className="text-sm text-red-500">{errors.subject.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-message" className="text-sm font-medium text-[#1A1A1A]/80">
                  Message
                </Label>
                <Textarea
                  id="contact-message"
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                  className="border-[#1A1A1A]/20 focus-visible:ring-[#C9A96E]/50 focus-visible:border-[#C9A96E] resize-none"
                  {...register('message')}
                />
                {errors.message && (
                  <p className="text-sm text-red-500">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-[#C9A96E] hover:bg-[#b89558] text-white font-medium transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

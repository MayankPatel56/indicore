'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Diamond, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { useNavigationStore, useAuthStore } from '@/lib/store';

const signupSchema = z
  .object({
    name: z.string().min(1, 'Full name is required'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
    phone: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const navigate = useNavigationStore((s) => s.navigate);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone || undefined,
          password: data.password,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Signup failed');
      }

      setAuth(result.user, result.token);
      toast.success('Account created successfully!');
      navigate('profile');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 bg-[#FAF8F5]">
      {/* Subtle branded background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-40 h-40 rounded-full bg-[#C9A96E]/5 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-[#C9A96E]/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#C9A96E]/3 blur-3xl" />
      </div>

      {/* Breadcrumb */}
      <div className="w-full max-w-md mb-8 relative">
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
              <BreadcrumbPage>Sign Up</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Card className="w-full max-w-md relative border-[#C9A96E]/20 shadow-lg">
        <CardHeader className="text-center space-y-2 pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#C9A96E]/10 flex items-center justify-center mb-2">
            <Diamond className="h-6 w-6 text-[#C9A96E]" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#1A1A1A]">
            Create Account
          </CardTitle>
          <CardDescription className="text-[#1A1A1A]/60">
            Join IndiCore Originals and discover premium products
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[#1A1A1A]/80 text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                className="h-10 border-[#1A1A1A]/20 focus-visible:ring-[#C9A96E]/50 focus-visible:border-[#C9A96E]"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#1A1A1A]/80 text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-10 border-[#1A1A1A]/20 focus-visible:ring-[#C9A96E]/50 focus-visible:border-[#C9A96E]"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#1A1A1A]/80 text-sm font-medium">
                Phone <span className="text-[#1A1A1A]/40">(optional)</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                className="h-10 border-[#1A1A1A]/20 focus-visible:ring-[#C9A96E]/50 focus-visible:border-[#C9A96E]"
                {...register('phone')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#1A1A1A]/80 text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  className="h-10 pr-10 border-[#1A1A1A]/20 focus-visible:ring-[#C9A96E]/50 focus-visible:border-[#C9A96E]"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40 hover:text-[#1A1A1A]/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[#1A1A1A]/80 text-sm font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  className="h-10 pr-10 border-[#1A1A1A]/20 focus-visible:ring-[#C9A96E]/50 focus-visible:border-[#C9A96E]"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40 hover:text-[#1A1A1A]/60 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
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
                  Creating account...
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center pb-6">
          <p className="text-sm text-[#1A1A1A]/60">
            Already have an account?{' '}
            <button
              onClick={() => navigate('login')}
              className="text-[#C9A96E] hover:text-[#b89558] font-medium transition-colors"
            >
              Login
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

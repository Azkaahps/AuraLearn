'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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
import { CheckCircle2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { toast } from 'sonner';

type FormState = 'idle' | 'loading' | 'success';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>('idle');

  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }

    setFormState('loading');

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        setError('Email ini sudah terdaftar. Silakan login.');
      } else {
        setError(authError.message || 'Gagal membuat akun. Silakan coba lagi.');
      }
      setFormState('idle');
      return;
    }

    // Jika Confirm Email di-disable di Supabase Dashboard (Solusi A),
    // data.session langsung bernilai valid & user langsung login otomatis
    if (data?.session) {
      toast.success('AKUN BERHASIL DIBUAT! SELAMAT DATANG.');
      router.push('/dashboard');
      router.refresh();
      return;
    }

    // Jika Confirm Email tetap di-enable di Supabase Dashboard,
    // tampilkan halaman sukses instruksi verifikasi email
    setFormState('success');
  }

  if (formState === 'success') {
    return (
      <Card className="w-full max-w-md border border-[#362d59] bg-[#150f23] text-white p-8 text-center rounded-[18px] shadow-2xl">
        <CardHeader className="space-y-3 p-0 mb-6">
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 rounded-[12px] bg-[#1f1633] border border-[#362d59] text-[#c2ef4e] flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="font-display text-2xl font-bold text-white">HAMPIR SELESAI!</CardTitle>
          <CardDescription className="font-sans text-sm text-white/70 leading-[1.5]">
            Kami mengirimkan email konfirmasi ke{' '}
            <strong className="text-[#c2ef4e] font-mono">{email}</strong>.
            Silakan cek kotak masuk dan klik tautan verifikasi untuk mengaktifkan akunmu.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center p-0 pt-4 border-t border-[#362d59]">
          <Link
            href="/login"
            className="button-cap h-11 px-6 bg-white text-[#150f23] hover:bg-white/90 rounded-[8px] font-bold tracking-[0.2px] uppercase inline-flex items-center justify-center"
          >
            KEMBALI KE HALAMAN LOGIN
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border border-[#362d59] bg-[#1f1633] text-white shadow-2xl rounded-[18px] overflow-hidden">
      <CardHeader className="space-y-2 text-center pt-8 pb-6">
        <div className="flex justify-center mb-2">
           <Logo href="/" showText={false} size="lg" title="Kembali ke Beranda" />
        </div>
        <CardTitle className="font-display text-2xl font-bold tracking-tight text-white">
          Buat Akun Gratis
        </CardTitle>
        <CardDescription className="font-sans text-sm text-white/70">
          Mulai belajar lebih cerdas dengan AuraLearn
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 pb-6">
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-mono text-xs font-bold text-white/80 uppercase tracking-wider">
              EMAIL
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={formState === 'loading'}
              className="bg-[#150f23] border border-[#362d59] text-white placeholder:text-white/40 focus:border-[#6a5fc1] rounded-[8px] h-11 px-4 font-sans text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="font-mono text-xs font-bold text-white/80 uppercase tracking-wider">
              PASSWORD (MINIMAL 8 KARAKTER)
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
                disabled={formState === 'loading'}
                className="bg-[#150f23] border border-[#362d59] text-white placeholder:text-white/40 focus:border-[#6a5fc1] rounded-[8px] h-11 pl-4 pr-11 font-sans text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="font-mono text-xs font-bold text-white/80 uppercase tracking-wider">
              KONFIRMASI PASSWORD
            </Label>
            <div className="relative">
              <Input
                id="confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={formState === 'loading'}
                className="bg-[#150f23] border border-[#362d59] text-white placeholder:text-white/40 focus:border-[#6a5fc1] rounded-[8px] h-11 pl-4 pr-11 font-sans text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1"
                aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="font-mono text-xs text-[#fa7faa] font-bold bg-[#fa7faa]/15 p-3 rounded-[6px] border border-[#fa7faa]/30">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="button-cap w-full h-12 bg-white text-[#150f23] hover:bg-white/90 rounded-[8px] font-bold tracking-[0.2px] uppercase transition-all flex items-center justify-center gap-2 mt-6"
            disabled={formState === 'loading'}
          >
            <span>{formState === 'loading' ? 'MEMBUAT AKUN...' : 'DAFTAR SEKARANG'}</span>
            {formState !== 'loading' && <ArrowRight className="w-4 h-4 text-[#150f23]" />}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center py-5 bg-[#150f23] border-t border-[#362d59]">
        <p className="font-sans text-sm text-white/70">
          Sudah punya akun?{' '}
          <Link
            href="/login"
            className="font-mono text-xs font-bold text-[#c2ef4e] hover:underline hover:text-[#c2ef4e]/90 ml-1 uppercase"
          >
            MASUK SEKARANG
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

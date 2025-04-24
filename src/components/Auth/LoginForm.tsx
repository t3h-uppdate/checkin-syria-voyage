
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const LoginForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, user, userRole, userBanned } = useAuth();
  const [loginComplete, setLoginComplete] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Redirect user if already logged in
  useEffect(() => {
    if (user) {
      console.log("User already logged in, checking role...", { userRole, userBanned });
      
      if (userBanned) {
        setError("Your account has been suspended. Please contact support for assistance.");
        return;
      }
      
      if (userRole) {
        console.log("User role detected, proceeding with redirect to appropriate page");
        setLoginComplete(true);
        
        // Start countdown
        let countdown = 3;
        const timer = setInterval(() => {
          countdown -= 1;
          setRedirectCountdown(countdown);
          
          if (countdown <= 0) {
            clearInterval(timer);
            
            if (userRole === 'admin') {
              console.log("Redirecting admin user to admin control panel");
              navigate('/admin-control-panel');
            } else if (userRole === 'owner') {
              navigate('/dashboard');
            } else {
              navigate('/');
            }
          }
        }, 1000);
        
        return () => clearInterval(timer);
      }
    }
  }, [user, userRole, userBanned, navigate]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await signIn(data.email, data.password);
      console.log("Login successful, waiting for role to be set before redirect");
      // Redirection will happen via useEffect when auth state changes
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-8"
    >
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{t('auth.login')}</h1>
        <p className="text-gray-600 mt-2">Welcome back! Log in to your account.</p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {userBanned && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Account Suspended</AlertTitle>
          <AlertDescription>Your account has been suspended. Please contact support for assistance.</AlertDescription>
        </Alert>
      )}
      
      {loginComplete ? (
        <Alert className="mb-6 border-green-500 bg-green-50">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-green-500" />
            <AlertTitle className="text-green-700">Login Successful!</AlertTitle>
          </div>
          <AlertDescription className="mt-2">
            {userRole === 'admin' 
              ? "Welcome, admin! Redirecting you to the Admin Control Panel" 
              : "Welcome back! Redirecting you to the dashboard"}
            <span className="font-medium"> in {redirectCountdown} seconds...</span>
          </AlertDescription>
        </Alert>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('auth.email')}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>{t('auth.password')}</FormLabel>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      {t('auth.forgotPassword')}
                    </Link>
                  </div>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-normal">
                      {t('auth.rememberMe')}
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || userBanned}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> 
                  Logging in...
                </span>
              ) : (
                t('auth.signIn')
              )}
            </Button>
          </form>
        </Form>
      )}
      
      <div className="text-center mt-8">
        <p className="text-gray-600">
          {t('auth.noAccount')} {' '}
          <Link to="/register" className="text-primary hover:underline">
            {t('auth.signUp')}
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default LoginForm;


import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  userRole: UserRole | null;
  userBanned: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userBanned, setUserBanned] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, is_banned')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      if (data?.role) {
        setUserRole(data.role as UserRole);
        setUserBanned(data.is_banned || false);
        console.log("User role set:", data.role, "Ban status:", data.is_banned);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Using setTimeout to avoid potential Supabase subscription issues
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
          setUserBanned(false);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session ? "Session exists" : "No session");
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log("Signing in with email:", email);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message === "Email not confirmed") {
          toast({
            title: "Email not confirmed",
            description: "Please check your email inbox and confirm your account before logging in.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error signing in",
            description: error.message,
            variant: "destructive"
          });
        }
        throw error;
      }
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: window.location.origin + '/login',
        },
      });
      
      if (error) throw error;
      
      if (data?.user?.identities?.length === 0) {
        toast({
          title: "User already exists",
          description: "This email is already registered. Please log in or use a different email.",
          variant: "destructive"
        });
        throw new Error("User already exists");
      }
      
      toast({
        title: "Registration successful!",
        description: "Please check your email to confirm your account before logging in.",
      });
    } catch (error) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear user states on sign out
      setUserRole(null);
      setUserBanned(false);
    } catch (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      loading, 
      userRole, 
      userBanned, 
      signIn, 
      signUp, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

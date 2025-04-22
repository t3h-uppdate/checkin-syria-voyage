
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/Layout/MainLayout";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) throw error;
      toast({
        title: "Återställningsmejl skickat!",
        description: "Kolla din inkorg för återställningslänken.",
      });
      setTimeout(() => navigate("/login"), 1500);
    } catch (error: any) {
      toast({
        title: "Fel",
        description: error.message || "Kunde inte skicka återställningsmejl.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="pt-24 pb-12 min-h-[80vh] flex items-center bg-muted">
        <div className="container mx-auto px-4 max-w-md">
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded-lg p-8 space-y-6"
          >
            <h1 className="text-2xl font-bold text-center mb-2">
              Glömt lösenord
            </h1>
            <p className="text-gray-600 text-center mb-2">
              Skriv in din e-postadress så skickar vi en återställningslänk.
            </p>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="E-post"
              className="w-full"
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !email}
            >
              {isSubmitting ? "Skickar..." : "Skicka återställningsmejl"}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              Tillbaka till inloggning
            </Button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default ForgotPasswordPage;

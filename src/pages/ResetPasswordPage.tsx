
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/Layout/MainLayout";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast({
        title: "Fel",
        description: "Lösenorden matchar inte.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast({
        title: "Lösenordet uppdaterat!",
        description: "Du kan nu logga in med ditt nya lösenord.",
      });
      setTimeout(() => navigate("/login"), 1500);
    } catch (error: any) {
      toast({
        title: "Fel",
        description: error.message || "Kunde inte återställa lösenordet.",
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
              Återställ lösenord
            </h1>
            <p className="text-gray-600 text-center mb-2">
              Välj ett nytt lösenord för ditt konto.
            </p>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              placeholder="Nytt lösenord"
              className="w-full"
              minLength={6}
              disabled={isSubmitting}
            />
            <Input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              type="password"
              required
              placeholder="Bekräfta nytt lösenord"
              className="w-full"
              minLength={6}
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !password || !confirm}
            >
              {isSubmitting ? "Återställer..." : "Uppdatera lösenord"}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => navigate("/login")}
              disabled={isSubmitting}
            >
              Tillbaka till inloggning
            </Button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default ResetPasswordPage;

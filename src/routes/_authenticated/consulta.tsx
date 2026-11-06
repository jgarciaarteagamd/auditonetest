import { createFileRoute } from "@tanstack/react-router";
import { Headphones } from "lucide-react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { useLang } from "@/lib/i18n";

// In-clinic audiometer. Phase 1b adds manual audiogram entry with the AudiometricReport engine;
// phases 2–6 add the calibrated tone engine, manual audiometer and automated procedure.
export const Route = createFileRoute("/_authenticated/consulta")({
  component: ClinicPage,
});

function ClinicPage() {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold">
          <Headphones className="h-6 w-6" />
          {t("clinic.title")}
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">{t("clinic.subtitle")}</p>
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">{t("clinic.coming")}</CardContent>
        </Card>
      </main>
    </div>
  );
}

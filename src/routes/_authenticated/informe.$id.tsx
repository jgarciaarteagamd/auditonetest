import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLang } from "@/lib/i18n";
import { getSession } from "@/lib/results";

export const Route = createFileRoute("/_authenticated/informe/$id")({
  component: ReportPage,
});

function ReportPage() {
  const { id } = Route.useParams();
  const { lang, t } = useLang();
  const { data: r, isLoading } = useQuery({ queryKey: ["session", id], queryFn: () => getSession(id) });

  return (
    <div className="min-h-screen bg-muted/30 print:bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 print:hidden">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/bandeja">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("print.back")}
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Button size="sm" onClick={() => window.print()} disabled={!r}>
            <Printer className="mr-2 h-4 w-4" />
            {t("print.print")}
          </Button>
        </div>
      </div>
      <main className="mx-auto max-w-3xl bg-white px-6 pb-12 pt-6 text-slate-900 shadow-sm print:max-w-none print:px-0 print:shadow-none">
        {isLoading && <p className="text-sm text-muted-foreground">{t("inbox.loading")}</p>}
        {!isLoading && !r && <p className="text-sm text-muted-foreground">{t("report.not_available")}</p>}
        {r && (
          <>
            <header className="mb-5 border-b pb-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">{t("app.name")}</p>
              <h1 className="text-2xl font-bold">{t("report.title")}</h1>
              <p className="mt-1 text-sm text-slate-600">
                {t("report.date")}: {new Date(r.created_at).toLocaleString(lang === "en" ? "en-GB" : "es-ES")}
                {r.label && <> · {t("report.label")}: <strong>{r.label}</strong></>}
                {" · "}
                {t("report.sex")}: {t(`setup.sex.${r.sex}`)} · {t("report.age")}: {t(`setup.age.${r.age_group}`)}
                {" · "}
                {t(`inbox.source.${r.source}`)} · {t("inbox.version")}: {r.app_version}
              </p>
            </header>
            {!r.calibrated && (
              <p className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{t("report.not_calibrated")}</p>
            )}
            <p className="rounded border border-dashed p-4 text-sm text-slate-500">{t("inbox.report_pending")}</p>
          </>
        )}
      </main>
      <style>{`@media print { @page { size: A4; margin: 12mm; } details > *:not(summary) { display: block; } }`}</style>
    </div>
  );
}

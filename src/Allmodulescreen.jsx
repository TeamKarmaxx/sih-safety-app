import { translateTraining } from "./trainingTranslation";
import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./context/useAuth.js";
import { getModules } from "./api/modules";
import { getDashboard } from "./api/progress";
import { Screen, ScreenHeader, Card, ProgressBar } from "./components/ui/Layout.jsx";
import { StatusBadge } from "./components/ui/StatusBadge.jsx";
import { deriveModuleStatus } from "./lib/status.js";
import { LoadingState, ErrorState, EmptyState } from "./components/ui/AsyncStates.jsx";
import { hazardIconFor, hazardColorFor } from "./lib/hazard.js";
import { cachedGet } from "./offline/cachedFetch.js";

function AllmodulesScreen({ onNavigate, onSelectModule }) {
  const { t } = useTranslation();
  const { session } = useAuth();
  const userId = session?.userId ?? null;
  const [searchQuery, setSearchQuery] = useState("");
  const [modules, setModules] = useState(null);
  const [loadState, setLoadState] = useState("loading"); // loading | ready | error
  const [usedCache, setUsedCache] = useState(false);

  const load = useCallback(async () => {
    try {
      // The module list is safe, static data — cached so it can still be
      // browsed offline. Dashboard progress must stay live (it's the
      // learner's actual completion state), so it's fetched separately and
      // simply omitted (not faked) if unreachable, rather than blocking the
      // module list behind it.
      const { data: moduleList, fromCache } = await cachedGet("modules:list", getModules);

      let dashboard = null;
      if (userId) {
        try {
          dashboard = await getDashboard(userId);
        } catch {
          dashboard = null;
        }
      }

      const progressByModuleId = new Map(
        (dashboard?.modules || []).map((entry) => [entry.module_id, entry])
      );

      const merged = (moduleList || []).map((module) => {
        const progressEntry = progressByModuleId.get(module.id) || null;
        return { module, progressEntry };
      });

      setModules(merged);
      setUsedCache(fromCache);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, [userId]);

  // Initial load. `load()` itself only sets state asynchronously (after the
  // await above), so no setState runs synchronously within this effect body.
  useEffect(() => {
    load();
  }, [load]);

  const retry = useCallback(() => {
    setLoadState("loading");
    load();
  }, [load]);

  const filtered = (modules || []).filter(({ module }) =>
    module.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Screen>
      <ScreenHeader
        title={t("home.allModulesTitle") || "All Modules"}
        subtitle={t("home.trainingModules") || "Training Modules"}
      />

      {usedCache && loadState === "ready" && (
        <p
          style={{
            fontSize: "11px",
            color: "var(--color-text-muted)",
            marginTop: "-8px",
            marginBottom: "12px",
          }}
        >
          {t("modules.offlineNotice") || "You're offline — showing modules saved from an earlier visit."}
        </p>
      )}

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder={t("common.search") || "Search modules"}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border-strong)",
            borderRadius: "var(--radius-md)",
            color: "var(--color-text-primary)",
            fontSize: "14px",
            boxSizing: "border-box",
          }}
        />
      </div>

      {loadState === "loading" && <LoadingState message={t("modules.loading") || "Loading modules..."} />}

      {loadState === "error" && (
        <ErrorState
          title={t("modules.error_title") || "Unable to load modules"}
          message={t("modules.error_message") || "Unable to connect to training server. Retry."}
          onRetry={retry}
        />
      )}

      {loadState === "ready" && filtered.length === 0 && (
        <EmptyState
          icon="📚"
          title={t("modules.empty_title") || "No modules available"}
          message={
            searchQuery
              ? t("modules.empty_search") || "No modules match your search."
              : t("modules.empty_message") || "No training modules have been published yet."
          }
        />
      )}

      {loadState === "ready" &&
        filtered.map(({ module, progressEntry }) => {
          const status = deriveModuleStatus(progressEntry);
          const progress = progressEntry?.progress ?? 0;
          const accent = hazardColorFor(module.title);

          return (
            <Card
              key={module.id}
              interactive
              style={{ marginBottom: "12px", borderColor: `${accent}40` }}
              onClick={() => {
                onSelectModule(module.id);
                onNavigate("module-detail");
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ fontSize: "30px", flexShrink: 0 }}>{hazardIconFor(module.title)}</div>

                <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                    <h3
                      style={{
                        color: "var(--color-text-primary)",
                        fontSize: "15px",
                        fontWeight: 700,
                        margin: "0 0 4px",
                      }}
                    >
                      {translateTraining(module.title)}
                    </h3>
                  </div>

                  <p
                    style={{
                      color: "var(--color-text-secondary)",
                      fontSize: "12px",
                      margin: "0 0 8px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {module.description}
                  </p>

                  <div style={{ display: "flex", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                      {t("modules.difficulty") || "Difficulty"}: {module.difficulty || "—"}
                    </span>
                    {progressEntry && (
                      <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                        {progressEntry.completed_lessons}/{progressEntry.total_lessons} lessons ·{" "}
                        {progressEntry.completed_drills}/{progressEntry.total_drills} drills
                      </span>
                    )}
                  </div>

                  <ProgressBar percent={progress} />

                  <div style={{ marginTop: "8px" }}>
                    <StatusBadge status={status} />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
    </Screen>
  );
}

export default AllmodulesScreen;

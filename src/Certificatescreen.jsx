import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "./context/useAuth.js";
import { generateCertificate, verifyCertificate, getCertificateQrBlob } from "./api/certificates";
import { Screen, BackButton, Card, Button } from "./components/ui/Layout.jsx";
import { LoadingState, ErrorState, EmptyState } from "./components/ui/AsyncStates.jsx";

/**
 * Friendly labels for the assorted eligibility-gate fields the backend
 * returns from POST /users/{id}/modules/{id}/certificate when the user
 * hasn't met one of the requirements yet. We don't reshape the backend's
 * `message`, only add readable labels for whichever extra fields it
 * included for that particular gate (lessons, drills, drill quizzes, or the
 * module quiz — see main.py's generate_certificate for the exact shapes).
 */
const GATE_FIELD_LABELS = {
  completed_lessons: "Lessons completed",
  total_lessons: "Total lessons",
  completed_drills: "Drills completed",
  total_drills: "Total drills",
  drill_id: "Drill ID",
  percentage: "Score",
  required_percentage: "Required score",
  score: "Correct answers",
  total_questions: "Total questions",
};

const PERCENT_FIELDS = new Set(["percentage", "required_percentage"]);

function CertificateScreen({ moduleId, onBack }) {
  const { t } = useTranslation();
  const { session } = useAuth();
  const userId = session?.userId ?? null;

  // loading | gated | ready | error
  const [state, setState] = useState("loading");
  const [gateInfo, setGateInfo] = useState(null); // the backend's non-eligible response
  const [certificate, setCertificate] = useState(null); // verified record from GET /certificates/{number}
  const [qrUrl, setQrUrl] = useState(null);
  const qrUrlRef = useRef(null);

  const load = useCallback(async () => {
    if (!userId || !moduleId) {
      setState("error");
      return;
    }

    setState("loading");

    try {
      // This single endpoint both checks eligibility AND generates/returns
      // the existing certificate — there is no separate "check eligibility"
      // endpoint, so this is the correct (and only) way to find out.
      const genResult = await generateCertificate(userId, moduleId);

      if (!genResult?.certificate_number) {
        // Not eligible yet — show exactly what the backend says is missing.
        setGateInfo(genResult);
        setState("gated");
        return;
      }

      // We have a real certificate_number (either just generated or
      // pre-existing). Fetch the canonical public record for stable,
      // consistent display regardless of which path produced the number.
      const record = await verifyCertificate(genResult.certificate_number);

      if (!record?.valid) {
        setState("error");
        return;
      }

      setCertificate(record);

      // Fetch the real QR image as a blob and turn it into an object URL.
      try {
        const blob = await getCertificateQrBlob(genResult.certificate_number);
        const objectUrl = URL.createObjectURL(blob);
        qrUrlRef.current = objectUrl;
        setQrUrl(objectUrl);
      } catch {
        // QR is a nice-to-have; missing it shouldn't block showing the
        // certificate itself.
        setQrUrl(null);
      }

      setState("ready");
    } catch {
      setState("error");
    }
  }, [userId, moduleId]);

  useEffect(() => {
    load();
    return () => {
      if (qrUrlRef.current) {
        URL.revokeObjectURL(qrUrlRef.current);
        qrUrlRef.current = null;
      }
    };
  }, [load]);

  const retry = useCallback(() => {
    setState("loading");
    load();
  }, [load]);

  if (!moduleId) {
    return (
      <Screen>
        <BackButton onClick={onBack} label={t("common.back") || "Back"} />
        <EmptyState
          icon="🏆"
          title={t("certificate.no_module_title") || "No module selected"}
          message={
            t("certificate.no_module_message") ||
            "Open a module and complete its training to check certificate eligibility."
          }
        />
      </Screen>
    );
  }

  if (state === "loading") {
    return (
      <Screen>
        <BackButton onClick={onBack} label={t("common.back") || "Back"} />
        <LoadingState message={t("certificate.loading") || "Checking certificate eligibility..."} />
      </Screen>
    );
  }

  if (state === "error") {
    return (
      <Screen>
        <BackButton onClick={onBack} label={t("common.back") || "Back"} />
        <ErrorState
          title={t("certificate.error_title") || "Unable to check your certificate"}
          message={t("certificate.error_message") || "Unable to connect to training server. Retry."}
          onRetry={retry}
        />
      </Screen>
    );
  }

  if (state === "gated") {
    const extraFields = Object.entries(gateInfo || {}).filter(([key]) => key !== "message");

    return (
      <Screen>
        <BackButton onClick={onBack} label={t("common.back") || "Back"} />
        <Card raised style={{ textAlign: "center", marginTop: "20px" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔒</div>
          <h2 style={{ color: "var(--color-text-primary)", fontSize: "17px", margin: "0 0 12px" }}>
            {t("certificate.not_eligible_title") || "Not Eligible Yet"}
          </h2>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px", margin: "0 0 20px" }}>
            {gateInfo?.message}
          </p>

          {extraFields.length > 0 && (
            <div
              style={{
                background: "var(--color-surface-sunken)",
                borderRadius: "var(--radius-md)",
                padding: "14px",
                textAlign: "left",
              }}
            >
              {extraFields.map(([key, value]) => (
                <div
                  key={key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    padding: "4px 0",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <span>{GATE_FIELD_LABELS[key] || key}</span>
                  <span style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>
                    {String(value)}
                    {PERCENT_FIELDS.has(key) ? "%" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div style={{ marginTop: "16px" }}>
          <Button variant="secondary" onClick={retry}>
            {t("certificate.checkAgain") || "Check Again"}
          </Button>
        </div>
      </Screen>
    );
  }

  // state === "ready"
  return (
    <Screen>
      <BackButton onClick={onBack} label={t("common.back") || "Back"} />

      <Card
        raised
        style={{
          textAlign: "center",
          marginTop: "16px",
          border: "1px solid var(--color-accent-border)",
        }}
      >
        <div style={{ fontSize: "44px", marginBottom: "12px" }}>🏆</div>

        <h2
          style={{
            color: "var(--color-accent)",
            fontSize: "20px",
            fontWeight: 800,
            margin: "0 0 4px",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {t("certificate.title") || "Certificate of Completion"}
        </h2>

        <p style={{ color: "var(--color-text-secondary)", fontSize: "12px", margin: "0 0 24px" }}>
          {t("app.title") || "Industrial Safety Training"}
        </p>

        <div
          style={{
            background: "var(--color-surface-sunken)",
            border: "1px dashed var(--color-accent-border)",
            borderRadius: "var(--radius-md)",
            padding: "20px",
            marginBottom: "20px",
            textAlign: "left",
          }}
        >
          <FieldRow label={t("common.user") || "Name"} value={certificate.user_name} big />
          <FieldRow label={t("certificate.module") || "Module"} value={certificate.module_title} accent />

          <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--color-border)" }}>
            <p style={{ color: "var(--color-text-muted)", fontSize: "10px", margin: "0 0 4px" }}>
              {t("certificate.certificateNumber") || "Certificate Number"}
            </p>
            <p
              style={{
                color: "var(--color-info)",
                fontSize: "13px",
                fontFamily: "monospace",
                margin: 0,
                wordBreak: "break-all",
              }}
            >
              {certificate.certificate_number}
            </p>
          </div>
        </div>

        {qrUrl && (
          <div style={{ marginBottom: "8px" }}>
            <p
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "10px",
              }}
            >
              {t("certificate.scanToVerify") || "Scan to Verify"}
            </p>
            <div
              style={{
                display: "inline-block",
                background: "#fff",
                padding: "10px",
                borderRadius: "var(--radius-md)",
              }}
            >
              <img src={qrUrl} alt={t("certificate.qrAlt") || "Certificate verification QR code"} width={140} height={140} />
            </div>
          </div>
        )}
      </Card>
    </Screen>
  );
}

function FieldRow({ label, value, big, accent }) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontSize: "10px",
          margin: "0 0 4px",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </p>
      <p
        style={{
          color: accent ? "var(--color-accent)" : "var(--color-text-primary)",
          fontSize: big ? "18px" : "15px",
          fontWeight: 700,
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  );
}

export default CertificateScreen;

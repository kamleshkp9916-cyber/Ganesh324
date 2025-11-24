"use client";
import React, { useState, useEffect, useRef } from "react";
import { httpsCallable } from "firebase/functions";
import { getFunctionsClient } from "@/firebase"; // uses src/firebase.js alias

const functions = getFunctionsClient();

export default function OdiditVerifier({ sellerId, onVerified }) {
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [verificationUrl, setVerificationUrl] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [status, setStatus] = useState("IDLE");
  const [error, setError] = useState(null);

  const pollRef = useRef(null);

  // Spinner animation
  const Spinner = () => (
    <div style={{ display: "inline-block", marginLeft: 8 }}>
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: "3px solid #aaa",
          borderTop: "3px solid #000",
          animation: "spin 0.8s linear infinite"
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  async function createSession({ metadata } = {}) {
    setError(null);
    setLoading(true);
    setStatus("PENDING");

    try {
      const fnCreate = httpsCallable(functions, "createOdiditSession");
      const res = await fnCreate({ metadata: metadata || {} });

      const data = res.data || {};
      setSessionId(data.sessionId);
      setVerificationUrl(data.verificationUrl);
      setQrDataUrl(data.qrDataUrl || null);

      startPolling(data.sessionId);
    } catch (err) {
      console.error("createSession error:", err);
      setError(String(err?.message || err));
      setStatus("ERROR");
    } finally {
      setLoading(false);
    }
  }

  async function checkSessionOnce(sid) {
    try {
      const fnCheck = httpsCallable(functions, "checkOdiditSession");
      const res = await fnCheck({ sessionId: sid });
      const s = res.data?.status || res.data?.raw?.status || "UNKNOWN";
      return s;
    } catch (err) {
      console.error("checkSessionOnce error:", err);
      return "ERROR";
    }
  }

  function startPolling(sid, interval = 3000) {
    if (!sid) return;
    stopPolling();

    pollRef.current = setInterval(async () => {
      const st = await checkSessionOnce(sid);

      if (st === "VERIFIED") {
        setStatus("VERIFIED");
        stopPolling();
        if (onVerified) onVerified({ sessionId: sid, status: st });
        return;
      }

      if (st === "FAILED" || st === "ERROR") {
        setStatus(st);
        stopPolling();
        return;
      }

      setStatus("PENDING");
    }, interval);
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  useEffect(() => () => stopPolling(), []);

  return (
    <div>
      <h3>Identity Verification</h3>

      {!sessionId && (
        <div>
          <button onClick={() => createSession({ metadata: { role: "seller" } })} disabled={loading}>
            {loading ? <>Starting... <Spinner/></> : "Start Verification"}
          </button>
        </div>
      )}

      {sessionId && (
        <div style={{ marginTop: 15 }}>
          <h4>Status: {status}</h4>

          {qrDataUrl && (
            <img
              src={qrDataUrl}
              alt="qr"
              style={{ width: 240, height: 240, marginBottom: 10 }}
            />
          )}

          <div style={{ marginTop: 8 }}>
            <button onClick={() => window.open(verificationUrl, "_blank")}>
              Open Verification URL
            </button>

            <button style={{ marginLeft: 10 }} onClick={() => startPolling(sessionId)}>
              Poll Now
            </button>
          </div>
        </div>
      )}

      {status === "VERIFIED" && (
        <div style={{ marginTop: 20, color: "green" }}>
          ✅ Verification Complete
        </div>
      )}

      {status === "FAILED" && (
        <div style={{ marginTop: 20, color: "red" }}>
          ❌ Verification Failed
        </div>
      )}

      {error && <div style={{ marginTop: 20, color: "crimson" }}>Error: {error}</div>}
    </div>
  );
}
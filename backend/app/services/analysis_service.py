from __future__ import annotations

from typing import Any

import httpx

from app.core.config import settings


class AnalysisService:
    def analyze_recording(self, recording_s3_key: str, transcript: str | None, notes: str | None) -> dict[str, Any]:
        if not settings.gemini_api_key:
            return self._fallback_analysis(recording_s3_key, transcript, notes)

        prompt = self._build_prompt(recording_s3_key, transcript, notes)
        response = self._call_gemini(prompt)
        return self._normalize_response(response, transcript)

    def _build_prompt(self, recording_s3_key: str, transcript: str | None, notes: str | None) -> str:
        return (
            "You are analyzing a wellbeing check-in call for a senior care platform. "
            "Return a concise wellbeing assessment with a summary, mood estimate, concerns, "
            "and urgency level. Treat falls, breathing trouble, chest pain, confusion, "
            "loss of consciousness, or requests for immediate help as urgent. "
            f"Recording key: {recording_s3_key}. "
            f"Transcript: {transcript or 'No transcript provided.'} "
            f"Additional notes: {notes or 'No additional notes.'}"
        )

    def _call_gemini(self, prompt: str) -> dict[str, Any]:
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{settings.gemini_model}:generateContent?key={settings.gemini_api_key}"
        )
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        with httpx.Client(timeout=30.0) as client:
            response = client.post(url, json=payload)
            response.raise_for_status()
            return response.json()

    def _normalize_response(self, response: dict[str, Any], transcript: str | None) -> dict[str, Any]:
        text = ""
        candidates = response.get("candidates", [])
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            text = " ".join(part.get("text", "") for part in parts if isinstance(part, dict)).strip()
        urgency_level = self._infer_urgency(text=text, transcript=transcript)

        return {
            "summary": text or "Gemini analysis completed, but no summary text was returned.",
            "mood_score": None,
            "concerns": {"flags": ["manual-review-needed"], "raw_response": response},
            "urgency_level": urgency_level,
        }

    def _fallback_analysis(self, recording_s3_key: str, transcript: str | None, notes: str | None) -> dict[str, Any]:
        urgency_level = "normal"
        concerns: list[str] = []
        mood_score = 75

        combined_text = f"{transcript or ''} {notes or ''}".lower()
        for keyword in ("fall", "pain", "help", "emergency", "confused", "dizzy", "fainted", "breathing", "chest pain"):
            if keyword in combined_text:
                urgency_level = "high"
                mood_score = 25
                concerns.append(f"keyword:{keyword}")

        summary = (
            "Fallback analysis stored because Gemini is not configured yet. "
            f"Recording `{recording_s3_key}` was saved and is ready for later processing."
        )
        if transcript:
            summary += f" Transcript excerpt length: {len(transcript)} characters."

        return {
            "summary": summary,
            "mood_score": mood_score,
            "concerns": concerns or ["no-obvious-risk-keywords"],
            "urgency_level": urgency_level,
            "raw_response": {
                "recording_s3_key": recording_s3_key,
                "transcript_present": bool(transcript),
                "notes_present": bool(notes),
            },
        }

    def _infer_urgency(self, text: str, transcript: str | None) -> str:
        combined_text = f"{text} {transcript or ''}".lower()
        serious_keywords = (
            "urgent",
            "emergency",
            "immediate",
            "fall",
            "fainted",
            "breathing",
            "chest pain",
            "stroke",
            "unresponsive",
            "confused",
            "help",
        )
        if any(keyword in combined_text for keyword in serious_keywords):
            return "high"
        return "normal"

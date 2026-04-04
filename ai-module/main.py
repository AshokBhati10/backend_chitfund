from typing import Any, Dict, List

from fastapi import FastAPI
from pydantic import BaseModel, Field

from auctionModel import run_auction
from explain import generate_reason
from scoring import calculate_final_score, calculate_risk, calculate_urgency


class PredictRequest(BaseModel):
    transactions: List[Dict[str, Any]] = Field(default_factory=list)
    bankData: Dict[str, Any] = Field(default_factory=dict)
    creditData: Dict[str, Any] = Field(default_factory=dict)
    profile: Dict[str, Any] = Field(default_factory=dict)


app = FastAPI(title="AI Chit Fund Module", version="1.0.0")


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/predict")
def predict(payload: PredictRequest) -> Dict[str, Any]:
    urgency = calculate_urgency(payload.profile, payload.bankData)
    risk = calculate_risk(payload.creditData, payload.transactions)
    score = calculate_final_score(urgency, risk)

    reason = generate_reason(
        payload.profile,
        urgency,
        risk,
        payload.creditData.get("score", 0),
    )

    return {
        "urgency": urgency,
        "risk": risk,
        "score": score,
        "reason": reason,
    }


def process(members: List[Dict[str, Any]]) -> Dict[str, Any]:
    enriched_members = []

    for member in members:
        urgency = calculate_urgency(member, {})
        risk = float(member.get("risk", 0.5))
        enriched_members.append(
            {
                **member,
                "urgency": urgency,
                "risk": risk,
                "final_score": calculate_final_score(urgency, risk),
            }
        )

    winner = run_auction(enriched_members)
    if winner is None:
        return {"winner": None, "reason": "No members provided"}

    reason = generate_reason(
        winner,
        winner["urgency"],
        winner["risk"],
        winner.get("credit_score", 0),
    )

    return {
        "winner": winner["name"],
        "reason": reason,
    }
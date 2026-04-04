def generate_reason(profile, urgency, risk, credit_score):
    factors = []

    if profile.get("medical"):
        factors.append("medical need")
    if profile.get("salary") is False:
        factors.append("no salary")
    if profile.get("withdrawals"):
        factors.append("past withdrawals")

    if risk <= 0.35:
        risk_label = "low risk"
    elif risk <= 0.6:
        risk_label = "moderate risk"
    else:
        risk_label = "higher risk"

    base = f"AI model: urgency {int(round(urgency))}, {risk_label}, credit score {int(credit_score)}"

    if factors:
        return f"{base} ({', '.join(factors)})"
    return base
def generate_reason(member):
    reasons = []

    if member.get("medical"):
        reasons.append("medical emergency detected")
    if not member.get("salary"):
        reasons.append("no salary detected")

    return "Selected because " + ", ".join(reasons)
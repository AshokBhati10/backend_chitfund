def run_auction(members):
    for m in members:
        m["final_score"] = m["urgency"] * 0.6 + (1 - m["risk"]) * 0.4

    members.sort(key=lambda x: x["final_score"], reverse=True)
    return members[0]
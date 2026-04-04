from scoring import calculate_final_score


def rank_members(members):
    ranked = []
    for member in members:
        urgency = float(member.get("urgency", 0))
        risk = float(member.get("risk", 0.5))
        member_with_score = {
            **member,
            "final_score": calculate_final_score(urgency, risk),
        }
        ranked.append(member_with_score)

    ranked.sort(key=lambda item: item["final_score"], reverse=True)
    return ranked


def run_auction(members):
    ranked = rank_members(members)
    if not ranked:
        return None
    return ranked[0]
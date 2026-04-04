from auctionModel import run_auction
from scoring import calculate_urgency
from explain import generate_reason

def process(members):
    for m in members:
        m["urgency"] = calculate_urgency(m)

    winner = run_auction(members)
    reason = generate_reason(winner)

    return {
        "winner": winner["name"],
        "reason": reason
    }
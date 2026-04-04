def clamp(value, minimum, maximum):
	return max(minimum, min(maximum, value))


def round2(value):
	return round(float(value), 2)


def calculate_urgency(profile, bank_data):
	urgency = 0

	if profile.get("medical"):
		urgency += 50
	if profile.get("salary") is False:
		urgency += 30
	if profile.get("withdrawals"):
		urgency += 20

	income = float(bank_data.get("income", 0) or 0)
	expenses = float(bank_data.get("expenses", 0) or 0)
	balance = float(bank_data.get("balance", 0) or 0)

	if income > 0:
		expense_ratio = expenses / income
		if expense_ratio >= 1:
			urgency += 20
		elif expense_ratio >= 0.75:
			urgency += 10

	if balance < 10000:
		urgency += 10

	return clamp(urgency, 0, 100)


def calculate_risk(credit_data, transactions):
	risk_value = credit_data.get("risk")
	credit_score = float(credit_data.get("score", 0) or 0)

	if risk_value is None:
		if credit_score > 0:
			normalized_credit = clamp((credit_score - 300) / 600, 0, 1)
			risk_value = 1 - normalized_credit
		else:
			risk_value = 0.5

	base_risk = float(risk_value)

	tx_list = transactions if isinstance(transactions, list) else []
	failed_count = 0
	for tx in tx_list:
		status = str(tx.get("status", "")).lower()
		if status not in ("captured", "success", "ok"):
			failed_count += 1

	tx_risk = failed_count / len(tx_list) if tx_list else 0
	final_risk = base_risk * 0.8 + tx_risk * 0.2
	return clamp(round2(final_risk), 0, 1)


def calculate_final_score(urgency, risk):
	normalized_urgency = clamp(float(urgency), 0, 100)
	normalized_risk = clamp(float(risk), 0, 1)
	return round2(normalized_urgency * 0.6 + (1 - normalized_risk) * 0.4)

class PromptBuilder:
    def build(self, *, event: dict, profile: str) -> dict:
        rule = event["rule"]
        system_prompt = (
            "You are MatchMind One, an explainable football broadcast intelligence system. "
            "Be concise, truthful, grounded in the provided event and rule context, and never invent laws or facts. "
            "Return JSON with keys: headline, explanation, confidence, law_reference, evidence."
        )

        user_prompt = (
            f"Viewer profile: {profile}\n"
            f"Event title: {event['title']}\n"
            f"Event type: {event['type']}\n"
            f"Minute: {event['minute']}\n"
            f"Team: {event['team']}\n"
            f"Opponent: {event['opponent']}\n"
            f"Summary: {event['summary']}\n"
            f"Analysis: {event['analysis']}\n"
            f"Child summary: {event['child_summary']}\n"
            f"Trigger rule: {rule.get('trigger_summary', '')}\n"
            f"Silence rule: {rule.get('silence_summary', '')}\n"
            f"Prompt template: {rule['prompt_template']}\n"
            f"Retrieval sources: {', '.join(rule.get('retrieval_sources', []))}\n"
            f"Law reference: {event.get('law_reference') or 'none'}\n"
            "Explain why this moment matters right now for the specified viewer profile."
        )

        return {
            "system": system_prompt,
            "user": user_prompt,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": [{"type": "text", "text": user_prompt}]},
            ],
        }

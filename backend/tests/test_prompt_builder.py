from app.prompts.prompt_builder import PromptBuilder


def test_prompt_builder_includes_event_rule_context() -> None:
    builder = PromptBuilder()
    payload = builder.build(
        event={
            "title": "Penalty Awarded",
            "type": "penalty",
            "minute": 62,
            "team": "Blue City",
            "opponent": "Crimson United",
            "summary": "The defender made contact before winning the ball.",
            "analysis": "The recovery run arrived late.",
            "child_summary": "The defender hit the player first.",
            "law_reference": "Law 12",
            "rule": {
                "prompt_template": "officiating_decision",
                "trigger_summary": "Explain after the decision or replay confirms contact.",
                "silence_summary": "Stay silent if the contact is too uncertain.",
                "retrieval_sources": ["fifa_laws", "match_context"],
            },
        },
        profile="new_fan",
    )

    assert "Penalty Awarded" in payload["user"]
    assert "officiating_decision" in payload["user"]
    assert payload["messages"][0]["role"] == "system"
    assert payload["messages"][1]["role"] == "user"

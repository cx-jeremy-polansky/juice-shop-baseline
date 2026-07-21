"""Tiny inference entrypoint for the client's text service.

Wires the pinned dortucx model + tokenizer into a runnable pipeline. Referencing
the repo IDs here as well as in model_loader gives discovery a second, idiomatic
`from_pretrained` callsite to pick up.
"""

from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline

from src.model_loader import load_model, load_tokenizer, prefetch_model


def build_pipeline():
    """Build a text-generation pipeline from the pinned dortucx model."""
    model = AutoModelForCausalLM.from_pretrained("dortucx/unkindmodel", trust_remote_code=True)
    tokenizer = AutoTokenizer.from_pretrained("dortucx/unkindtokenizer")
    return pipeline("text-generation", model=model, tokenizer=tokenizer)


def main() -> None:
    """Prefetch, load, and run a smoke-test generation."""
    cache_path = prefetch_model()
    print(f"Model cached at: {cache_path}")

    # Loader-based path (used by the rest of the service).
    _model = load_model()
    _tokenizer = load_tokenizer()

    generator = build_pipeline()
    out = generator("Hello from the goat client:", max_new_tokens=16)
    print(out)


if __name__ == "__main__":
    main()

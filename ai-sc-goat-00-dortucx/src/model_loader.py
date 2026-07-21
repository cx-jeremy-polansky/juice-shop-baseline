"""Loads the production text model + tokenizer from the Hugging Face Hub.

The repo IDs are hardcoded literals on purpose: this is the client's pinned
model dependency, and it's what asset discovery scans the source for.
"""

from huggingface_hub import snapshot_download
from transformers import AutoModel, AutoTokenizer

# Pinned model dependencies (public HF repos).
MODEL_REPO = "dortucx/unkindmodel"
TOKENIZER_REPO = "dortucx/unkindtokenizer"


def prefetch_model() -> str:
    """Download the full model snapshot into the local cache and return its path."""
    return snapshot_download("dortucx/unkindmodel")


def load_model() -> object:
    """Load the pinned model with trust_remote_code (custom architecture)."""
    return AutoModel.from_pretrained(MODEL_REPO, trust_remote_code=True)


def load_tokenizer() -> object:
    """Load the matching tokenizer for the pinned model."""
    return AutoTokenizer.from_pretrained(TOKENIZER_REPO)

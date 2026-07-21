# Branch 00 — dortucx (live HF scan validation)

Minimal client codebase that loads **real, public, scannable** Hugging Face models
from the `dortucx` account. Unlike the synthetic `01`–`07` scenarios (which use
fictional `GoatModel` names), this branch references **actual HF repo IDs** so the
full pipeline can be validated end to end:

```
Pedro discovery (regex over this repo)
  -> emits AI Model assets: dortucx/unkindmodel, dortucx/unkindtokenizer
    -> ai-sc-risks filters to AI Model, passes HF URL
      -> LLM Scanner clones https://huggingface.co/dortucx/unkindmodel (anonymous, ungated)
        -> finds risks in the model repo  -> written to scan_risks
```

## Models referenced (all public + ungated → clone with no token)

| Repo ID | HF URL | Used in |
|---|---|---|
| `dortucx/unkindmodel` | https://huggingface.co/dortucx/unkindmodel | `src/model_loader.py`, `src/inference_service.py` |
| `dortucx/unkindtokenizer` | https://huggingface.co/dortucx/unkindtokenizer | `src/model_loader.py`, `src/inference_service.py` |

These are known-malicious fixtures (they back the LLM Scanner's own
`tests/integration/hf/unkindmodel.json` / `unkindtokenizer.json`), so a working
scan should return findings rather than an empty result.

## What this validates
- Discovery extracts literal HF repo IDs from `from_pretrained` / `snapshot_download`.
- ai-sc-risks treats them as AI Model assets and dispatches scanner Jobs.
- The LLM Scanner clones a public/ungated repo **without any HF token**, confirming
  the credential-free path works (vs. the gated-model `no credentials configured` skips).

## Run locally (optional)
```bash
pip install -r requirements.txt
python -m src.inference_service
```

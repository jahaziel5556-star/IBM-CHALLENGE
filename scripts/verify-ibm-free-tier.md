# IBM Free-Tier Verification

## Verified on June 30, 2026

- IBM public pricing page lists a free watsonx.ai plan with up to 300,000 foundation-model tokens per month.
- IBM public getting-started page directs builders to a free watsonx.ai trial and project-based onboarding.
- Granite usage should be implemented through `watsonx.ai` adapters in the backend.
- IBM docs for June 2026 show the `chat` API at `/ml/v1/text/chat`, and IBM's changelog notes that older infer-text endpoints are deprecated.

## Required local secrets before switching off mock mode

- `IBM_WATSONX_API_KEY`
- `IBM_WATSONX_PROJECT_ID`
- `IBM_WATSONX_URL`
- `IBM_WATSONX_MODEL_ID`
- `IBM_WATSONX_API_VERSION`

## Verified live integration notes

- The regional chat-model inventory should be queried before choosing `IBM_WATSONX_MODEL_ID`.
- On this project in `us-south`, `ibm/granite-3-8b-instruct` is chat-capable and available.
- `granite-3-2b-instruct` returned `403 Forbidden` for chat inference and should not be used as the default for this repository.

## Default implementation mode

`IBM_WATSONX_USE_MOCK=true`

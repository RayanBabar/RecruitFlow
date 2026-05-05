#!/usr/bin/env bash
# =============================================================================
#  Modal Setup Script — Smart Job Portal (vLLM)
#  Run this ONCE to authenticate and deploy the GPU function.
# =============================================================================
set -e

echo "🚀 Smart Job Portal — Modal vLLM GPU Setup"
echo "============================================"

# 1. Authenticate with Modal
echo ""
echo "Step 1: Authenticating with Modal..."
echo "   (A browser window will open. Log in and paste the token.)"
modal token new

# 2. Create the HuggingFace secret in Modal
echo ""
echo "Step 2: Storing HuggingFace token in Modal secrets..."
if [ -z "$HF_TOKEN" ]; then
    read -p "Enter your Hugging Face Token: " hf_token
else
    hf_token=$HF_TOKEN
fi
modal secret create huggingface-secret HF_TOKEN=$hf_token

echo "   ✅ Secret 'huggingface-secret' created."

# 3. Deploy the vLLM server
echo ""
echo "Step 3: Deploying vLLM server to Modal (first deploy downloads model ~16GB)..."
echo "   This may take 5-10 minutes on first deploy."
modal deploy modal/resume_analyzer.py

echo ""
echo "============================================"
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Copy the serve URL printed above (ends in .modal.run)"
echo "   2. Add it to your .env file:"
echo "      MODAL_ENDPOINT_URL=https://..."
echo "   3. Restart your FastAPI server"
echo ""
echo "💡 To test the endpoint:"
echo "   modal run modal/resume_analyzer.py"
echo ""
echo "💡 Or test with curl:"
echo '   curl -X POST <MODAL_URL>/v1/chat/completions \'
echo '     -H "Content-Type: application/json" \'
echo '     -d '"'"'{"model":"llm","messages":[{"role":"user","content":"Hello"}],"max_tokens":50}'"'"''

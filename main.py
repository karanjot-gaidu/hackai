# 

import modal
import io
from fastapi import Response, HTTPException, Query, Request
from datetime import datetime, timezone
import requests
import os

def download_model():
    from diffusers import AutoPipelineForText2Image
    import torch

    AutoPipelineForText2Image.from_pretrained("stabilityai/sdxl-turbo", torch_dtype=torch.float16, variant="fp16")

image = (modal.Image.debian_slim()
         .pip_install("fastapi[standard]", "transformers", "accelerate", "diffusers", "requests")
         .run_function(download_model))

app = modal.App("sd-demo", image=image)

@app.cls(
    image=image,
    gpu="A10G",
    container_idle_timeout=300
)
class Modal:
    @modal.build()
    @modal.enter()
    def load_weights(self):
        from diffusers import AutoPipelineForText2Image
        import torch

        self.pipe = AutoPipelineForText2Image.from_pretrained("stabilityai/sdxl-turbo", torch_dtype=torch.float16, variant="fp16")
        self.pipe.to("cuda")

    @modal.web_endpoint()
    def generate(self, request: Request, prompt: str = Query(..., description="The prompt for image generation")):
        image = self.pipe(prompt, num_inference_steps=1, guidance_scale=0.0).images[0]

        buffer = io.BytesIO()
        image.save(buffer, format="JPEG")
        return Response(content=buffer.getvalue(), media_type="image/jpeg")

    @modal.web_endpoint()
    def health(self):
        """Lightweight endpoint for keeping the container warm"""
        return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

@app.function(
    schedule=modal.Cron("*/5 * * * *")
)
def keep_warm():
    health_url = "https://karanjot-gaidu--sd-demo-modal-health.modal.run"
    
    try:
        # Just check the health endpoint
        health_response = requests.get(health_url, timeout=10)
        
        if health_response.status_code == 200:
            try:
                data = health_response.json()
                timestamp = data.get('timestamp', 'unknown')
                print(f"Health check at: {timestamp}")
            except (ValueError, KeyError):
                print(f"Health check successful at: {datetime.now(timezone.utc).isoformat()}")
        else:
            print(f"Health check failed with status: {health_response.status_code}")
            
        print(f"Container kept warm at: {datetime.now(timezone.utc).isoformat()}")
        
    except requests.exceptions.RequestException as e:
        print(f"Health check error: {e}")
    except Exception as e:
        print(f"Unexpected error in keep_warm: {e}")
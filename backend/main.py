
import base64
import json
import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI

load_dotenv()

app = FastAPI(title="StyleAI Clothing Recognition API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Development only
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI() if os.getenv("OPENAI_API_KEY") else None

@app.get("/health")
def health():
    return {"status": "StyleAI backend is running"}

@app.post("/analyze-clothing")
async def analyze_clothing(file: UploadFile = File(...)):
    if client is None:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY is missing in backend/.env",
        )

    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Upload a JPG, PNG, or WEBP image.",
        )

    image_bytes = await file.read()

    if not image_bytes or len(image_bytes) > 8 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Image must be smaller than 8 MB.",
        )

    mime_type = file.content_type
    encoded_image = base64.b64encode(image_bytes).decode("utf-8")
    image_data_url = f"data:{mime_type};base64,{encoded_image}"

    prompt = """
    Analyze the clothing item in this image.
    Return ONLY a valid JSON object with these fields:
    {
      "category": "Tops, Bottoms, Dresses, Shoes, or Other",
      "clothingType": "specific clothing name",
      "color": "main visible color",
      "style": "Casual, Formal, Party, Ethnic, Sporty, or Other",
      "description": "short description",
      "confidence": 0.0
    }
    Use confidence from 0 to 1.
    Do not guess details that are not visible.
    """

    try:
        response = client.responses.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
            input=[
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text", "text": prompt},
                        {
                            "type": "input_image",
                            "image_url": image_data_url,
                            "detail": "high",
                        },
                    ],
                }
            ],
        )

        result = json.loads(response.output_text)

        return {
            "success": True,
            "analysis": result,
        }

    except json.JSONDecodeError:
        raise HTTPException(
            status_code=502,
            detail="AI returned invalid JSON."
        )
    except Exception as e:
        print("OpenAI API error:", repr(e))
        raise HTTPException(
            status_code=502,
            detail=f"AI request failed: {str(e)}"
        )
